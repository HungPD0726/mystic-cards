import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!isLogin && password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Đăng nhập thành công! 🎉');
      } else {
        await register(email, password);
        toast.success('Đăng ký thành công! Vui lòng kiểm tra email 🎉');
      }
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Xác thực thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // Supabase OAuth redirects, so we may not reach here
    } catch (err) {
      toast.error('Đăng nhập Google thất bại');
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-background/50 border border-border focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-foreground placeholder:text-muted-foreground";

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] rounded-full -z-10 animate-pulse-slow"
        style={{ background: 'hsl(var(--mystic-purple) / 0.25)' }}
      />

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 mb-4 shadow-lg shadow-purple-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
              {isLogin ? '🔮 Đăng Nhập' : '🌟 Đăng Ký'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? 'Đăng nhập để lưu lại lịch sử xem bài'
                : 'Tạo tài khoản để khám phá thế giới Tarot'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputClass}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Confirm Password - only for Register */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={inputClass}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 mt-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25"
            >
              {loading
                ? '⏳ Đang xử lý...'
                : isLogin ? '✨ Đăng nhập' : '🔮 Tạo tài khoản'
              }
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">Hoặc tiếp tục với</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg bg-card border border-border hover:bg-secondary/50 transition-all font-medium text-foreground shadow-sm disabled:opacity-50"
          >
            {googleLoading ? (
              <span className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>Google</span>
          </button>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-gold hover:text-gold/80 hover:underline transition-colors"
              >
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
