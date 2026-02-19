import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { allCards, cardGroups } from '@/data/cards';
import { CardGroup } from '@/data/types';
import { Search, LibraryBig } from 'lucide-react';
import { cn } from '@/lib/utils';

const CardLibrary = () => {
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState<'all' | CardGroup>('all');
  const [loaded, setLoaded] = useState(false);

  useState(() => {
    setTimeout(() => setLoaded(true), 300);
  });

  const filtered = useMemo(() => {
    return allCards.filter((card) => {
      const matchSearch = card.name.toLowerCase().includes(search.toLowerCase());
      const matchGroup = activeGroup === 'all' || card.group === activeGroup;
      return matchSearch && matchGroup;
    });
  }, [search, activeGroup]);

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/40 px-4 py-1.5">
          <LibraryBig className="h-4 w-4 text-gold" />
          <span className="text-xs uppercase tracking-[0.2em] text-gold/90">Tarot Card Archive</span>
        </div>
        <h1 className="text-3xl font-bold text-gold md:text-4xl" style={{ fontFamily: 'Cinzel, serif' }}>
          Thư Viện Lá Bài
        </h1>
        <p className="mt-1 text-muted-foreground">78 lá bài Tarot chuẩn Rider-Waite, tra cứu nhanh theo nhóm.</p>
      </motion.div>

      <div className="mx-auto mb-8 max-w-3xl space-y-4 rounded-2xl border border-border/60 bg-card/45 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm lá bài..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-border/50 bg-background/70 pl-10 text-black placeholder:text-gray-500"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {cardGroups.map((group) => (
            <Button
              key={group.id}
              variant={activeGroup === group.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveGroup(group.id as 'all' | CardGroup)}
              className={cn(
                activeGroup === group.id
                  ? 'glow-gold'
                  : 'border-border/50 text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {group.label}
            </Button>
          ))}
        </div>
      </div>

      {!loaded ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-32 w-20 rounded-xl" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.02 } } }}
        >
          {filtered.map((card) => (
            <motion.div key={card.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
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
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
                <span className="text-center text-[11px] font-medium text-foreground/80 transition-colors group-hover:text-gold">
                  {card.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {loaded && filtered.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">Không tìm thấy lá bài nào khớp với bộ lọc hiện tại.</p>
      )}
    </div>
  );
};

export default CardLibrary;
