import { motion } from 'framer-motion';
import { landingSteps } from '@/data/landing';

export const StepsSection = () => {
  return (
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
        {landingSteps.map((step, idx) => (
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
  );
};
