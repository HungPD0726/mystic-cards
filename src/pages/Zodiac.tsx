import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, Droplets, Flame, Mountain, Sparkles, Sun, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { publicAsset } from '@/lib/publicAsset';
import { zodiacSigns, type ZodiacSign, type ZodiacElement, getCurrentSignIdByDate } from '@/data/zodiac';

function elementIcon(element: ZodiacElement) {
  if (element === 'Lửa') return Flame;
  if (element === 'Đất') return Mountain;
  if (element === 'Khí') return Wind;
  return Droplets;
}

interface ConstellationMapProps {
  sign: ZodiacSign;
  className?: string;
  compact?: boolean;
}

function ConstellationMap({ sign, className, compact = false }: ConstellationMapProps) {
  const pointsById = useMemo(() => new Map(sign.constellation.stars.map((star) => [star.id, star])), [sign]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/60 bg-[radial-gradient(circle_at_50%_40%,hsl(var(--gold)/0.13),transparent_58%),linear-gradient(150deg,hsl(255_25%_10%),hsl(270_30%_8%))]',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,hsl(220_80%_70%_/_0.08),transparent_35%)]" />

      {!compact && (
        <div className="absolute left-3 top-3 rounded-full border border-gold/30 bg-background/55 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-gold/90">
          {sign.constellation.latinName}
        </div>
      )}

      <svg className="absolute inset-0 h-full w-full">
        {sign.constellation.links.map(([from, to], index) => {
          const a = pointsById.get(from);
          const b = pointsById.get(to);
          if (!a || !b) return null;

          return (
            <line
              key={`${from}-${to}-${index}`}
              x1={`${a.x}%`}
              y1={`${a.y}%`}
              x2={`${b.x}%`}
              y2={`${b.y}%`}
              stroke={sign.color}
              strokeOpacity={0.8}
              strokeWidth={compact ? 1 : 1.35}
            />
          );
        })}

        {sign.constellation.stars.map((star) => (
          <g key={star.id}>
            <circle
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={compact ? Math.max(1.2, star.size - 0.9) : star.size}
              fill={sign.color}
              fillOpacity={0.92}
            />
            {!compact && (
              <circle
                cx={`${star.x}%`}
                cy={`${star.y}%`}
                r={star.size + 2.7}
                fill={sign.color}
                fillOpacity={0.12}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

const Zodiac = () => {
  const placeholderSrc = publicAsset('placeholder.svg');
  const [activeSignId, setActiveSignId] = useState(() => getCurrentSignIdByDate(new Date()));
  const activeSign = useMemo(() => zodiacSigns.find((sign) => sign.id === activeSignId) ?? zodiacSigns[0], [activeSignId]);

  const signsByElement = useMemo(() => {
    return (['Lửa', 'Đất', 'Khí', 'Nước'] as ZodiacElement[]).map((element) => ({
      element,
      count: zodiacSigns.filter((sign) => sign.element === element).length,
    }));
  }, []);

  const ActiveElementIcon = elementIcon(activeSign.element);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(circle_at_10%_0%,hsl(42_95%_62%_/_0.16),transparent_45%),radial-gradient(circle_at_90%_10%,hsl(205_94%_68%_/_0.14),transparent_42%),radial-gradient(circle_at_50%_100%,hsl(282_85%_38%_/_0.24),transparent_62%)]" />

      <div className="container relative mx-auto px-4 py-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 max-w-6xl rounded-3xl border border-border/60 bg-card/45 p-5 backdrop-blur md:p-7"
        >
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/45 px-4 py-1.5">
                <Sun className="h-4 w-4 text-gold" />
                <span className="text-xs uppercase tracking-[0.2em] text-gold/90">Zodiac Atlas</span>
              </div>
              <h1 className="text-3xl font-bold text-gold md:text-4xl" style={{ fontFamily: 'Cinzel, serif' }}>
                Cung Hoàng Đạo
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Khám phá 12 cung với đặc tính cốt lõi, điểm mạnh, điểm cần cân bằng và gợi ý hành động để áp dụng vào đời sống thực tế.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Cung đang chọn</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{activeSign.name}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Nguyên tố</p>
                <p className="mt-1 text-sm font-semibold text-gold">{activeSign.element}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Hành tinh chủ quản</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{activeSign.rulingPlanet}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="mx-auto mb-6 max-w-6xl rounded-2xl border border-border/60 bg-card/45 p-4 md:p-5"
        >
          <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">Chọn cung của bạn</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {zodiacSigns.map((sign) => (
              <button
                key={sign.id}
                type="button"
                onClick={() => setActiveSignId(sign.id)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-left transition-all',
                  activeSignId === sign.id
                    ? 'border-gold/45 bg-gold/10 shadow-[0_10px_25px_hsl(var(--gold)/0.14)]'
                    : 'border-border/60 bg-background/40 hover:border-gold/30',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {sign.symbol} {sign.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{sign.dateRange}</p>
                  </div>
                  <div className="h-10 w-10 overflow-hidden rounded-md border border-border/60">
                    <img
                      src={sign.imagePath}
                      alt={sign.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderSrc;
                      }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="overflow-hidden rounded-3xl border border-gold/25 bg-card/50 p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gold md:text-3xl" style={{ fontFamily: 'Cinzel, serif' }}>
                  {activeSign.symbol} {activeSign.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{activeSign.dateRange}</p>
              </div>
              <Badge variant="secondary" className="border-gold/25">
                {activeSign.element}
              </Badge>
            </div>

            <div className="relative mt-4 overflow-hidden rounded-2xl border border-border/60 bg-background/45">
              <img
                src={activeSign.imagePath}
                alt={`Biểu tượng ${activeSign.name}`}
                className="h-44 w-full object-cover md:h-52"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholderSrc;
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,hsl(256_30%_8%_/_0.82),transparent_55%)]" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{activeSign.constellation.latinName}</p>
                <Badge variant="secondary" className="border-gold/25 bg-background/70 text-gold">
                  {activeSign.symbol}
                </Badge>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border/60 bg-background/45 p-4">
              <div className="flex items-center gap-2">
                <ActiveElementIcon className="h-4 w-4 text-gold" />
                <p className="text-sm font-semibold text-foreground">Từ khóa năng lượng</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {activeSign.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="border-gold/20">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Điểm mạnh</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{activeSign.strength}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Thử thách</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{activeSign.challenge}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-gold/25 bg-gold/5 p-4">
              <p className="text-xs uppercase tracking-wide text-gold/90">Gợi ý hành động</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{activeSign.advice}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/50 p-5 md:p-6">
            <h3 className="text-xl font-semibold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
              Chòm Sao Của {activeSign.name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{activeSign.constellation.description}</p>

            <ConstellationMap sign={activeSign} className="mt-4 h-56" />

            <div className="mt-4 rounded-2xl border border-border/60 bg-background/45 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Bản đồ nguyên tố</p>
              <div className="mt-3 grid gap-2">
                {signsByElement.map((item) => {
                  const Icon = elementIcon(item.element);
                  return (
                    <div key={item.element} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/55 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gold" />
                        <p className="text-sm font-medium text-foreground">{item.element}</p>
                      </div>
                      <Badge variant="secondary" className="border-gold/25">
                        {item.count} cung
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border/60 bg-background/45 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Gợi ý tiếp theo</p>
              <p className="mt-2 text-sm text-foreground/90">
                Dùng thông tin cung hoàng đạo như một góc nhìn bổ trợ, sau đó kết hợp với trải bài Tarot để đưa ra quyết định cụ thể.
              </p>
              <div className="mt-4">
                <Button asChild className="gap-2 glow-gold">
                  <Link to="/reading">
                    Bắt đầu trải bài
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="mx-auto mt-6 max-w-6xl rounded-3xl border border-border/60 bg-card/45 p-5 md:p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            <h3 className="text-xl font-semibold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
              12 Chòm Sao Hoàng Đạo
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {zodiacSigns.map((sign) => (
              <button
                key={`constellation-${sign.id}`}
                type="button"
                onClick={() => setActiveSignId(sign.id)}
                className={cn(
                  'rounded-2xl border p-3 text-left transition-all',
                  activeSignId === sign.id
                    ? 'border-gold/45 bg-gold/10 shadow-[0_10px_30px_hsl(var(--gold)/0.15)]'
                    : 'border-border/60 bg-background/40 hover:border-gold/35',
                )}
              >
                <p className="text-sm font-semibold text-foreground">
                  {sign.symbol} {sign.name}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{sign.constellation.latinName}</p>
                <div className="mt-2 overflow-hidden rounded-lg border border-border/60">
                  <img
                    src={sign.imagePath}
                    alt={sign.name}
                    className="h-16 w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = placeholderSrc;
                    }}
                  />
                </div>
                <ConstellationMap sign={sign} className="mt-3 h-24" compact />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Zodiac;
