import { Link, useLocation } from 'react-router-dom';
import { Sparkles, BookOpen, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Trang chủ', icon: Home },
  { to: '/reading', label: 'Xem bói', icon: Sparkles },
  { to: '/cards', label: 'Thư viện', icon: BookOpen },
];

export function Header() {
  const location = useLocation();

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
        </nav>
      </div>
    </header>
  );
}
