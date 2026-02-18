import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAccessCardProps {
  icon: LucideIcon;
  label: string;
  desc: string;
  to: string;
  delay?: number;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ icon: Icon, label, desc, to, delay = 0 }) => {
  return (
    <Link to={to} className="block group focus-visible:outline-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
        className={cn(
          "relative h-full p-6 rounded-2xl overflow-hidden transition-all duration-300",
          "border border-border/50",
          "bg-card/60 backdrop-blur-md",
          "hover:bg-card/80",
          "hover:border-gold/30",
          "hover:shadow-[0_8px_30px_hsl(var(--gold)/0.1)]",
          "group-focus-visible:ring-2 group-focus-visible:ring-gold"
        )}
      >
        {/* Subtle Gradient Overlay on Hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(to bottom right, hsl(var(--gold) / 0.05), transparent, transparent)' }}
        />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
              "bg-secondary text-muted-foreground",
              "group-hover:bg-gold/10 group-hover:text-gold"
            )}>
              <Icon className="w-5 h-5" />
            </div>

            <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRight className="w-4 h-4 text-gold" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-gold transition-colors" style={{ fontFamily: 'Cinzel, serif' }}>
            {label}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {desc}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};

export default React.memo(QuickAccessCard);
