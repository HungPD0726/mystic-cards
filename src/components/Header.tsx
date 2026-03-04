import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, Home, History, LogIn, LogOut, User, Compass, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/context/AuthContext';

const navItems = [
  { to: '/', label: 'Trang chủ', icon: Home },
  { to: '/reading', label: 'Xem bói', icon: Sparkles },
  { to: '/zodiac', label: 'Cung hoàng đạo', icon: Sun },
  { to: '/sky-360', label: 'Bầu trời 360', icon: Compass },
  { to: '/history', label: 'Lịch sử', icon: History },
  { to: '/cards', label: 'Thư viện', icon: BookOpen },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayName = (user?.user_metadata?.display_name as string) || user?.email?.split('@')[0] || 'Người dùng';

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto h-16 px-4">
        <div className="flex h-full items-center justify-between gap-3">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gold/40 bg-gradient-to-br from-amber-300/20 to-purple-500/15 shadow-[0_0_20px_hsl(var(--gold)/0.18)]">
              <img src="/brand-mark.svg" alt="Astral Arcana" className="h-8 w-8" />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-[0.22em] text-gold/80">Tarot / Zodiac</p>
              <p
                className="text-base font-semibold text-foreground transition-colors group-hover:text-gold"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                Astral Arcana
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 rounded-full border border-border/70 bg-card/70 px-1.5 py-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-secondary text-gold'
                      : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className={cn(
                    'ml-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                    location.pathname === '/profile'
                      ? 'bg-secondary text-gold'
                      : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground',
                  )}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden max-w-[120px] truncate lg:inline">{displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Đăng xuất</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={cn(
                  'ml-1 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                  location.pathname === '/login' || location.pathname === '/register'
                    ? 'bg-secondary text-gold'
                    : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground',
                )}
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden lg:inline">Đăng nhập</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
