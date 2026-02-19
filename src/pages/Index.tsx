import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Heart, Briefcase, GraduationCap, ArrowRight, ChevronRight } from 'lucide-react';
import { spreads } from '@/data/spreads';
import BackgroundParticles from '@/components/BackgroundParticles';
import QuickAccessCard from '@/components/QuickAccessCard';

const topics = [
  {
    icon: Heart,
    label: 'Tình cảm',
    desc: 'Khám phá cảm xúc, kết nối và hướng đi trong các mối quan hệ.',
    to: '/reading/three-card',
    delay: 0.55,
  },
  {
    icon: Briefcase,
    label: 'Công việc',
    desc: 'Nhìn rõ cơ hội, thử thách và quyết định quan trọng trong sự nghiệp.',
    to: '/reading/three-card',
    delay: 0.65,
  },
  {
    icon: GraduationCap,
    label: 'Phát triển',
    desc: 'Nhận thông điệp giúp bạn trưởng thành và hiểu chính mình hơn.',
    to: '/reading/one-card',
    delay: 0.75,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <section className="relative isolate overflow-hidden">
        <BackgroundParticles />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, hsl(285 55% 24% / 0.55), transparent 45%), radial-gradient(circle at 85% 15%, hsl(220 65% 30% / 0.45), transparent 40%), radial-gradient(circle at 50% 100%, hsl(35 85% 45% / 0.2), transparent 45%)',
          }}
        />

        <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/40 px-4 py-1.5"
            >
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-xs tracking-[0.22em] uppercase text-gold/90">Mystic Tarot Reading</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1 }}
              className="text-4xl font-bold leading-tight md:text-6xl lg:text-7xl"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                Giải Mã Trải Bài
              </span>
              <br />
              <span className="text-foreground">Khai Mở Trực Giác</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
              78 lá bài không nói trước tương lai, nhưng soi sáng lựa chọn hiện tại. Hãy bắt đầu với câu hỏi bạn đang
              thật sự băn khoăn.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
            >
              <Link to="/reading">
                <Button size="lg" className="min-w-[210px] gap-2 px-8 py-6 text-base glow-gold">
                  <Sparkles className="h-5 w-5" />
                  Bắt đầu xem bài
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/cards">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-[210px] gap-2 border-gold/40 px-8 py-6 text-base text-gold hover:bg-secondary"
                >
                  <BookOpen className="h-4 w-4" />
                  Thư viện lá bài
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.45 }}
            className="mx-auto mt-14 grid max-w-4xl gap-3 rounded-2xl border border-border/70 bg-card/50 p-4 backdrop-blur md:grid-cols-3 md:p-5"
          >
            <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-left">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Trải bài phổ biến</p>
              <p className="mt-1 text-sm font-semibold">Quá khứ - Hiện tại - Tương lai</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-left">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Mục tiêu</p>
              <p className="mt-1 text-sm font-semibold">Rõ câu hỏi, rõ hướng đi</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-left">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Kèm AI diễn giải</p>
              <p className="mt-1 text-sm font-semibold">Nhanh, sâu sắc, dễ hiểu</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="mb-8 text-center text-2xl font-bold text-gold"
            style={{ fontFamily: 'Cinzel, serif' }}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Chủ đề bạn quan tâm
          </motion.h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {topics.map((topic) => (
              <QuickAccessCard
                key={topic.label}
                icon={topic.icon}
                label={topic.label}
                desc={topic.desc}
                to={topic.to}
                delay={topic.delay}
              />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <Link to="/reading" className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-gold">
              Xem tất cả kiểu trải bài <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="mb-8 text-center text-2xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
            Chọn kiểu trải bài
          </h2>
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
            {spreads.map((spread) => (
              <Link key={spread.id} to={`/reading/${spread.id}`}>
                <div className="group h-full rounded-xl border border-border/60 bg-card/60 transition-all hover:border-gold/45 hover:shadow-[0_0_24px_hsl(var(--gold)/0.14)]">
                  <div className="flex flex-col items-center p-6 text-center">
                    <span className="mb-3 text-3xl">{spread.icon}</span>
                    <h3 className="mb-1 text-lg font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                      {spread.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{spread.cardCount} lá bài</p>
                    <p className="mt-2 text-xs text-muted-foreground/90">{spread.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl rounded-2xl border border-gold/25 bg-card/60 px-6 py-8 text-center"
        >
          <h2 className="mb-4 text-2xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
            Tarot là gì?
          </h2>
          <p className="mb-6 leading-relaxed text-foreground/85">
            Tarot là hệ thống biểu tượng giúp bạn soi chiếu nội tâm và nhìn rõ bối cảnh hiện tại. Thay vì đưa ra đáp
            án tuyệt đối, Tarot gợi mở góc nhìn để bạn tự đưa ra quyết định đúng với mình.
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
