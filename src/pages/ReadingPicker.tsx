import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { spreads } from '@/data/spreads';

const ReadingPicker = () => {
  return (
    <div className="container mx-auto min-h-screen px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-bold text-gold mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
          Chọn kiểu trải bài
        </h1>
        <p className="text-muted-foreground">Hãy chọn phương pháp phù hợp với câu hỏi của bạn</p>
      </motion.div>

      <div className="mx-auto grid max-w-3xl gap-6">
        {spreads.map((spread, i) => (
          <motion.div
            key={spread.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-border/50 bg-card transition-all hover:border-gold/40">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{spread.icon}</span>
                    <div>
                      <CardTitle className="text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                        {spread.name}
                      </CardTitle>
                      <CardDescription className="mt-1">{spread.cardCount} lá bài</CardDescription>
                    </div>
                  </div>
                  <Link to={`/reading/${spread.id}`}>
                    <Button className="glow-gold">Chọn</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80">{spread.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {spread.positions.map(pos => (
                    <span key={pos.id} className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                      {pos.label}
                    </span>
                  ))}
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
