import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Sparkles, Eye, EyeOff, Mail, Lock, Github, ArrowRight } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/button';

const Login = () => {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, loginWithGithub } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordChecks = useMemo(
    () => [
      { label: 'Tối thiểu 8 ký tự', pass: password.length >= 8 },
      { label: 'Có chữ in hoa', pass: /[A-Z]/.test(password) },
      { label: 'Có số', pass: /\d/.test(password) },
    ],
    [password]
  );

  const canSubmit = !loading && !googleLoading && !githubLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      toast.error('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!isLogin && password.length < 8) {
      toast.error('Mật khẩu phải có tối thiểu 8 ký tự.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(normalizedEmail, password);
        toast.success('Đăng nhập thành công.');
        navigate('/');
      } else {
        const result = await register(normalizedEmail, password);
        if (result.emailConfirmationRequired) {
          toast.success('Đăng ký thành công. Vui lòng xác nhận email.');
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
          return;
        }

        toast.success('Đăng ký thành công.');
        navigate('/');
      }
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : 'Xác thực thất bại.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : 'Đăng nhập Google thất bại.';
      toast.error(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setGithubLoading(true);
    try {
      await loginWithGithub();
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : 'Đăng nhập GitHub thất bại.';
      toast.error(message);
    } finally {
      setGithubLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="overflow-hidden rounded-2xl border border-border/50 bg-card/85 shadow-2xl backdrop-blur-xl"
        >
          <div className="border-b border-border/50 px-6 pt-8 pb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/35 bg-gold/10">
              <Sparkles className="h-6 w-6 text-gold" />
            </div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
              Mystic Cards
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLogin ? 'Đăng nhập để tiếp tục hành trình Tarot.' : 'Tạo tài khoản để lưu lịch sử và đồng bộ cloud.'}
            </p>
          </div>

          <div className="px-6 pt-5">
            <div className="grid grid-cols-2 rounded-xl border border-border/60 bg-background/40 p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isLogin ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  !isLogin ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Đăng ký
              </button>
            </div>
          </div>

          <div className="px-6 pt-5">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={!canSubmit}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/40 text-sm font-medium text-foreground transition hover:bg-secondary/40 disabled:opacity-60"
              >
                {googleLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleGithubLogin}
                disabled={!canSubmit}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/40 text-sm font-medium text-foreground transition hover:bg-secondary/40 disabled:opacity-60"
              >
                {githubLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                ) : (
                  <Github className="h-4 w-4" />
                )}
                <span>GitHub</span>
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">hoặc tiếp tục với email</span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border/60 bg-background/60 pl-10 pr-4 text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border/60 bg-background/60 pl-10 pr-12 text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Xác nhận mật khẩu
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-11 w-full rounded-xl border border-border/60 bg-background/60 pl-10 pr-4 text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-background/40 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Độ mạnh mật khẩu
                      </p>
                      <div className="space-y-1.5">
                        {passwordChecks.map((item) => (
                          <div key={item.label} className="flex items-center gap-2 text-xs">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                item.pass ? 'bg-emerald-400' : 'bg-muted-foreground/40'
                              }`}
                            />
                            <span className={item.pass ? 'text-foreground' : 'text-muted-foreground'}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={!canSubmit}
                className="mt-1 h-11 w-full rounded-xl bg-gradient-to-r from-primary to-accent text-base font-semibold text-primary-foreground transition hover:opacity-90"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <span className="inline-flex items-center gap-2">
                    {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
