import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ReadingHistory, Orientation } from '@/data/types';
import { Save, Share2, RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateTarotInterpretation } from '@/lib/geminiService';
import { useAuth } from '@/contexts/AuthContext';

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
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [reading, setReading] = useState<StoredReading | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const generateAIInterpretation = useCallback(async (readingData: StoredReading) => {
    setIsLoadingAI(true);
    try {
      const interpretation = await generateTarotInterpretation(
        readingData.drawnCards,
        readingData.spreadName
      );
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

      // Auto-trigger AI interpretation if flagged from ReadingDraw
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
      // Save to database
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
      // Fallback: save to localStorage
      const history: ReadingHistory[] = JSON.parse(localStorage.getItem('tarot-reading-history') || '[]');
      const historyItem: ReadingHistory = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        spreadType: reading.spreadType as ReadingHistory['spreadType'],
        spreadName: reading.spreadName,
        drawnCards: reading.drawnCards.map(dc => ({
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

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
          Kết quả trải bài
        </h1>
        <p className="mt-1 text-muted-foreground">{reading.spreadName}</p>
      </motion.div>

      {/* Cards display */}
      <div className="mx-auto mb-10 flex flex-col sm:flex-row items-center justify-center gap-6 max-w-4xl">
        {reading.drawnCards.map((dc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
              {dc.position}
            </span>
            <div className={`w-32 h-52 sm:w-40 sm:h-64 rounded-xl border-2 border-gold/60 overflow-hidden bg-card flex flex-col items-center justify-center p-2 ${dc.orientation === 'reversed' ? 'rotate-180' : ''}`}>
              <img
                src={dc.imagePath}
                alt={dc.cardName}
                className="h-3/4 w-auto object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
              />
              <p className="mt-1 text-center text-xs font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
                {dc.cardName}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {dc.orientation === 'reversed' && (
                <Badge variant="destructive" className="text-[10px]">Ngược</Badge>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Interpretation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-auto max-w-2xl mb-6"
      >
        <Card className="border-purple-500/30 bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gold flex items-center gap-2" style={{ fontFamily: 'Cinzel, serif' }}>
                <Sparkles className="h-5 w-5" />
                🤖 Luận giải bằng AI
              </h2>
              {!aiInterpretation && !isLoadingAI && (
                <Button
                  size="sm"
                  onClick={() => generateAIInterpretation(reading)}
                  className="glow-gold gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Tạo luận giải
                </Button>
              )}
            </div>

            {isLoadingAI && (
              <div className="flex items-center gap-3 text-muted-foreground py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">AI đang luận giải bài Tarot của bạn...</span>
              </div>
            )}

            {aiInterpretation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap"
              >
                {aiInterpretation}
              </motion.div>
            )}

            {!aiInterpretation && !isLoadingAI && (
              <p className="text-sm text-muted-foreground">
                Nhấn "Tạo luận giải" để AI phân tích và đưa ra thông điệp sâu sắc từ trải bài của bạn.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-auto max-w-2xl"
      >
        <Card className="border-gold/30 bg-card">
          <CardContent className="p-6">
            <h2 className="mb-4 text-xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
              ✨ Tóm tắt & Kết luận
            </h2>
            <div className="space-y-4 text-sm text-foreground/90">
              {reading.drawnCards.map((dc, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-gold/80" style={{ fontFamily: 'Cinzel, serif' }}>
                    {dc.position} — {dc.cardName} {dc.orientation === 'reversed' ? '(Ngược)' : '(Xuôi)'}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-1 mb-1">
                    {dc.keywords.map(kw => (
                      <Badge key={kw} variant="secondary" className="text-[10px] border-gold/20">{kw}</Badge>
                    ))}
                  </div>
                  <p>{dc.orientation === 'upright' ? dc.uprightMeaning : dc.reversedMeaning}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-wrap justify-center gap-3"
      >
        <Button onClick={handleSave} disabled={isSaved} className="gap-2 glow-gold">
          <Save className="h-4 w-4" />
          {isSaved ? 'Đã lưu ✓' : 'Lưu lịch sử'}
        </Button>
        <Button onClick={handleShare} variant="outline" className="gap-2 border-gold/30 text-gold hover:bg-secondary">
          <Share2 className="h-4 w-4" />
          Chia sẻ link
        </Button>
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
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-4"
        >
          💡{' '}
          <Link to="/login" className="text-gold hover:underline">
            Đăng nhập
          </Link>{' '}
          để lưu lịch sử lên cloud và sử dụng AI luận giải đầy đủ
        </motion.p>
      )}
    </div>
  );
};

export default ReadingResult;
