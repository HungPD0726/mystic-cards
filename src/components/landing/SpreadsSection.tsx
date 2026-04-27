import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { spreads } from '@/data/spreads';

export const SpreadsSection = () => {
  return (
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
  );
};
