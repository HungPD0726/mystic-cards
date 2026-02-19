import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, BookOpen, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
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
          supabase
            .from('readings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase
            .from('readings')
            .select('created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
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
        data: {
          display_name: displayName.trim(),
          bio: bio.trim(),
        },
      });
      if (error) throw error;
      toast.success('Da cap nhat ho so thanh cong.');
    } catch (error: any) {
      toast.error(error.message || 'Khong the cap nhat ho so.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto min-h-[calc(100vh-64px)] px-4 py-10">
        <p className="text-muted-foreground">Dang tai thong tin tai khoan...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto min-h-[calc(100vh-64px)] px-4 py-10">
        <Card className="max-w-xl mx-auto border-border/60">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
              Ban chua dang nhap
            </h1>
            <p className="text-muted-foreground mb-4">
              Dang nhap de xem va quan ly thong tin ho so cua ban.
            </p>
            <Link to="/login">
              <Button>Dang nhap</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-[calc(100vh-64px)] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
            User Profile
          </h1>
          <p className="text-muted-foreground mt-1">Quan ly thong tin tai khoan va thong ke xem bai.</p>
        </div>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Thong tin tai khoan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  value={user.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg bg-muted/40 border border-border text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Ten hien thi</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nhap ten hien thi cua ban"
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Gioi thieu ngan</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Viet vai dong gioi thieu ve ban..."
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-foreground resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Tao tai khoan: {new Date(user.created_at).toLocaleDateString('vi-VN')}
                </p>
                <Button type="submit" disabled={saving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? 'Dang luu...' : 'Luu ho so'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Thong ke xem bai
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-4 bg-card/30">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tong luot xem bai</p>
              <p className="text-2xl font-semibold mt-1">{statsLoading ? '...' : readingCount}</p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-card/30">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Lan xem bai gan nhat</p>
              <p className="text-sm mt-2">
                {statsLoading
                  ? 'Dang tai...'
                  : latestReadingAt
                    ? new Date(latestReadingAt).toLocaleString('vi-VN')
                    : 'Chua co du lieu'}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;
