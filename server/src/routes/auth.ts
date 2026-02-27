import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login
);

// Google/Supabase Sync
router.post(
  '/google-sync',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('supabaseId').notEmpty().withMessage('Supabase ID is required'),
    body('username').optional().trim(),
  ],
  authController.googleSync
);

// Google Login (verify provider token on backend)
router.post(
  '/google-login',
  [body('accessToken').notEmpty().withMessage('Google access token is required'), body('username').optional().trim()],
  authController.googleLogin
);

// Get current user (protected)
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
