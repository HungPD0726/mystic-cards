import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { allCards, cardGroups } from '@/data/cards';
import { CardGroup } from '@/data/types';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const CardLibrary = () => {
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState<'all' | CardGroup>('all');
  const [loaded, setLoaded] = useState(false);

  // Simulate initial load
  useState(() => {
    setTimeout(() => setLoaded(true), 300);
  });

  const filtered = useMemo(() => {
    return allCards.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchGroup = activeGroup === 'all' || c.group === activeGroup;
      return matchSearch && matchGroup;
    });
  }, [search, activeGroup]);

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
          Thư viện lá bài
        </h1>
        <p className="mt-1 text-muted-foreground">78 lá bài Tarot chuẩn Rider-Waite</p>
      </motion.div>

      {/* Search & Filter */}
      <div className="mx-auto mb-8 max-w-2xl space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm lá bài..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 border-border/50 bg-card"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {cardGroups.map(g => (
            <Button
              key={g.id}
              variant={activeGroup === g.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveGroup(g.id as 'all' | CardGroup)}
              className={cn(
                activeGroup === g.id
                  ? 'glow-gold'
                  : 'border-border/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {g.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {!loaded ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-32 w-20 rounded-xl" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.02 } },
          }}
        >
          {filtered.map(card => (
            <motion.div
              key={card.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Link
                to={`/cards/${card.slug}`}
                className="group flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all hover:bg-secondary/50"
              >
                <div className="h-32 w-20 overflow-hidden rounded-lg border border-border/50 bg-card transition-all group-hover:border-gold/40 group-hover:glow-gold">
                  <img
                    src={card.imagePath}
                    alt={card.name}
                    className="h-full w-full object-contain p-1"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                </div>
                <span className="text-center text-[11px] font-medium text-foreground/80 group-hover:text-gold transition-colors">
                  {card.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {loaded && filtered.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">Không tìm thấy lá bài nào.</p>
      )}
    </div>
  );
};

export default CardLibrary;
