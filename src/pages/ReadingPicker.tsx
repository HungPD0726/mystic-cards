import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { spreads } from '@/data/spreads';
import { ArrowRight, Sparkles } from 'lucide-react';

const ReadingPicker = () => {
  return (
    <div className="container mx-auto min-h-screen px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mb-10 max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/40 px-4 py-1.5">
          <Sparkles className="h-4 w-4 text-gold" />
          <span className="text-xs uppercase tracking-[0.2em] text-gold/90">Tarot Spread Selector</span>
        </div>
        <h1 className="text-3xl font-bold text-gold md:text-4xl" style={{ fontFamily: 'Cinzel, serif' }}>
          Chọn Kiểu Trải Bài
        </h1>
        <p className="mt-2 text-muted-foreground">Mỗi kiểu trải bài phù hợp với một dạng câu hỏi khác nhau.</p>
      </motion.div>

      <div className="mx-auto grid max-w-4xl gap-5">
        {spreads.map((spread, i) => (
          <motion.div
            key={spread.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="overflow-hidden border-border/60 bg-card/60 transition-all hover:border-gold/45 hover:shadow-[0_0_30px_hsl(var(--gold)/0.12)]">
              <CardContent className="p-0">
                <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{spread.icon}</span>
                      <div>
                        <h2 className="text-xl font-semibold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                          {spread.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">{spread.cardCount} lá bài</p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-foreground/85">{spread.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {spread.positions.map((position) => (
                        <span
                          key={position.id}
                          className="rounded-full border border-border/70 bg-secondary/40 px-3 py-1 text-xs text-foreground/80"
                        >
                          {position.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link to={`/reading/${spread.id}`} className="md:self-end">
                    <Button className="w-full gap-2 md:w-auto">
                      Chọn kiểu này
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReadingPicker;
