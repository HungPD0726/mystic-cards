import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  BookOpen,
  Heart,
  Briefcase,
  GraduationCap,
  ArrowRight,
  ChevronRight,
  Compass,
  MessageCircle,
  Wand2,
  Clock3,
  Brain,
  Stars,
} from 'lucide-react';
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

const steps = [
  {
    icon: MessageCircle,
    title: 'Đặt câu hỏi đúng',
    desc: 'Mô tả ngắn gọn điều bạn đang vướng mắc để Tarot phản chiếu đúng trọng tâm.',
  },
  {
    icon: Wand2,
    title: 'Rút trải bài phù hợp',
    desc: 'Chọn trải một lá khi cần nhanh, hoặc ba lá khi cần nhìn toàn cảnh.',
  },
  {
    icon: Compass,
    title: 'Đọc và hành động',
    desc: 'Kết hợp trực giác của bạn với gợi ý từ AI để ra quyết định thực tế.',
  },
];

const strengths = [
  {
    icon: Clock3,
    title: 'Nhanh và rõ ràng',
    desc: 'Hoàn tất một phiên xem bài chỉ trong vài phút.',
  },
  {
    icon: Brain,
    title: 'Gợi mở có chiều sâu',
    desc: 'Diễn giải AI bám sát bối cảnh thay vì câu trả lời khuôn mẫu.',
  },
  {
    icon: Stars,
    title: 'Không gian tập trung',
    desc: 'Thiết kế tối giản giúp bạn tập trung vào câu hỏi của chính mình.',
  },
];

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <section className="relative isolate overflow-hidden border-b border-border/40">
        <BackgroundParticles />
        <div className="mystic-grid absolute inset-0 opacity-30" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, hsl(285 55% 24% / 0.58), transparent 45%), radial-gradient(circle at 85% 15%, hsl(220 65% 30% / 0.48), transparent 40%), radial-gradient(circle at 50% 100%, hsl(35 85% 45% / 0.24), transparent 45%)',
          }}
        />

        <div className="container relative z-10 mx-auto px-4 pb-16 pt-12 md:pt-16 lg:pb-24">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/40 px-4 py-1.5"
            >
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-xs tracking-[0.22em] uppercase text-gold/90">Astral Arcana • Tarot & Zodiac</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1 }}
              className="text-4xl font-bold leading-[1.05] md:text-6xl lg:text-7xl"
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
              className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-2xl"
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
                <Button size="lg" className="min-w-[220px] gap-2 px-8 py-6 text-base glow-gold">
                  <Sparkles className="h-5 w-5" />
                  Bắt đầu xem bài
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/cards">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-[220px] gap-2 border-gold/40 px-8 py-6 text-base text-gold hover:bg-secondary"
                >
                  <BookOpen className="h-4 w-4" />
                  Thư viện lá bài
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.45 }}
            className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-3"
          >
            <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-left backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Trải bài phổ biến</p>
              <p className="mt-1 text-sm font-semibold">Quá khứ - Hiện tại - Tương lai</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-left backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Mục tiêu</p>
              <p className="mt-1 text-sm font-semibold">Rõ câu hỏi, rõ hướng đi</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-left backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Kèm AI diễn giải</p>
              <p className="mt-1 text-sm font-semibold">Nhanh, sâu sắc, dễ hiểu</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.4 }}
            className="relative mx-auto mt-10 w-full max-w-4xl"
          >
            <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-blue-300/15 blur-3xl" />
            <div className="relative rounded-3xl border border-gold/25 bg-card/70 p-5 shadow-[0_24px_80px_hsl(var(--mystic-purple)/0.22)] backdrop-blur-md sm:p-6">
              <p className="text-center text-xs uppercase tracking-[0.2em] text-gold/90">Phiên xem bài gợi ý</p>
              <h2
                className="mt-2 text-center text-2xl font-semibold leading-tight text-foreground md:text-3xl"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                Trải Ba Lá: Quá khứ, hiện tại, tương lai
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">
                Một bố cục dễ bắt đầu để bạn nhìn tổng thể tình huống và nhận ra hướng đi phù hợp nhất lúc này.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {['Quá khứ', 'Hiện tại', 'Tương lai'].map((slot, idx) => (
                  <Button
                    key={slot}
                    asChild
                    variant="outline"
                    className="h-auto w-full justify-between rounded-xl border-gold/25 bg-background/45 px-4 py-3 text-left hover:border-gold/45 hover:bg-secondary/40"
                  >
                    <Link to="/reading/three-card" className="w-full">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span className="text-base text-gold">{spreads[1].icon}</span>
                        {slot}
                      </span>
                      <span className="text-xs text-muted-foreground">Lá {idx + 1}</span>
                    </Link>
                  </Button>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-background/40 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Câu hỏi mẫu</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                  "Mình cần tập trung điều gì trong 30 ngày tới để cải thiện công việc và sự cân bằng cá nhân?"
                </p>
              </div>

              <div className="mt-5 text-center">
                <Link
                  to="/reading/three-card"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-amber-300"
                >
                  Chọn trải bài này <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative container mx-auto px-4 py-16">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />
        <motion.h2
          className="mb-3 text-center text-2xl font-bold text-gold md:text-3xl"
          style={{ fontFamily: 'Cinzel, serif' }}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Bắt đầu chỉ với 3 bước
        </motion.h2>
        <motion.p
          className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          viewport={{ once: true }}
        >
          Quy trình ngắn gọn để bạn đi từ băn khoăn sang góc nhìn rõ ràng và dễ hành động.
        </motion.p>
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 transition-all hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_16px_40px_hsl(var(--mystic-purple)/0.16)]"
            >
              <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 translate-x-7 -translate-y-7 rounded-full bg-gold/10 blur-2xl" />
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-sm font-semibold text-gold">
                  {idx + 1}
                </span>
                <step.icon className="h-5 w-5 text-gold/90" />
              </div>
              <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="mb-3 text-center text-2xl font-bold text-gold md:text-3xl"
            style={{ fontFamily: 'Cinzel, serif' }}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Chủ đề bạn quan tâm
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            viewport={{ once: true }}
            className="mx-auto mb-8 max-w-2xl text-center text-muted-foreground"
          >
            Chọn nhanh lĩnh vực bạn muốn soi chiếu để vào đúng trải bài phù hợp.
          </motion.p>
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
          <h2 className="mb-3 text-center text-2xl font-bold text-gold md:text-3xl" style={{ fontFamily: 'Cinzel, serif' }}>
            Chọn kiểu trải bài
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-center text-muted-foreground">
            Mỗi kiểu trải bài phục vụ một mục đích khác nhau. Bắt đầu với kiểu phù hợp nhất với câu hỏi hiện tại.
          </p>
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
            {spreads.map((spread) => (
              <Link key={spread.id} to={`/reading/${spread.id}`} className="block group">
                <div className="relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:border-gold/45 hover:shadow-[0_20px_45px_hsl(var(--gold)/0.12)]">
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[linear-gradient(140deg,hsl(var(--gold)/0.08),transparent_55%)]" />
                  <div className="relative flex h-full flex-col p-6 text-left">
                    <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold/25 bg-background/50 text-2xl shadow-[inset_0_0_18px_hsl(var(--gold)/0.08)]">
                      {spread.icon}
                    </span>
                    <h3 className="mb-1 text-lg font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                      {spread.name}
                    </h3>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{spread.cardCount} lá bài</p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground/95">{spread.description}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-gold transition-transform group-hover:translate-x-0.5">
                      Mở trải bài <ArrowRight className="h-4 w-4" />
                    </span>
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
          className="mx-auto max-w-5xl rounded-3xl border border-gold/25 bg-card/60 px-6 py-8 md:px-10 md:py-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-gold md:text-3xl" style={{ fontFamily: 'Cinzel, serif' }}>
                Tarot là gì?
              </h2>
              <p className="mt-4 leading-relaxed text-foreground/85">
                Tarot là hệ thống biểu tượng giúp bạn soi chiếu nội tâm và nhìn rõ bối cảnh hiện tại. Thay vì đưa ra
                đáp án tuyệt đối, Tarot gợi mở góc nhìn để bạn tự đưa ra quyết định đúng với mình.
              </p>
              <div className="mt-6">
                <Link to="/cards">
                  <Button variant="outline" className="gap-2 border-gold/40 text-gold hover:bg-secondary">
                    <BookOpen className="h-4 w-4" />
                    Khám phá thư viện lá bài
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              {strengths.map((strength) => (
                <div
                  key={strength.title}
                  className="rounded-xl border border-border/60 bg-background/40 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg border border-gold/30 bg-gold/10 p-2 text-gold">
                      <strength.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{strength.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{strength.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
