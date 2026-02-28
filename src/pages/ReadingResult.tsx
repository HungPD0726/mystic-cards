import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ReadingHistory, Orientation } from '@/data/types';
import { Save, Share2, RotateCcw, Sparkles, Loader2, Stars, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateTarotInterpretation } from '@/lib/geminiService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { cn } from '@/lib/utils';

interface StoredCard {
  cardId: number;
  cardName: string;
  cardSlug: string;
  orientation: Orientation;
  position: string;
  imagePath: string;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  description: string;
}

interface StoredReading {
  spreadType: string;
  spreadName: string;
  drawnCards: StoredCard[];
}

const ReadingResult = () => {
  const { spread: spreadId } = useParams<{ spread: string }>();
  const { isAuthenticated, user } = useAuth();
  const [reading, setReading] = useState<StoredReading | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const generateAIInterpretation = useCallback(async (readingData: StoredReading) => {
    setIsLoadingAI(true);
    try {
      const interpretation = await generateTarotInterpretation(readingData.drawnCards, readingData.spreadName);
      setAiInterpretation(interpretation);
    } catch (err: any) {
      console.error('AI interpretation error:', err);
      toast.error(err.message || 'Không thể kết nối AI. Vui lòng thử lại.');
    } finally {
      setIsLoadingAI(false);
    }
  }, []);

  useEffect(() => {
    const data = sessionStorage.getItem('tarot-current-reading');
    if (data) {
      const parsed = JSON.parse(data);
      setReading(parsed);

      const autoAI = sessionStorage.getItem('tarot-auto-ai');
      if (autoAI) {
        sessionStorage.removeItem('tarot-auto-ai');
        generateAIInterpretation(parsed);
      }
    }
  }, [generateAIInterpretation]);

  const handleSave = async () => {
    if (!reading) return;

    if (isAuthenticated && user) {
      try {
        const { error } = await supabase.from('readings').insert({
          user_id: user.id,
          spread_type: reading.spreadType,
          spread_name: reading.spreadName,
          drawn_cards: reading.drawnCards as any,
          ai_interpretation: aiInterpretation || null,
        });
        if (error) throw error;
        setIsSaved(true);
        toast.success('Đã lưu lịch sử xem bói vào tài khoản!');
      } catch (err) {
        console.error(err);
        toast.error('Lỗi khi lưu. Vui lòng thử lại.');
      }
    } else {
      const history: ReadingHistory[] = JSON.parse(localStorage.getItem('tarot-reading-history') || '[]');
      const historyItem: ReadingHistory = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        spreadType: reading.spreadType as ReadingHistory['spreadType'],
        spreadName: reading.spreadName,
        drawnCards: reading.drawnCards.map((dc) => ({
          cardId: dc.cardId,
          cardName: dc.cardName,
          orientation: dc.orientation,
          position: dc.position,
        })),
      };
      history.unshift(historyItem);
      if (history.length > 50) history.pop();
      localStorage.setItem('tarot-reading-history', JSON.stringify(history));
      setIsSaved(true);
      toast.success('Đã lưu lịch sử! Đăng nhập để đồng bộ lên cloud ☁️');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Đã copy link!');
    } catch {
      toast.error('Không thể copy link');
    }
  };

  if (!reading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Không tìm thấy kết quả. Hãy thực hiện trải bài trước.</p>
        <Link to="/reading">
          <Button>Quay lại chọn trải bài</Button>
        </Link>
      </div>
    );
  }

  const uprightCount = reading.drawnCards.filter((dc) => dc.orientation === 'upright').length;
  const reversedCount = reading.drawnCards.length - uprightCount;

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.16),transparent_70%)]" />

      <div className="container relative mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 max-w-5xl rounded-3xl border border-border/60 bg-card/45 p-5 backdrop-blur md:p-7"
        >
          <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/50 px-4 py-1.5">
                <Stars className="h-4 w-4 text-gold" />
                <span className="text-xs uppercase tracking-[0.2em] text-gold/90">Reading Complete</span>
              </div>
              <h1 className="text-3xl font-bold text-gold md:text-4xl" style={{ fontFamily: 'Cinzel, serif' }}>
                Kết quả trải bài
              </h1>
              <p className="mt-2 text-muted-foreground">{reading.spreadName}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Số lá bài</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{reading.drawnCards.length} lá</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Xuôi / Ngược</p>
                <p className="mt-1 text-sm font-semibold text-gold">
                  {uprightCount} / {reversedCount}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Trạng thái AI</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{aiInterpretation ? 'Đã có luận giải' : 'Chưa tạo luận giải'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="mx-auto mb-6 grid max-w-5xl gap-4 sm:grid-cols-3"
        >
          {reading.drawnCards.map((dc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className="group rounded-2xl border border-border/60 bg-card/55 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_14px_34px_hsl(var(--gold)/0.12)]"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                  {dc.position}
                </span>
                <Badge variant={dc.orientation === 'reversed' ? 'destructive' : 'secondary'} className="text-[10px]">
                  {dc.orientation === 'reversed' ? 'Ngược' : 'Xuôi'}
                </Badge>
              </div>

              <div className="overflow-hidden rounded-xl border border-border/60 bg-background/45 p-2">
                <img
                  src={dc.imagePath}
                  alt={dc.cardName}
                  className={cn('h-52 w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]', dc.orientation === 'reversed' && 'rotate-180')}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>

              <p className="mt-3 text-center text-sm font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                {dc.cardName}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mx-auto mb-6 max-w-5xl rounded-3xl border border-purple-500/25 bg-card/50 p-5 md:p-6"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gold md:text-2xl" style={{ fontFamily: 'Cinzel, serif' }}>
              <Sparkles className="h-5 w-5" />
              🤖 Luận giải bằng AI
            </h2>

            {!aiInterpretation && !isLoadingAI && (
              <Button size="sm" onClick={() => generateAIInterpretation(reading)} className="gap-2 glow-gold">
                <Sparkles className="h-4 w-4" />
                Tạo luận giải
              </Button>
            )}
          </div>

          {isLoadingAI && (
            <div className="flex items-center gap-3 py-4 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">AI đang phân tích tổng thể trải bài của bạn...</span>
            </div>
          )}

          {aiInterpretation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-border/60 bg-background/45 p-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap"
            >
              {aiInterpretation}
            </motion.div>
          )}

          {!aiInterpretation && !isLoadingAI && (
            <p className="rounded-2xl border border-border/60 bg-background/45 p-4 text-sm text-muted-foreground">
              Nhấn "Tạo luận giải" để AI phân tích sâu hơn về mạch năng lượng, thông điệp chính và hướng hành động từ trải bài này.
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mx-auto max-w-5xl rounded-3xl border border-gold/25 bg-card/50 p-5 md:p-6"
        >
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gold md:text-2xl" style={{ fontFamily: 'Cinzel, serif' }}>
            <BarChart3 className="h-5 w-5" />
            ✨ Tóm tắt & Kết luận
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {reading.drawnCards.map((dc, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold/90">{dc.position}</p>
                  <Badge variant={dc.orientation === 'reversed' ? 'destructive' : 'secondary'} className="text-[10px]">
                    {dc.orientation === 'reversed' ? 'Ngược' : 'Xuôi'}
                  </Badge>
                </div>

                <p className="text-sm font-semibold text-foreground">{dc.cardName}</p>

                <div className="mt-2 flex flex-wrap gap-1">
                  {dc.keywords.map((kw) => (
                    <Badge key={kw} variant="secondary" className="border-gold/20 text-[10px]">
                      {kw}
                    </Badge>
                  ))}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  {dc.orientation === 'upright' ? dc.uprightMeaning : dc.reversedMeaning}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.26 }}
          className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-3 rounded-2xl border border-border/60 bg-card/45 p-4"
        >
          <Button onClick={handleSave} disabled={isSaved} className="gap-2 glow-gold">
            <Save className="h-4 w-4" />
            {isSaved ? 'Đã lưu ✓' : 'Lưu lịch sử'}
          </Button>
          <Button onClick={handleShare} variant="outline" className="gap-2 border-gold/30 text-gold hover:bg-secondary">
            <Share2 className="h-4 w-4" />
            Chia sẻ link
          </Button>
          <Link to={`/reading/${spreadId}`}>
            <Button variant="outline" className="gap-2 border-gold/30 text-gold hover:bg-secondary">
              <RotateCcw className="h-4 w-4" />
              Xem lại trải bài
            </Button>
          </Link>
          <Link to="/reading">
            <Button variant="outline" className="gap-2 border-gold/30 text-gold hover:bg-secondary">
              <RotateCcw className="h-4 w-4" />
              Bói lại
            </Button>
          </Link>
        </motion.div>

        {!isAuthenticated && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
            className="mt-4 text-center text-sm text-muted-foreground"
          >
            <Link to="/login" className="text-gold hover:underline">
              Đăng nhập
            </Link>{' '}
            để lưu lịch sử lên cloud và đồng bộ luận giải AI giữa các thiết bị.
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default ReadingResult;
