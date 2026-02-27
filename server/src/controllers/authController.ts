import { Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { AuthRequest } from '../middleware/auth';

interface GoogleTokenInfoResponse {
  audience?: string;
  issued_to?: string;
  email?: string;
  verified_email?: string | boolean;
}

interface GoogleUserInfoResponse {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

const normalizeUsername = (value: string): string => {
  const normalized = value.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  return normalized || 'user';
};

const buildUniqueUsername = async (seed: string): Promise<string> => {
  const baseUsername = normalizeUsername(seed);
  let finalUsername = baseUsername;
  let counter = 1;

  while (await User.findOne({ where: { username: finalUsername } })) {
    finalUsername = `${baseUsername}${counter}`;
    counter++;
  }

  return finalUsername;
};

const verifyGoogleAccessToken = async (accessToken: string) => {
  const tokenInfoUrl = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(accessToken)}`;
  const tokenInfoResponse = await fetch(tokenInfoUrl);

  if (!tokenInfoResponse.ok) {
    throw new Error('Invalid Google access token');
  }

  const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfoResponse;
  const expectedClientId = process.env.GOOGLE_CLIENT_ID;

  if (!expectedClientId) {
    throw new Error('Google OAuth backend is not configured');
  }

  if (tokenInfo.audience !== expectedClientId && tokenInfo.issued_to !== expectedClientId) {
    throw new Error('Google token audience mismatch');
  }

  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userInfoResponse.ok) {
    throw new Error('Unable to fetch Google user info');
  }

  const userInfo = (await userInfoResponse.json()) as GoogleUserInfoResponse;
  const email = userInfo.email || tokenInfo.email;
  const emailVerified =
    userInfo.email_verified === true ||
    tokenInfo.verified_email === true ||
    tokenInfo.verified_email === 'true';

  if (!email) {
    throw new Error('Google account missing email');
  }

  if (!emailVerified) {
    throw new Error('Google email is not verified');
  }

  return {
    email,
    name: userInfo.name,
    googleId: userInfo.sub,
  };
};

const createBackendToken = (user: User): string =>
  jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    (process.env.JWT_SECRET || 'secret') as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  );

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const existingUsername = await User.findOne({
      where: { username },
    });

    if (existingUsername) {
      res.status(400).json({ error: 'Username already taken' });
      return;
    }

    // Create new user (password will be hashed automatically by the model hook)
    const user = await User.create({
      email,
      username,
      password,
    });

    // Generate JWT token
    const token = createBackendToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = createBackendToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const googleSync = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, supabaseId, username } = req.body;

    // Check if user already exists
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Create new user if not exists
      // Ensure we don't hit unique constraint errors for username
      const finalUsername = await buildUniqueUsername(username || email.split('@')[0]);

      // Generate a random password since they use Google
      const randomPassword = Math.random().toString(36).slice(-10);
      user = await User.create({
        email,
        username: finalUsername,
        password: randomPassword,
      });
    }

    // Generate JWT token for our backend
    const token = createBackendToken(user);

    res.json({
      message: 'Google sync successful',
      token,
      user: user.toJSON(),
    });
  } catch (error: any) {
    console.error('Google sync error:', error);
    res.status(500).json({ error: 'Google sync failed' });
  }
};

export const googleLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { accessToken, username } = req.body as { accessToken: string; username?: string };
    const googleProfile = await verifyGoogleAccessToken(accessToken);

    let user = await User.findOne({ where: { email: googleProfile.email } });

    if (!user) {
      const finalUsername = await buildUniqueUsername(
        username || googleProfile.name || googleProfile.email.split('@')[0]
      );
      const randomPassword = Math.random().toString(36).slice(-10);

      user = await User.create({
        email: googleProfile.email,
        username: finalUsername,
        password: randomPassword,
      });
    }

    const token = createBackendToken(user);

    res.json({
      message: 'Google login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    const message = error instanceof Error ? error.message : 'Google login failed';
    const statusCode = message.includes('not configured') ? 500 : 401;
    res.status(statusCode).json({ error: message });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: user.toJSON() });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
