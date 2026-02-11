import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { saveReadingHistory } from '@/hooks/useTarotReading';
import { ReadingHistory, Orientation } from '@/data/types';
import { Save, Share2, RotateCcw } from 'lucide-react';

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
  const [reading, setReading] = useState<StoredReading | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('tarot-current-reading');
    if (data) {
      setReading(JSON.parse(data));
    }
  }, []);

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

  const handleSave = () => {
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
    saveReadingHistory(historyItem);
    toast.success('Đã lưu lịch sử xem bói!');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã copy link!');
    } catch {
      toast.error('Không thể copy link');
    }
  };

  const generateSummary = () => {
    return reading.drawnCards
      .map(dc => {
        const meaning = dc.orientation === 'upright' ? dc.uprightMeaning : dc.reversedMeaning;
        return `**${dc.position}** (${dc.cardName}${dc.orientation === 'reversed' ? ' – Ngược' : ''}): ${meaning}`;
      })
      .join('\n\n');
  };

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
        <Button onClick={handleSave} className="gap-2 glow-gold">
          <Save className="h-4 w-4" />
          Lưu lịch sử
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
    </div>
  );
};

export default ReadingResult;
