import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, BookOpen, Heart, Briefcase, GraduationCap } from 'lucide-react';
import { spreads } from '@/data/spreads';

const topics = [
  { icon: Heart, label: 'Tình cảm', color: 'text-pink-400' },
  { icon: Briefcase, label: 'Công việc', color: 'text-amber-400' },
  { icon: GraduationCap, label: 'Học tập', color: 'text-blue-400' },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 text-center bg-mystic-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(270 40% 30%) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(220 40% 25%) 0%, transparent 50%)',
        }} />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="mb-6 text-6xl">🔮</div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gold sm:text-5xl lg:text-6xl" style={{ fontFamily: 'Cinzel, serif' }}>
            Mystic Tarot
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-lg text-foreground/80">
            Khám phá thông điệp từ vũ trụ. 78 lá bài Tarot sẽ soi sáng con đường phía trước của bạn.
          </p>
          
          <Link to="/reading">
            <Button size="lg" className="gap-2 bg-primary text-primary-foreground glow-gold text-base px-8 py-6">
              <Sparkles className="h-5 w-5" />
              Bắt đầu xem
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Quick Spread Selection */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-8 text-center text-2xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
            Chọn kiểu trải bài
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
            {spreads.map(spread => (
              <Link key={spread.id} to={`/reading/${spread.id}`}>
                <Card className="group border-border/50 bg-card transition-all hover:border-gold/40 hover:glow-gold h-full">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <span className="mb-3 text-3xl">{spread.icon}</span>
                    <h3 className="mb-1 text-lg font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                      {spread.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{spread.cardCount} lá bài</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Topics */}
      <section className="container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 text-center text-2xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
            Chủ đề bạn quan tâm
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {topics.map(t => (
              <Link key={t.label} to="/reading">
                <Card className="border-border/50 bg-card transition-all hover:border-gold/30 w-36">
                  <CardContent className="flex flex-col items-center p-4">
                    <t.icon className={`mb-2 h-8 w-8 ${t.color}`} />
                    <span className="text-sm font-medium text-foreground">{t.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* About */}
      <section className="container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="mb-4 text-2xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
            Tarot là gì?
          </h2>
          <p className="mb-6 text-foreground/80 leading-relaxed">
            Tarot là một hệ thống 78 lá bài cổ xưa, được sử dụng như một công cụ soi chiếu nội tâm. 
            Mỗi lá bài mang một biểu tượng và thông điệp riêng, giúp bạn nhìn nhận tình huống 
            từ nhiều góc độ và tìm ra hướng đi phù hợp.
          </p>
          <Link to="/cards">
            <Button variant="outline" className="gap-2 border-gold/40 text-gold hover:bg-secondary">
              <BookOpen className="h-4 w-4" />
              Khám phá thư viện lá bài
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
