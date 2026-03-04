import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Compass, Layers3, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { spreads, spreadCategoryMeta } from '@/data/spreads';
import { SpreadCategory } from '@/data/types';
import { cn } from '@/lib/utils';

const categoryOrder: SpreadCategory[] = ['quick-guidance', 'classic', 'theme', 'deep-dive'];
const starterIds = new Set(['one-card', 'three-card', 'love']);

const groupedSpreads = categoryOrder
  .map((category) => ({
    category,
    meta: spreadCategoryMeta[category],
    items: spreads.filter((spread) => spread.category === category),
  }))
  .filter((section) => section.items.length > 0);

const starterSpreads = spreads.filter((spread) => starterIds.has(spread.id));

const ReadingPicker = () => {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.12),transparent_42%),radial-gradient(circle_at_80%_18%,hsl(var(--primary)/0.16),transparent_28%),radial-gradient(circle_at_20%_88%,hsl(var(--accent)/0.16),transparent_30%)]" />

      <section className="relative border-b border-border/50">
        <div className="container mx-auto px-4 pb-12 pt-10 md:pb-16 md:pt-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-gold/20 bg-card/50 p-6 shadow-[0_25px_90px_hsl(var(--gold)/0.08)] backdrop-blur md:p-8"
          >
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-background/40 px-4 py-1.5">
                  <Sparkles className="h-4 w-4 text-gold" />
                  <span className="text-xs uppercase tracking-[0.22em] text-gold/90">Reading Studio</span>
                </div>

                <h1
                  className="max-w-3xl text-4xl font-bold leading-[1.02] text-foreground md:text-5xl lg:text-6xl"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  Chọn Trải Bài
                  <br />
                  <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    Theo Độ Sâu Phù Hợp
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Thay vì chọn ngẫu nhiên, hãy bắt đầu bằng đúng loại trải bài cho câu hỏi của bạn: nhanh để lấy tín
                  hiệu, cổ điển để nhìn mạch chuyện, hoặc chuyên sâu khi cần bóc tách nhiều lớp.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {groupedSpreads.map((section) => (
                    <a
                      key={section.category}
                      href={`#category-${section.category}`}
                      className="rounded-full border border-border/60 bg-background/40 px-4 py-2 text-sm text-foreground transition hover:border-gold/35 hover:text-gold"
                    >
                      {section.meta.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tổng số layout</p>
                  <p className="mt-2 text-2xl font-semibold text-gold">{spreads.length}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Từ một lá nhanh gọn đến mười lá chuyên sâu.</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Khung thời gian</p>
                  <p className="mt-2 text-2xl font-semibold text-gold">1-10 phút</p>
                  <p className="mt-1 text-sm text-muted-foreground">Đủ nhanh để dùng hàng ngày, đủ sâu cho lúc cần.</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Gợi ý bắt đầu</p>
                  <p className="mt-2 text-2xl font-semibold text-gold">Ba Lá</p>
                  <p className="mt-1 text-sm text-muted-foreground">Dễ đọc, cân bằng và phù hợp cho phần lớn câu hỏi.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="mx-auto max-w-6xl rounded-[28px] border border-border/60 bg-card/45 p-5 backdrop-blur md:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl border border-gold/30 bg-gold/10 p-2 text-gold">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                Bắt đầu nhanh
              </h2>
              <p className="text-sm text-muted-foreground">Ba lựa chọn an toàn nếu bạn chưa chắc nên dùng spread nào.</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {starterSpreads.map((spread, index) => (
              <motion.div
                key={spread.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.08 }}
                className="relative overflow-hidden rounded-3xl border border-gold/20 bg-background/45 p-5"
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,hsl(var(--gold)/0.08),transparent_58%)]" />
                <div className="relative">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/30 bg-card/75 text-2xl shadow-[inset_0_0_20px_hsl(var(--gold)/0.08)]">
                        {spread.icon}
                      </span>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold/70">
                          {spreadCategoryMeta[spread.category].label}
                        </p>
                        <h3 className="text-xl font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                          {spread.name}
                        </h3>
                      </div>
                    </div>
                    <span className="rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs text-muted-foreground">
                      {spread.cardCount} lá
                    </span>
                  </div>

                  <p className="min-h-[72px] text-sm leading-relaxed text-muted-foreground">{spread.idealFor}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {spread.bestFor.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs text-foreground/85"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <Link to={`/reading/${spread.id}`} className="mt-5 block">
                    <Button className="w-full gap-2 glow-gold">
                      Mở trải bài
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-6xl space-y-8">
          {groupedSpreads.map((section, sectionIndex) => (
            <motion.div
              key={section.category}
              id={`category-${section.category}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 + sectionIndex * 0.05 }}
              className="overflow-hidden rounded-[30px] border border-border/60 bg-card/45 backdrop-blur"
            >
              <div className={cn('relative border-b border-border/60 p-6', `bg-gradient-to-r ${section.meta.accent}`)}>
                <div className="relative flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{section.meta.label}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                      {section.meta.description}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/45 px-3 py-1.5">
                      <Layers3 className="h-4 w-4 text-gold" />
                      {section.items.length} lựa chọn
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/45 px-3 py-1.5">
                      <Compass className="h-4 w-4 text-gold" />
                      Chọn theo câu hỏi thực tế
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-5 lg:grid-cols-2">
                {section.items.map((spread) => (
                  <div
                    key={spread.id}
                    className="group relative overflow-hidden rounded-3xl border border-border/60 bg-background/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_18px_48px_hsl(var(--gold)/0.08)]"
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[linear-gradient(145deg,hsl(var(--gold)/0.08),transparent_52%)]" />
                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <span className="mt-0.5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-card/75 text-3xl shadow-[inset_0_0_20px_hsl(var(--gold)/0.08)]">
                            {spread.icon}
                          </span>
                          <div>
                            <h3 className="text-2xl font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                              {spread.name}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{spread.description}</p>
                          </div>
                        </div>
                        <span className="rounded-full border border-border/60 bg-card/80 px-3 py-1 text-xs text-muted-foreground">
                          {spread.cardCount} lá
                        </span>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-border/60 bg-card/55 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Thời lượng</p>
                          <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Clock3 className="h-4 w-4 text-gold" />
                            {spread.duration}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-card/55 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Độ sâu</p>
                          <p className="mt-2 text-sm font-semibold text-foreground">{spread.intensity}</p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-card/55 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Phù hợp khi</p>
                          <p className="mt-2 text-sm font-semibold text-foreground">{spread.positions[0]?.label}</p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-gold/80">Nên dùng khi</p>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/85">{spread.idealFor}</p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {spread.bestFor.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-border/60 bg-secondary/35 px-3 py-1 text-xs text-foreground/85"
                          >
                            {item}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {spread.positions.map((position) => (
                          <span
                            key={position.id}
                            className="rounded-full border border-border/60 bg-background/65 px-3 py-1 text-xs text-muted-foreground"
                          >
                            {position.label}
                          </span>
                        ))}
                      </div>

                      <Link to={`/reading/${spread.id}`} className="mt-6 inline-flex">
                        <Button className="gap-2 glow-gold">
                          Bắt đầu với spread này
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ReadingPicker;
