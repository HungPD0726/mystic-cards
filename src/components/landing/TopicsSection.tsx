import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import QuickAccessCard from '@/components/QuickAccessCard';
import { landingTopics } from '@/data/landing';

interface TopicsSectionProps {
  onStartReading: (path: string) => void;
}

export const TopicsSection = ({ onStartReading }: TopicsSectionProps) => {
  return (
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
          {landingTopics.map((topic) => (
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
          <button
            type="button"
            onClick={() => onStartReading('/reading')}
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            Xem tất cả kiểu trải bài <ChevronRight className="ml-1 h-3 w-3" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
