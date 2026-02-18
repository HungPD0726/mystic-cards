import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ReadingHistory } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Sparkles, Cloud, HardDrive, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DbReading {
  id: string;
  spread_type: string;
  spread_name: string;
  drawn_cards: any[];
  ai_interpretation: string | null;
  created_at: string;
}

const spreadLabels: Record<string, string> = {
  'one-card': '1 Lá',
  'three-card': '3 Lá',
  'yes-no': 'Yes-No',
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleString('vi-VN');
  } catch {
    return dateStr;
  }
};

const ReadingHistoryPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [dbReadings, setDbReadings] = useState<DbReading[]>([]);
  const [localHistory, setLocalHistory] = useState<ReadingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDbReadings = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('readings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDbReadings((data || []).map(r => ({ ...r, drawn_cards: r.drawn_cards as any[] })));
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải lịch sử từ cloud.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Always load local history
    try {
      const data = localStorage.getItem('tarot-reading-history');
      setLocalHistory(data ? JSON.parse(data) : []);
    } catch {
      setLocalHistory([]);
    }

    if (isAuthenticated) {
      loadDbReadings();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadDbReadings]);

  const deleteDbReading = async (id: string) => {
    try {
      const { error } = await supabase.from('readings').delete().eq('id', id);
      if (error) throw error;
      setDbReadings(prev => prev.filter(r => r.id !== id));
      toast.success('Đã xóa lịch sử.');
    } catch {
      toast.error('Không thể xóa. Vui lòng thử lại.');
    }
  };

  const deleteLocalReading = (id: string) => {
    const updated = localHistory.filter(h => h.id !== id);
    setLocalHistory(updated);
    localStorage.setItem('tarot-reading-history', JSON.stringify(updated));
  };

  const clearLocalHistory = () => {
    if (window.confirm('Xóa toàn bộ lịch sử cục bộ?')) {
      setLocalHistory([]);
      localStorage.setItem('tarot-reading-history', JSON.stringify([]));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Đang tải lịch sử...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen px-4 py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
          📋 Lịch sử xem bói
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isAuthenticated ? 'Lịch sử đã lưu trên cloud' : 'Đăng nhập để lưu lịch sử lên cloud'}
        </p>
      </motion.div>

      {/* Cloud history (authenticated) */}
      {isAuthenticated && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Cloud className="h-4 w-4 text-gold" />
            <h2 className="text-sm font-semibold text-gold uppercase tracking-wider">
              Cloud ({dbReadings.length})
            </h2>
          </div>

          {dbReadings.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-border/50 bg-card/50 py-10 text-center">
              <Sparkles className="mb-3 h-7 w-7 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Chưa có lịch sử trên cloud</p>
              <Link to="/reading">
                <Button className="mt-3" size="sm">Xem bói ngay</Button>
              </Link>
            </div>
          ) : (
            <motion.div
              className="grid gap-3"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {dbReadings.map((reading, idx) => (
                <motion.div
                  key={reading.id}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Card className="border-border/50 bg-card/50 p-4 hover:bg-card/80 transition-colors">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-gold/60">#{dbReadings.length - idx}</span>
                          <h3 className="text-sm font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                            {reading.spread_name}
                          </h3>
                          <span className="rounded bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground">
                            {spreadLabels[reading.spread_type] ?? reading.spread_type}
                          </span>
                          {reading.ai_interpretation && (
                            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                              ✨ AI
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(reading.created_at)}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(reading.drawn_cards as any[]).map((dc: any, i: number) => (
                            <div
                              key={i}
                              className={cn(
                                'rounded px-2 py-1 text-xs',
                                dc.orientation === 'upright'
                                  ? 'bg-accent/20 text-accent'
                                  : 'bg-destructive/20 text-destructive'
                              )}
                            >
                              <span className="font-medium">{dc.cardName}</span>
                              <span className="text-[10px] ml-1">
                                {dc.orientation === 'upright' ? '🔺' : '🔻'}
                              </span>
                            </div>
                          ))}
                        </div>
                        {reading.ai_interpretation && (
                          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                            {reading.ai_interpretation}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
                        onClick={() => deleteDbReading(reading.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      )}

      {/* Local history */}
      {localHistory.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Cục bộ ({localHistory.length})
              </h2>
            </div>
            <Button variant="destructive" size="sm" className="text-xs" onClick={clearLocalHistory}>
              Xóa tất cả
            </Button>
          </div>

          <motion.div
            className="grid gap-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {localHistory.map((reading, idx) => (
              <motion.div
                key={reading.id}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                <Card className="border-border/30 bg-card/30 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-foreground/70" style={{ fontFamily: 'Cinzel, serif' }}>
                          {reading.spreadName}
                        </h3>
                        <span className="rounded bg-secondary/30 px-2 py-0.5 text-xs text-muted-foreground">
                          {spreadLabels[reading.spreadType]}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(reading.date)}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {reading.drawnCards.map((dc, i) => (
                          <span key={i} className="text-xs text-muted-foreground">
                            {dc.cardName} {dc.orientation === 'upright' ? '🔺' : '🔻'}
                            {i < reading.drawnCards.length - 1 && ' · '}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
                      onClick={() => deleteLocalReading(reading.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {!isAuthenticated && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              <Link to="/login" className="text-gold hover:underline">Đăng nhập</Link> để lưu lên cloud và xem trên mọi thiết bị
            </p>
          )}
        </section>
      )}

      {/* Empty state for unauthenticated with no local history */}
      {!isAuthenticated && localHistory.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card/50 py-16 text-center"
        >
          <Sparkles className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">Bắt đầu xem bói để tích lũy lịch sử</p>
          <Link to="/reading">
            <Button className="mt-4">Xem bói ngay</Button>
          </Link>
          <Link to="/login" className="mt-2 text-xs text-gold hover:underline">
            Hoặc đăng nhập để xem lịch sử đã lưu
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default ReadingHistoryPage;
