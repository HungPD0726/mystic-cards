import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getReadingHistory } from '@/hooks/useTarotReading';
import { ReadingHistory } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Eye, Sparkles } from 'lucide-react';
import { getCardById } from '@/data/cards';
import { cn } from '@/lib/utils';

const ReadingHistoryPage = () => {
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHistory(getReadingHistory());
    setLoaded(true);
  }, []);

  const deleteReading = (id: string) => {
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('tarot-reading-history', JSON.stringify(updatedHistory));
  };

  const clearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử?')) {
      setHistory([]);
      localStorage.setItem('tarot-reading-history', JSON.stringify([]));
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const spreadLabels: Record<string, string> = {
    'one-card': '1 Lá',
    'three-card': '3 Lá',
    'yes-no': 'Yes-No',
  };

  if (!loaded) {
    return <div className="min-h-screen" />;
  }

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
            📋 Lịch sử xem bói
          </h1>
          {history.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAll}
              className="text-xs"
            >
              Xóa tất cả
            </Button>
          )}
        </div>
        <p className="mt-1 text-muted-foreground">
          {history.length === 0 ? 'Chưa có lịch sử' : `${history.length} lần xem bói`}
        </p>
      </motion.div>

      {history.length === 0 ? (
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
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {history.map((reading, idx) => (
            <motion.div
              key={reading.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="border-border/50 bg-card/50 p-4 hover:bg-card/80 transition-colors">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left: Date & Spread */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gold/60">#{history.length - idx}</span>
                      <h3 className="font-cinzel text-sm font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                        {reading.spreadName}
                      </h3>
                      <span className="rounded bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground">
                        {spreadLabels[reading.spreadType]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(reading.date)}</p>

                    {/* Cards preview */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {reading.drawnCards.map((dc, i) => {
                        const card = getCardById(dc.cardId);
                        if (!card) return null;
                        return (
                          <div
                            key={i}
                            className={cn(
                              'rounded px-2 py-1 text-xs',
                              dc.orientation === 'upright'
                                ? 'bg-accent/20 text-accent'
                                : 'bg-destructive/20 text-destructive'
                            )}
                          >
                            <span className="font-medium">{card.name}</span>
                            <span className="text-[10px] ml-1">
                              {dc.orientation === 'upright' ? '🔺' : '🔻'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex gap-2 sm:flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border/50 text-xs"
                      asChild
                    >
                      <Link to={`/reading/${reading.spreadType}/result?view=history&id=${reading.id}`}>
                        <Eye className="mr-1 h-3 w-3" />
                        Xem
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
                      onClick={() => deleteReading(reading.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ReadingHistoryPage;
