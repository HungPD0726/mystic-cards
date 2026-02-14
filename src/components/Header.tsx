import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, Home, History, LogIn, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/', label: 'Trang chủ', icon: Home },
  { to: '/reading', label: 'Xem bói', icon: Sparkles },
  { to: '/history', label: 'Lịch sử', icon: History },
  { to: '/cards', label: 'Thư viện', icon: BookOpen },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🔮</span>
          <span className="font-cinzel text-lg font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
            Mystic Tarot
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.to || 
              (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-secondary text-gold'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}

          {/* Auth buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border/50">
              <span className="flex items-center gap-1.5 px-2 py-1 text-sm text-purple-400">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ml-2 pl-2 border-l border-border/50',
                location.pathname === '/login' || location.pathname === '/register'
                  ? 'bg-secondary text-gold'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              )}
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
