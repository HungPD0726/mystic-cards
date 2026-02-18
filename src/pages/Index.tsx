import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Heart, Briefcase, GraduationCap, ChevronRight, ArrowRight } from 'lucide-react';
import { spreads } from '@/data/spreads';
import BackgroundParticles from '@/components/BackgroundParticles';
import QuickAccessCard from '@/components/QuickAccessCard';

const topics = [
  { icon: Heart, label: 'Tình cảm', desc: 'Khám phá vận mệnh tình yêu và các mối quan hệ', to: '/reading/three-card', delay: 0.6 },
  { icon: Briefcase, label: 'Công việc', desc: 'Tìm hiểu cơ hội và thách thức trong sự nghiệp', to: '/reading/three-card', delay: 0.7 },
  { icon: GraduationCap, label: 'Phát triển', desc: 'Con đường phát triển bản thân và trí tuệ', to: '/reading/one-card', delay: 0.8 },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center overflow-hidden">
        {/* Animated Background */}
        <BackgroundParticles />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(270 40% 20%) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(220 40% 15%) 0%, transparent 50%)',
        }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center gap-16 md:gap-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 backdrop-blur-md shadow-[0_0_15px_-3px_hsl(var(--gold)/0.1)]">
              <Sparkles className="w-4 h-4 text-gold animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                Mystic Tarot Guide
              </span>
            </div>
          </motion.div>

          {/* Title with Gold Hover Effect */}
          <div className="space-y-6">
            <motion.h1
              className="group cursor-default relative text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] z-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              <span className="inline-block transition-transform duration-500 ease-out group-hover:scale-105 origin-center py-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground/80 to-foreground/60 transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-amber-200 group-hover:via-yellow-400 group-hover:to-amber-500 group-hover:drop-shadow-[0_0_35px_rgba(234,179,8,0.6)]">
                  Khám Phá
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-purple-400 to-purple-600 transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-amber-200 group-hover:via-yellow-400 group-hover:to-amber-500 group-hover:drop-shadow-[0_0_35px_rgba(234,179,8,0.6)]">
                  Thế Giới Tarot
                </span>
              </span>

              {/* Decorative light beam on hover */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-400/0 group-hover:bg-amber-400/5 blur-[80px] rounded-full transition-all duration-700 -z-10" />
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              78 lá bài Tarot sẽ soi sáng con đường phía trước. Khám phá thông điệp từ vũ trụ dành riêng cho bạn.
            </motion.p>
          </div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/reading" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto min-w-[180px] gap-2 bg-primary text-primary-foreground glow-gold text-base px-8 py-6">
                <Sparkles className="h-5 w-5" />
                Bắt đầu xem
                <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/cards" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[180px] gap-2 border-gold/40 text-gold hover:bg-secondary text-base px-8 py-6">
                <BookOpen className="h-4 w-4" />
                Thư viện lá bài
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards - Quick Access */}
      <section className="container mx-auto px-4 py-16">
        <div className="w-full max-w-5xl mx-auto">
          <motion.h2
            className="mb-8 text-center text-2xl font-bold text-gold"
            style={{ fontFamily: 'Cinzel, serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Chủ đề bạn quan tâm
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topics.map(t => (
              <QuickAccessCard
                key={t.label}
                icon={t.icon}
                label={t.label}
                desc={t.desc}
                to={t.to}
                delay={t.delay}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-8 text-center"
          >
            <Link to="/reading" className="inline-flex items-center text-sm text-muted-foreground hover:text-gold transition-colors duration-300">
              Xem tất cả kiểu trải bài <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick Spread Selection */}
      <section className="container mx-auto px-4 pb-16">
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
                <div className="group border border-border/50 bg-card rounded-xl transition-all hover:border-gold/40 hover:glow-gold h-full">
                  <div className="flex flex-col items-center p-6 text-center">
                    <span className="mb-3 text-3xl">{spread.icon}</span>
                    <h3 className="mb-1 text-lg font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                      {spread.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{spread.cardCount} lá bài</p>
                  </div>
                </div>
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
