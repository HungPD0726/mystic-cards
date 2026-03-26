import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Calendar, BookOpen, Save, Sparkles, LogOut, 
  Heart, History, Settings, ChevronRight, Star, Clock, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { zodiacSigns, getCurrentSignIdByDate } from '@/data/zodiac';
import { allCards } from '@/data/cards';

const Profile = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  
  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [zodiacSign, setZodiacSign] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Stats & Data state
  const [readingCount, setReadingCount] = useState(0);
  const [latestReadingAt, setLatestReadingAt] = useState<string | null>(null);
  const [recentReadings, setRecentReadings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setDisplayName(data.display_name || '');
          setBio(data.bio || '');
          setBirthDate(data.birth_date || '');
          setZodiacSign(data.zodiac_sign || '');
        } else {
          // Initialize from auth metadata if profile doesn't exist
          setDisplayName((user.user_metadata?.display_name as string) || (user.user_metadata?.full_name as string) || '');
          setBio((user.user_metadata?.bio as string) || '');
        }
      } catch (error) {
        console.error('Fetch profile failed:', error);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const loadStatsAndData = async () => {
      if (!user) return;
      setStatsLoading(true);
      setDataLoading(true);
      
      try {
        // 1. Stats
        const [{ count, error: countError }, { data: latest, error: latestError }] = await Promise.all([
          supabase.from('readings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('readings').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        ]);
        
        if (countError) throw countError;
        setReadingCount(count ?? 0);
        setLatestReadingAt(latest?.created_at ?? null);
        setStatsLoading(false);

        // 2. Recent Readings
        const { data: readingsData, error: readingsError } = await supabase
          .from('readings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (readingsError) throw readingsError;
        setRecentReadings(readingsData || []);

        // 3. Favorites
        const { data: favsData, error: favsError } = await supabase
          .from('favorite_cards')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (favsError) throw favsError;
        
        // Map slug to card data
        const enrichedFavs = (favsData || []).map(f => {
          const card = allCards.find(c => c.slug === f.card_slug);
          return { ...f, card };
        }).filter(f => f.card);
        
        setFavorites(enrichedFavs);
        
      } catch (error) {
        console.error('Load profile data failed:', error);
      } finally {
        setStatsLoading(false);
        setDataLoading(false);
      }
    };
    
    loadStatsAndData();
  }, [user]);

  // Auto-calculate zodiac sign when birthDate changes
  useEffect(() => {
    if (birthDate) {
      const date = new Date(birthDate);
      if (!isNaN(date.getTime())) {
        const signId = getCurrentSignIdByDate(date);
        setZodiacSign(signId);
      }
    }
  }, [birthDate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName.trim(),
          bio: bio.trim(),
          birth_date: birthDate || null,
          zodiac_sign: zodiacSign || null,
          updated_at: new Date().toISOString(),
        });
        
      if (error) throw error;
      
      // Also update auth metadata for consistency
      await supabase.auth.updateUser({
        data: { display_name: displayName.trim(), bio: bio.trim() },
      });
      
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
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto min-h-[calc(100vh-64px)] px-4 py-10 flex items-center justify-center">
        <Card className="max-w-md w-full border-gold/20 bg-card/60 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-gold/30 bg-gold/5 mb-6 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
              <User className="w-10 h-10 text-gold" />
            </div>
            <h1 className="text-2xl font-bold mb-3 text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
              Bạn chưa đăng nhập
            </h1>
            <p className="text-muted-foreground mb-8">
              Khám phá thế giới huyền bí và lưu giữ hành trình của riêng bạn. Hãy đăng nhập để tiếp tục.
            </p>
            <div className="space-y-4">
              <Link to="/login" className="block w-full">
                <Button className="w-full glow-gold py-6 text-lg">Đăng nhập ngay</Button>
              </Link>
              <Link to="/register" className="block w-full">
                <Button variant="outline" className="w-full border-gold/30 text-gold hover:bg-gold/5 py-6">Tạo tài khoản mới</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = (displayName || user.email?.split('@')[0] || 'U').slice(0, 2).toUpperCase();
  const memberSince = new Date(user.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  const activeZodiac = zodiacSigns.find(s => s.id === zodiacSign);

  return (
    <div className="container mx-auto min-h-[calc(100vh-64px)] px-4 py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        
        {/* Profile Header Card */}
        <div className="relative rounded-3xl border border-gold/20 bg-card/40 backdrop-blur-2xl overflow-hidden shadow-2xl">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[120%] bg-gold/5 blur-[100px] rounded-full rotate-12" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[30%] h-[100%] bg-primary/5 blur-[80px] rounded-full" />
          </div>

          <div className="h-32 bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-950 relative">
            <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
          </div>

          <div className="px-8 pb-8 -mt-12 relative">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-card shadow-2xl ring-2 ring-gold/20">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-900 via-purple-900 to-gold/20 text-white text-3xl font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Settings className="w-8 h-8 text-white/80" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                    {displayName || user.email?.split('@')[0]}
                  </h1>
                  {activeZodiac && (
                    <Badge className="bg-gold/10 text-gold border-gold/20 hover:bg-gold/20 transition-colors py-1 px-3">
                      {activeZodiac.symbol} {activeZodiac.name}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-gold/60" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gold/60" />
                    Thành viên từ {memberSince}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full border-destructive/20 text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/40 transition-all">
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar: Stats & Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <Card className="border-gold/10 bg-card/40 backdrop-blur-xl hover:border-gold/30 transition-all group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Tổng lượt xem</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {statsLoading ? '...' : readingCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 bg-gold/20 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Card>

              <Card className="border-gold/10 bg-card/40 backdrop-blur-xl hover:border-gold/30 transition-all group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Gần đây nhất</p>
                      <p className="text-lg font-bold text-foreground mt-1 truncate max-w-[120px]">
                        {statsLoading ? '...' : latestReadingAt ? new Date(latestReadingAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' }) : 'Chưa có'}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Card>
            </div>

            {activeZodiac && (
              <Card className="border-gold/10 bg-card/40 backdrop-blur-xl overflow-hidden relative group">
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                   <img src={activeZodiac.imagePath} alt="" className="w-full h-full object-cover grayscale" />
                </div>
                <CardHeader className="relative">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold" />
                    Cung hoàng đạo
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gold">{activeZodiac.name}</span>
                    <span className="text-3xl">{activeZodiac.symbol}</span>
                  </div>
                  <p className="text-sm text-muted-foreground italic line-clamp-3">
                    "{activeZodiac.strength}"
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto text-gold hover:text-gold/80 transition-colors">
                    <Link to="/zodiac" className="flex items-center gap-1 text-xs uppercase tracking-widest font-bold">
                      Chi tiết cung <ChevronRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Tabs Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="w-full bg-card/30 border border-gold/10 p-1 h-14 mb-6 rounded-2xl backdrop-blur-xl">
                <TabsTrigger value="info" className="flex-1 rounded-xl data-[state=active]:bg-gold/10 data-[state=active]:text-gold transition-all py-2.5">
                  <Info className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Thông tin</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 rounded-xl data-[state=active]:bg-gold/10 data-[state=active]:text-gold transition-all py-2.5">
                  <History className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Lịch sử</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex-1 rounded-xl data-[state=active]:bg-gold/10 data-[state=active]:text-gold transition-all py-2.5">
                  <Heart className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Yêu thích</span>
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="info">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <Card className="border-gold/10 bg-card/40 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <Settings className="w-5 h-5 text-gold" />
                          Chỉnh sửa hồ sơ
                        </CardTitle>
                        <CardDescription>Cập nhật thông tin cá nhân để trải nghiệm tốt hơn.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <User className="w-3.5 h-3.5" /> Tên hiển thị
                              </label>
                              <input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Tên của bạn..."
                                className="w-full px-4 py-3 rounded-2xl bg-background/40 border border-gold/10 focus:ring-2 focus:ring-gold/20 focus:border-gold/30 outline-none transition-all text-foreground"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Ngày sinh
                              </label>
                              <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-background/40 border border-gold/10 focus:ring-2 focus:ring-gold/20 focus:border-gold/30 outline-none transition-all text-foreground color-scheme-dark"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5" /> Giới thiệu bản thân
                            </label>
                            <textarea
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              rows={4}
                              placeholder="Kể về hành trình tâm linh của bạn..."
                              className="w-full px-4 py-3 rounded-2xl bg-background/40 border border-gold/10 focus:ring-2 focus:ring-gold/20 focus:border-gold/30 outline-none transition-all text-foreground resize-none"
                            />
                          </div>

                          <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={saving} className="px-8 py-6 rounded-full glow-gold font-bold text-lg">
                              {saving ? (
                                <span className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Đang lưu...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <Save className="w-5 h-5" />
                                  Lưu thay đổi
                                </span>
                              )}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="history">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    {dataLoading ? (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-muted-foreground">Đang tải lịch sử...</p>
                      </div>
                    ) : recentReadings.length > 0 ? (
                      recentReadings.map((reading, idx) => (
                        <Card key={reading.id} className="border-gold/10 bg-card/30 backdrop-blur-lg hover:border-gold/30 transition-all cursor-pointer group overflow-hidden">
                          <CardContent className="p-5 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gold/5 border border-gold/20 flex items-center justify-center text-gold font-bold text-xl group-hover:scale-110 transition-transform">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-foreground flex items-center gap-2">
                                Trải bài {reading.spread_id}
                                <Badge variant="secondary" className="text-[10px] py-0 h-4 border-gold/10">
                                  {reading.is_ai_interpreted ? 'AI' : 'Cơ bản'}
                                </Badge>
                              </h3>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                <Clock className="w-3 h-3" />
                                {new Date(reading.created_at).toLocaleString('vi-VN', { 
                                  day: 'numeric', month: 'long', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-gold/60 group-hover:text-gold" asChild>
                              <Link to={`/reading/result/${reading.id}`}>
                                <ChevronRight className="w-6 h-6" />
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="py-20 text-center space-y-4 border-2 border-dashed border-gold/10 rounded-3xl bg-gold/5">
                        <div className="w-16 h-16 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center mx-auto">
                          <History className="w-8 h-8 text-gold/40" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-foreground">Chưa có lịch sử xem bài</p>
                          <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                            Hãy bắt đầu hành trình khám phá tương lai bằng cách thực hiện lượt xem bài đầu tiên.
                          </p>
                        </div>
                        <Button asChild className="glow-gold rounded-full px-8">
                          <Link to="/reading">Bắt đầu ngay</Link>
                        </Button>
                      </div>
                    )}
                    {recentReadings.length > 0 && (
                      <div className="text-center pt-4">
                        <Button variant="ghost" asChild className="text-gold hover:text-gold/80 font-bold uppercase tracking-widest text-xs">
                          <Link to="/history">Xem tất cả lịch sử <ChevronRight className="w-4 h-4 ml-1" /></Link>
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>

                <TabsContent value="favorites">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    {dataLoading ? (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-muted-foreground">Đang tải bài yêu thích...</p>
                      </div>
                    ) : favorites.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {favorites.map((fav) => (
                          <Link key={fav.id} to={`/cards/${fav.card_slug}`} className="group">
                            <Card className="border-gold/10 bg-card/30 backdrop-blur-lg overflow-hidden hover:border-gold/40 transition-all shadow-lg hover:shadow-gold/5">
                              <div className="aspect-[2/3] relative overflow-hidden">
                                <img 
                                  src={fav.card.imagePath} 
                                  alt={fav.card.name} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                <div className="absolute bottom-2 left-2 right-2">
                                  <p className="text-white text-xs font-bold truncate" style={{ fontFamily: 'Cinzel, serif' }}>
                                    {fav.card.name}
                                  </p>
                                </div>
                                <div className="absolute top-2 right-2">
                                  <Star className="w-4 h-4 text-gold fill-gold" />
                                </div>
                              </div>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center space-y-4 border-2 border-dashed border-gold/10 rounded-3xl bg-gold/5">
                        <div className="w-16 h-16 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center mx-auto">
                          <Heart className="w-8 h-8 text-gold/40" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-foreground">Chưa có bài yêu thích</p>
                          <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                            Lưu lại những lá bài có ý nghĩa đặc biệt với bạn trong Thư viện bài.
                          </p>
                        </div>
                        <Button asChild className="glow-gold rounded-full px-8">
                          <Link to="/cards">Khám phá thư viện</Link>
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;

