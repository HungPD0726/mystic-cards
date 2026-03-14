import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, RotateCcw, Save, Share2, Sparkles, Stars, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { saveReadingHistory } from '@/hooks/useTarotReading';
import { supabase } from '@/integrations/supabase/client';
import { generateTarotInterpretation } from '@/lib/geminiService';
import {
  buildReadingShareText,
  consumeAutoAI,
  loadCurrentReading,
  StoredReading,
} from '@/lib/readingSession';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/context/AuthContext';
import { publicAsset } from '@/lib/publicAsset';
import { TarotChat } from '@/components/TarotChat';

const ReadingResult = () => {
  const { spread: spreadId } = useParams<{ spread: string }>();
  const { isAuthenticated, user } = useAuth();
  const [reading, setReading] = useState<StoredReading | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const placeholderSrc = publicAsset('placeholder.svg');

  const generateAIInterpretation = useCallback(async (readingData: StoredReading) => {
    setIsLoadingAI(true);
    try {
      const interpretation = await generateTarotInterpretation(readingData.drawnCards, readingData.spreadName);
      setAiInterpretation(interpretation);
    } catch (error: unknown) {
      console.error('AI interpretation error:', error);
      const message = error instanceof Error ? error.message : 'Không thể kết nối AI. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setIsLoadingAI(false);
    }
  }, []);

  useEffect(() => {
    const storedReading = loadCurrentReading();
    if (!storedReading) {
      return;
    }

    setReading(storedReading);

    if (consumeAutoAI()) {
      generateAIInterpretation(storedReading);
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
          drawn_cards: reading.drawnCards as never,
          ai_interpretation: aiInterpretation || null,
        });

        if (error) throw error;

        setIsSaved(true);
        toast.success('Đã lưu trải bài vào tài khoản của bạn.');
      } catch (error) {
        console.error(error);
        toast.error('Lưu cloud thất bại. Vui lòng thử lại.');
      }
      return;
    }

    saveReadingHistory({
      id: Date.now().toString(),
      date: reading.createdAt,
      spreadType: reading.spreadType,
      spreadName: reading.spreadName,
      drawnCards: reading.drawnCards.map((card) => ({
        cardId: card.cardId,
        cardName: card.cardName,
        orientation: card.orientation,
        position: card.position,
      })),
    });

    setIsSaved(true);
    toast.success('Đã lưu vào lịch sử cục bộ. Đăng nhập để đồng bộ cloud.');
  };

  const handleShare = async () => {
    if (!reading) return;

    const shareText = buildReadingShareText(reading, aiInterpretation);

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Astral Arcana • ${reading.spreadName}`,
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Đã copy tóm tắt trải bài.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      toast.error('Không thể chia sẻ tóm tắt trải bài.');
    }
  };

  if (!reading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-foreground">Chưa có kết quả để hiển thị.</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Hãy hoàn tất một phiên rút bài trước, sau đó quay lại màn kết quả để xem phần luận giải.
        </p>
        <Link to="/reading">
          <Button>Bắt đầu một trải bài mới</Button>
        </Link>
      </div>
    );
  }

  const uprightCount = reading.drawnCards.filter((card) => card.orientation === 'upright').length;
  const reversedCount = reading.drawnCards.length - uprightCount;

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.16),transparent_42%),radial-gradient(circle_at_85%_18%,hsl(var(--primary)/0.14),transparent_28%),radial-gradient(circle_at_12%_90%,hsl(var(--accent)/0.14),transparent_26%)]" />

      <div className="container relative mx-auto px-4 py-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 max-w-5xl rounded-[30px] border border-border/60 bg-card/45 p-5 backdrop-blur md:p-7"
        >
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-background/40 px-4 py-1.5">
                <Stars className="h-4 w-4 text-gold" />
                <span className="text-xs uppercase tracking-[0.22em] text-gold/90">Reading Complete</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl" style={{ fontFamily: 'Cinzel, serif' }}>
                Kết quả trải bài
              </h1>
              <p className="mt-2 text-muted-foreground">{reading.spreadName}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Số lá bài</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{reading.drawnCards.length} lá</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Xuôi / Ngược</p>
                <p className="mt-1 text-sm font-semibold text-gold">
                  {uprightCount} / {reversedCount}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Luận giải AI</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {aiInterpretation ? 'Đã tạo' : 'Chưa tạo'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="mx-auto mb-6 grid max-w-5xl gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {reading.drawnCards.map((card, index) => (
            <motion.div
              key={`${card.position}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="group rounded-[26px] border border-border/60 bg-card/55 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_14px_34px_hsl(var(--gold)/0.12)]"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {card.position}
                </span>
                <Badge variant={card.orientation === 'reversed' ? 'destructive' : 'secondary'} className="text-[10px]">
                  {card.orientation === 'reversed' ? 'Ngược' : 'Xuôi'}
                </Badge>
              </div>

              <div className="overflow-hidden rounded-xl border border-border/60 bg-background/45 p-2">
                <img
                  src={card.imagePath}
                  alt={card.cardName}
                  className={cn(
                    'h-52 w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]',
                    card.orientation === 'reversed' && 'rotate-180',
                  )}
                  onError={(event) => {
                    (event.target as HTMLImageElement).src = placeholderSrc;
                  }}
                />
              </div>

              <p className="mt-3 text-center text-sm font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                {card.cardName}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mx-auto mb-6 max-w-5xl rounded-[30px] border border-purple-500/25 bg-card/50 p-5 md:p-6"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gold md:text-2xl" style={{ fontFamily: 'Cinzel, serif' }}>
              <Sparkles className="h-5 w-5" />
              Luận giải bằng AI
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
              <span className="text-sm">AI đang phân tích mạch năng lượng của trải bài này...</span>
            </div>
          )}

          {aiInterpretation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="whitespace-pre-wrap rounded-2xl border border-border/60 bg-background/45 p-4 text-sm leading-relaxed text-foreground/90"
            >
              {aiInterpretation}
            </motion.div>
          )}

          {!aiInterpretation && !isLoadingAI && (
            <p className="rounded-2xl border border-border/60 bg-background/45 p-4 text-sm text-muted-foreground">
              Tạo luận giải để AI tổng hợp các lá bài, mạch cảm xúc và gợi ý hành động thành một bản đọc liền mạch.
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mx-auto max-w-5xl rounded-[30px] border border-gold/25 bg-card/50 p-5 md:p-6"
        >
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gold md:text-2xl" style={{ fontFamily: 'Cinzel, serif' }}>
            <BarChart3 className="h-5 w-5" />
            Tóm tắt theo từng vị trí
          </h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reading.drawnCards.map((card, index) => (
              <div key={`${card.cardSlug}-${index}`} className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold/90">{card.position}</p>
                  <Badge variant={card.orientation === 'reversed' ? 'destructive' : 'secondary'} className="text-[10px]">
                    {card.orientation === 'reversed' ? 'Ngược' : 'Xuôi'}
                  </Badge>
                </div>

                <p className="text-sm font-semibold text-foreground">{card.cardName}</p>

                <div className="mt-2 flex flex-wrap gap-1">
                  {card.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="border-gold/20 text-[10px]">
                      {keyword}
                    </Badge>
                  ))}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  {card.orientation === 'upright' ? card.uprightMeaning : card.reversedMeaning}
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
            {isSaved ? 'Đã lưu' : 'Lưu lịch sử'}
          </Button>
          <Button onClick={handleShare} variant="outline" className="gap-2 border-gold/30 text-gold hover:bg-secondary">
            <Share2 className="h-4 w-4" />
            Chia sẻ tóm tắt
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
              Chọn trải bài khác
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

        {aiInterpretation && (
          <TarotChat 
            drawnCards={reading.drawnCards} 
            spreadName={reading.spreadName} 
            initialInterpretation={aiInterpretation} 
          />
        )}
      </div>
    </div>
  );
};

export default ReadingResult;
