import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCcw, BookOpen, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { allCards } from '@/data/cards';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const DailyTarotWidget = () => {
  const [dailyCard, setDailyCard] = useState<any>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const savedCard = localStorage.getItem('daily_tarot_card');
    const savedDate = localStorage.getItem('daily_tarot_date');
    const today = new Date().toDateString();

    if (savedCard && savedDate === today) {
      setDailyCard(JSON.parse(savedCard));
      setIsRevealed(true);
    }
  }, []);

  const drawDailyCard = () => {
    setIsFlipping(true);
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * allCards.length);
      const card = allCards[randomIndex];
      const today = new Date().toDateString();
      
      localStorage.setItem('daily_tarot_card', JSON.stringify(card));
      localStorage.setItem('daily_tarot_date', today);
      
      setDailyCard(card);
      setIsRevealed(true);
      setIsFlipping(false);
      toast.success('Lá bài ngày mới của bạn đã lộ diện!');
    }, 1000);
  };

  return (
    <Card className="border-gold/20 bg-card/40 backdrop-blur-xl overflow-hidden rounded-[2.5rem] shadow-2xl group">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Card Display */}
          <div className="relative w-48 h-80 perspective-1000">
            <AnimatePresence mode="wait">
              {!isRevealed ? (
                <motion.div
                  key="back"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: isFlipping ? 180 : 0 }}
                  exit={{ rotateY: 180 }}
                  transition={{ duration: 0.6 }}
                  className="w-full h-full bg-mystic-gradient rounded-2xl border-2 border-gold/30 flex items-center justify-center cursor-pointer shadow-xl"
                  onClick={drawDailyCard}
                >
                  <div className="w-full h-full m-2 border border-gold/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-gold animate-pulse" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="front"
                  initial={{ rotateY: -180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="w-full h-full rounded-2xl overflow-hidden border-2 border-gold/40 shadow-2xl relative"
                >
                  <img 
                    src={dailyCard.imagePath} 
                    alt={dailyCard.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-white font-bold text-lg" style={{ fontFamily: 'Cinzel, serif' }}>
                      {dailyCard.name}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info Side */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            {!isRevealed ? (
              <div className="space-y-4">
                <Badge className="bg-gold/10 text-gold border-gold/20 px-3 py-1 uppercase tracking-widest text-[10px] font-bold">
                  Daily Insight
                </Badge>
                <h3 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                  Thông điệp ngày mới
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-md">
                  Mỗi ngày là một hành trình mới. Hãy rút một lá bài để nhận thông điệp dẫn dắt cho 24 giờ tới của bạn.
                </p>
                <Button 
                  onClick={drawDailyCard} 
                  disabled={isFlipping}
                  className="glow-gold px-8 py-6 rounded-full font-bold text-lg h-auto"
                >
                  {isFlipping ? <RefreshCcw className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                  Rút bài ngay
                </Button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <Badge className="bg-gold/10 text-gold border-gold/20 px-3 py-1 uppercase tracking-widest text-[10px] font-bold">
                  Thông điệp của bạn
                </Badge>
                <h3 className="text-3xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                  {dailyCard.name}
                </h3>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {dailyCard.keywords.map((k: string) => (
                    <Badge key={k} variant="secondary" className="bg-background/40 border-gold/10">
                      {k}
                    </Badge>
                  ))}
                </div>

                <p className="text-foreground/90 leading-relaxed italic border-l-2 border-gold/30 pl-4 py-1">
                  "{dailyCard.uprightMeaning}"
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-4">
                  <Button variant="outline" size="sm" asChild className="rounded-full border-gold/20 text-gold hover:bg-gold/5">
                    <Link to={`/cards/${dailyCard.slug}`}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Chi tiết lá bài
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-gold" onClick={() => {
                    navigator.clipboard.writeText(`Thông điệp ngày mới của tôi là lá ${dailyCard.name}: ${dailyCard.uprightMeaning}`);
                    toast.success('Đã copy thông điệp!');
                  }}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Chia sẻ
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
