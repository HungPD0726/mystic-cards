import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { landingStrengths } from '@/data/landing';

export const AboutSection = () => {
  return (
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
            {landingStrengths.map((strength) => (
              <div
                key={strength.title}
                className="rounded-xl border border-border/60 bg-background/40 p-4 backdrop-blur-sm transition-colors hover:border-gold/35"
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
  );
};
