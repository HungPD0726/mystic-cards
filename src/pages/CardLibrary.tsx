import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { allCards, cardGroups } from '@/data/cards';
import { CardGroup } from '@/data/types';
import { Search, LibraryBig, Sparkles, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type LibraryGroup = 'all' | CardGroup;

const groupDescription: Record<LibraryGroup, string> = {
  all: 'Tất cả 78 lá bài chuẩn Rider-Waite.',
  major: '22 lá Major Arcana đại diện cho các bài học lớn của hành trình.',
  wands: 'Bộ Gậy liên quan hành động, động lực và đam mê.',
  cups: 'Bộ Cốc phản chiếu cảm xúc, trực giác và các mối quan hệ.',
  swords: 'Bộ Kiếm đại diện tư duy, quyết định và xung đột.',
  pentacles: 'Bộ Xu tập trung vào tài chính, công việc và nền tảng vật chất.',
};

const groupLabelMap = cardGroups
  .filter((group): group is { id: CardGroup; label: string } => group.id !== 'all')
  .reduce(
    (acc, group) => {
      acc[group.id] = group.label;
      return acc;
    },
    {} as Record<CardGroup, string>,
  );

const CardLibrary = () => {
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState<LibraryGroup>('all');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 260);
    return () => window.clearTimeout(timer);
  }, []);

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return allCards.filter((card) => {
      const matchSearch =
        normalizedSearch.length === 0 ||
        card.name.toLowerCase().includes(normalizedSearch) ||
        card.keywords.some((kw) => kw.toLowerCase().includes(normalizedSearch)) ||
        card.description.toLowerCase().includes(normalizedSearch);
      const matchGroup = activeGroup === 'all' || card.group === activeGroup;
      return matchSearch && matchGroup;
    });
  }, [activeGroup, normalizedSearch]);

  const groupCounts = useMemo(() => {
    const counts: Record<LibraryGroup, number> = {
      all: allCards.length,
      major: 0,
      wands: 0,
      cups: 0,
      swords: 0,
      pentacles: 0,
    };

    allCards.forEach((card) => {
      counts[card.group] += 1;
    });

    return counts;
  }, []);

  const activeGroupLabel = cardGroups.find((group) => group.id === activeGroup)?.label ?? 'Tất cả';
  const hasFilters = normalizedSearch.length > 0 || activeGroup !== 'all';

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.16),transparent_70%)]" />

      <div className="container relative mx-auto px-4 py-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 max-w-6xl rounded-3xl border border-border/60 bg-card/50 p-5 backdrop-blur md:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/50 px-4 py-1.5">
                <LibraryBig className="h-4 w-4 text-gold" />
                <span className="text-xs uppercase tracking-[0.2em] text-gold/90">Tarot Card Archive</span>
              </div>
              <h1 className="text-3xl font-bold text-gold md:text-4xl" style={{ fontFamily: 'Cinzel, serif' }}>
                Thư Viện Lá Bài
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Khám phá đầy đủ 78 lá bài Tarot chuẩn Rider-Waite. Tìm theo tên, từ khóa, hoặc lọc nhanh theo từng
                nhóm biểu tượng.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tổng số lá bài</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{allCards.length}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Đang hiển thị</p>
                <p className="mt-1 text-xl font-semibold text-gold">{filtered.length}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Nhóm đang chọn</p>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">{activeGroupLabel}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-auto mb-6 max-w-6xl rounded-2xl border border-border/60 bg-card/45 p-4 md:p-5"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên lá bài hoặc từ khóa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-border/60 bg-background/70 pl-10 placeholder:text-muted-foreground/80"
                />
              </div>
              <div className="flex gap-2">
                {search && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSearch('')}
                    className="border-border/60 bg-background/70 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                    Xóa từ khóa
                  </Button>
                )}
                {hasFilters && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearch('');
                      setActiveGroup('all');
                    }}
                    className="border-gold/35 text-gold hover:bg-secondary"
                  >
                    <Sparkles className="h-4 w-4" />
                    Đặt lại bộ lọc
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span>Lọc theo nhóm</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {cardGroups.map((group) => {
                const isActive = activeGroup === group.id;
                return (
                  <Button
                    key={group.id}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveGroup(group.id as LibraryGroup)}
                    className={cn(
                      'h-9 rounded-full px-3',
                      isActive
                        ? 'glow-gold'
                        : 'border-border/60 bg-background/50 text-muted-foreground hover:border-gold/35 hover:text-gold',
                    )}
                  >
                    <span>{group.label}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px]',
                        isActive ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-secondary text-foreground/85',
                      )}
                    >
                      {groupCounts[group.id as LibraryGroup]}
                    </span>
                  </Button>
                );
              })}
            </div>

            <p className="text-sm text-muted-foreground">{groupDescription[activeGroup]}</p>
          </div>
        </motion.div>

        {!loaded ? (
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card/40 p-2.5">
                <Skeleton className="aspect-[3/5] w-full rounded-lg" />
                <Skeleton className="mt-2 h-3 w-3/4" />
                <Skeleton className="mt-1 h-2.5 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.015 } } }}
          >
            {filtered.map((card) => (
              <motion.div key={card.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <Link
                  to={`/cards/${card.slug}`}
                  className="group relative block h-full overflow-hidden rounded-2xl border border-border/55 bg-card/55 p-2.5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_16px_34px_hsl(var(--mystic-purple)/0.18)]"
                >
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[linear-gradient(155deg,hsl(var(--gold)/0.11),transparent_60%)]" />

                  <div className="relative">
                    <div className="aspect-[3/5] overflow-hidden rounded-lg border border-border/50 bg-background/40">
                      <img
                        src={card.imagePath}
                        alt={card.name}
                        className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-[1.04]"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    <div className="mt-2">
                      <p className="truncate text-xs font-semibold text-foreground/90 transition-colors group-hover:text-gold">
                        {card.name}
                      </p>
                      <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
                        {groupLabelMap[card.group]}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {loaded && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-8 max-w-xl rounded-2xl border border-border/60 bg-card/45 px-6 py-8 text-center"
          >
            <p className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
              Không tìm thấy lá bài phù hợp
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Hãy thử đổi từ khóa, hoặc đưa bộ lọc về "Tất cả" để xem đầy đủ thư viện.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setActiveGroup('all');
              }}
              className="mt-5 border-gold/35 text-gold hover:bg-secondary"
            >
              Đặt lại bộ lọc
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CardLibrary;
