import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, BookOpen, Save, Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [readingCount, setReadingCount] = useState(0);
  const [latestReadingAt, setLatestReadingAt] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName((user.user_metadata?.display_name as string) || '');
    setBio((user.user_metadata?.bio as string) || '');
  }, [user]);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      setStatsLoading(true);
      try {
        const [{ count, error: countError }, { data: latest, error: latestError }] = await Promise.all([
          supabase.from('readings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('readings').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        ]);
        if (countError) throw countError;
        if (latestError) throw latestError;
        setReadingCount(count ?? 0);
        setLatestReadingAt(latest?.created_at ?? null);
      } catch (error) {
        console.error('Load profile stats failed:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim(), bio: bio.trim() },
      });
      if (error) throw error;
      toast.success('Đã cập nhật hồ sơ thành công.');
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto min-h-[calc(100vh-64px)] px-4 py-10 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto min-h-[calc(100vh-64px)] px-4 py-10 flex items-center justify-center">
        <Card className="max-w-md w-full border-border/40">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-primary/30 bg-primary/10 mb-5">
              <User className="w-6 h-6 text-gold" />
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
              Bạn chưa đăng nhập
            </h1>
            <p className="text-muted-foreground mb-5 text-sm">
              Đăng nhập để xem và quản lý thông tin hồ sơ.
            </p>
            <Link to="/login">
              <Button className="glow-gold">Đăng nhập</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = (displayName || user.email?.split('@')[0] || 'U').slice(0, 2).toUpperCase();
  const memberSince = new Date(user.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container mx-auto min-h-[calc(100vh-64px)] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
        {/* Profile hero */}
        <div className="relative rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden">
          {/* Decorative top gradient */}
          <div className="h-24 bg-gradient-to-r from-accent/30 via-primary/20 to-accent/30 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/60" />
          </div>

          <div className="px-6 pb-6 -mt-10 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              <Avatar className="w-20 h-20 border-4 border-card shadow-xl">
                <AvatarFallback className="bg-gradient-to-br from-primary/40 to-accent/40 text-foreground text-xl font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left pb-1">
                <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                  {displayName || user.email?.split('@')[0]}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Thành viên từ {memberSince}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/40">
                <LogOut className="w-3.5 h-3.5" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Tổng lượt xem bài</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">{statsLoading ? '...' : readingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Lần xem gần nhất</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {statsLoading ? '...' : latestReadingAt ? new Date(latestReadingAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Chưa có'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit form */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-gold" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </label>
                <input
                  value={user.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/40 text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tên hiển thị</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nhập tên hiển thị"
                  className="w-full px-4 py-3 rounded-xl bg-background/60 border border-border/60 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all text-foreground placeholder:text-muted-foreground/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Giới thiệu ngắn</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Viết vài dòng giới thiệu về bạn..."
                  className="w-full px-4 py-3 rounded-xl bg-background/60 border border-border/60 focus:ring-2 focus:ring-primary/40 focus:border-primary/50 outline-none transition-all text-foreground resize-none placeholder:text-muted-foreground/60"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="gap-2 glow-gold">
                  <Save className="w-4 h-4" />
                  {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;
