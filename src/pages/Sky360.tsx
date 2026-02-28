import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Compass, Pause, Play, RotateCcw, Sparkles, Stars } from 'lucide-react';

type ConstellationStar = {
  id: string;
  lon: number;
  lat: number;
  magnitude: number;
};

type Constellation = {
  id: string;
  name: string;
  shortName: string;
  meaning: string;
  color: string;
  center: { lon: number; lat: number };
  stars: ConstellationStar[];
  links: Array<[string, string]>;
};

const H_FOV = 110;
const V_FOV = 72;

const constellations: Constellation[] = [
  {
    id: 'orion',
    name: 'Orion',
    shortName: 'Thợ săn',
    meaning: 'Biểu tượng của ý chí, hành động và sự can đảm đối mặt thử thách.',
    color: 'hsl(45 92% 64%)',
    center: { lon: 34, lat: 8 },
    stars: [
      { id: 'betelgeuse', lon: 24, lat: 22, magnitude: 2.4 },
      { id: 'bellatrix', lon: 33, lat: 20, magnitude: 1.8 },
      { id: 'alnitak', lon: 30, lat: 8, magnitude: 1.6 },
      { id: 'alnilam', lon: 34, lat: 8, magnitude: 1.9 },
      { id: 'mintaka', lon: 38, lat: 9, magnitude: 1.8 },
      { id: 'saiph', lon: 30, lat: -7, magnitude: 2.2 },
      { id: 'rigel', lon: 42, lat: -9, magnitude: 2.5 },
    ],
    links: [
      ['betelgeuse', 'bellatrix'],
      ['betelgeuse', 'alnitak'],
      ['bellatrix', 'mintaka'],
      ['alnitak', 'alnilam'],
      ['alnilam', 'mintaka'],
      ['alnitak', 'saiph'],
      ['mintaka', 'rigel'],
      ['saiph', 'rigel'],
    ],
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia',
    shortName: 'Nữ hoàng',
    meaning: 'Nhắc về lòng tự trọng và sự cân bằng giữa kiêu hãnh với khiêm tốn.',
    color: 'hsl(217 88% 70%)',
    center: { lon: 106, lat: 45 },
    stars: [
      { id: 'schedar', lon: 96, lat: 46, magnitude: 2.2 },
      { id: 'caph', lon: 100, lat: 50, magnitude: 2.0 },
      { id: 'gamma-cas', lon: 106, lat: 43, magnitude: 2.4 },
      { id: 'ruchbah', lon: 114, lat: 48, magnitude: 2.0 },
      { id: 'segin', lon: 122, lat: 42, magnitude: 1.9 },
    ],
    links: [
      ['caph', 'schedar'],
      ['schedar', 'gamma-cas'],
      ['gamma-cas', 'ruchbah'],
      ['ruchbah', 'segin'],
    ],
  },
  {
    id: 'ursa-major',
    name: 'Ursa Major',
    shortName: 'Đại Hùng',
    meaning: 'Định hướng và kiên định, thường được dùng làm mốc tìm phương hướng.',
    color: 'hsl(158 70% 62%)',
    center: { lon: 172, lat: 42 },
    stars: [
      { id: 'dubhe', lon: 155, lat: 53, magnitude: 2.4 },
      { id: 'merak', lon: 160, lat: 45, magnitude: 2.1 },
      { id: 'phecda', lon: 169, lat: 41, magnitude: 2.0 },
      { id: 'megrez', lon: 173, lat: 46, magnitude: 1.8 },
      { id: 'alioth', lon: 182, lat: 46, magnitude: 2.3 },
      { id: 'mizar', lon: 191, lat: 42, magnitude: 1.8 },
      { id: 'alkaid', lon: 200, lat: 36, magnitude: 2.1 },
    ],
    links: [
      ['dubhe', 'merak'],
      ['merak', 'phecda'],
      ['phecda', 'megrez'],
      ['megrez', 'dubhe'],
      ['megrez', 'alioth'],
      ['alioth', 'mizar'],
      ['mizar', 'alkaid'],
    ],
  },
  {
    id: 'scorpius',
    name: 'Scorpius',
    shortName: 'Bò cạp',
    meaning: 'Năng lượng chuyển hóa, mạnh mẽ và giàu trực giác.',
    color: 'hsl(352 84% 67%)',
    center: { lon: 256, lat: -6 },
    stars: [
      { id: 'antares', lon: 248, lat: 4, magnitude: 2.5 },
      { id: 'acrux', lon: 242, lat: -4, magnitude: 2.0 },
      { id: 'dschubba', lon: 256, lat: 10, magnitude: 2.2 },
      { id: 'sargas', lon: 266, lat: -5, magnitude: 2.1 },
      { id: 'jabbah', lon: 274, lat: -15, magnitude: 1.8 },
      { id: 'shaula', lon: 282, lat: -23, magnitude: 2.3 },
    ],
    links: [
      ['dschubba', 'antares'],
      ['antares', 'sargas'],
      ['sargas', 'jabbah'],
      ['jabbah', 'shaula'],
      ['antares', 'acrux'],
    ],
  },
  {
    id: 'leo',
    name: 'Leo',
    shortName: 'Sư tử',
    meaning: 'Sự tự tin, sáng tạo và tinh thần dẫn dắt.',
    color: 'hsl(29 95% 66%)',
    center: { lon: 320, lat: 18 },
    stars: [
      { id: 'regulus', lon: 306, lat: 13, magnitude: 2.4 },
      { id: 'algieba', lon: 315, lat: 23, magnitude: 2.1 },
      { id: 'zosma', lon: 327, lat: 20, magnitude: 1.9 },
      { id: 'chort', lon: 334, lat: 12, magnitude: 1.8 },
      { id: 'denebola', lon: 342, lat: 24, magnitude: 2.2 },
    ],
    links: [
      ['regulus', 'algieba'],
      ['algieba', 'zosma'],
      ['zosma', 'chort'],
      ['chort', 'denebola'],
    ],
  },
];

type ProjectedPoint = {
  id: string;
  x: number;
  y: number;
  visible: boolean;
  depth: number;
  source: ConstellationStar;
};

function angleDiff(lon: number, yaw: number): number {
  return ((lon - yaw + 540) % 360) - 180;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function projectPoint(lon: number, lat: number, yaw: number, pitch: number): ProjectedPoint {
  const dx = angleDiff(lon, yaw);
  const dy = lat - pitch;
  const visible = Math.abs(dx) <= H_FOV / 2 + 10 && Math.abs(dy) <= V_FOV / 2 + 10;
  const x = 50 + (dx / (H_FOV / 2)) * 50;
  const y = 50 - (dy / (V_FOV / 2)) * 50;
  const depth = 1 - Math.min(Math.abs(dx) / (H_FOV / 2), 1);

  return {
    id: '',
    x,
    y,
    visible,
    depth,
    source: { id: '', lon, lat, magnitude: 1.8 },
  };
}

function createBackgroundStars() {
  const stars: Array<{ lon: number; lat: number; size: number; alpha: number; delay: number }> = [];
  let seed = 131;

  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < 260; i += 1) {
    stars.push({
      lon: next() * 360,
      lat: -56 + next() * 112,
      size: 0.6 + next() * 2.2,
      alpha: 0.2 + next() * 0.75,
      delay: next() * 5,
    });
  }

  return stars;
}

const backgroundStars = createBackgroundStars();

const Sky360 = () => {
  const [yaw, setYaw] = useState(32);
  const [pitch, setPitch] = useState(4);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeConstellationId, setActiveConstellationId] = useState(constellations[0].id);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const timer = window.setInterval(() => {
      setYaw((prev) => (prev + 0.2) % 360);
    }, 30);
    return () => window.clearInterval(timer);
  }, [autoRotate, isDragging]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') setYaw((prev) => (prev - 4 + 360) % 360);
      if (event.key === 'ArrowRight') setYaw((prev) => (prev + 4) % 360);
      if (event.key === 'ArrowUp') setPitch((prev) => clamp(prev + 3, -28, 28));
      if (event.key === 'ArrowDown') setPitch((prev) => clamp(prev - 3, -28, 28));
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const projectedBackgroundStars = useMemo(() => {
    return backgroundStars
      .map((star) => {
        const projected = projectPoint(star.lon, star.lat, yaw, pitch);
        return {
          ...projected,
          size: star.size,
          alpha: star.alpha,
          delay: star.delay,
        };
      })
      .filter((star) => star.visible);
  }, [yaw, pitch]);

  const projectedConstellations = useMemo(() => {
    return constellations.map((constellation) => {
      const points = constellation.stars.map((star) => {
        const projected = projectPoint(star.lon, star.lat, yaw, pitch);
        return {
          ...projected,
          id: star.id,
          source: star,
        };
      });

      const pointMap = new Map(points.map((point) => [point.id, point]));
      const links = constellation.links
        .map(([from, to]) => {
          const a = pointMap.get(from);
          const b = pointMap.get(to);
          if (!a || !b || !a.visible || !b.visible) return null;
          if (Math.abs(a.x - b.x) > 60) return null;
          return { a, b };
        })
        .filter(Boolean) as Array<{ a: ProjectedPoint; b: ProjectedPoint }>;

      const visiblePoints = points.filter((point) => point.visible);
      const centroid =
        visiblePoints.length > 0
          ? {
              x: visiblePoints.reduce((sum, point) => sum + point.x, 0) / visiblePoints.length,
              y: visiblePoints.reduce((sum, point) => sum + point.y, 0) / visiblePoints.length,
            }
          : null;

      return {
        ...constellation,
        points,
        links,
        visiblePoints,
        centroid,
      };
    });
  }, [yaw, pitch]);

  const activeConstellation =
    projectedConstellations.find((item) => item.id === activeConstellationId) ?? projectedConstellations[0];

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    dragRef.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);
    setAutoRotate(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (!dragRef.current) return;

    const deltaX = event.clientX - dragRef.current.x;
    const deltaY = event.clientY - dragRef.current.y;
    dragRef.current = { x: event.clientX, y: event.clientY };

    setYaw((prev) => (prev - deltaX * 0.17 + 360) % 360);
    setPitch((prev) => clamp(prev + deltaY * 0.12, -28, 28));
  };

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = (event) => {
    dragRef.current = null;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const focusConstellation = (id: string) => {
    const target = constellations.find((item) => item.id === id);
    if (!target) return;
    setActiveConstellationId(id);
    setYaw(target.center.lon);
    setPitch(target.center.lat);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_20%_10%,hsl(214_95%_65%_/_0.18),transparent_45%),radial-gradient(circle_at_80%_0%,hsl(43_92%_64%_/_0.16),transparent_48%),radial-gradient(circle_at_50%_100%,hsl(286_68%_41%_/_0.22),transparent_60%)]" />

      <div className="container relative mx-auto px-4 py-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 max-w-6xl rounded-3xl border border-border/60 bg-card/45 p-5 backdrop-blur md:p-7"
        >
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/40 px-4 py-1.5">
                <Stars className="h-4 w-4 text-gold" />
                <span className="text-xs tracking-[0.2em] uppercase text-gold/90">Celestial Observatory</span>
              </div>
              <h1 className="text-3xl font-bold text-gold md:text-4xl" style={{ fontFamily: 'Cinzel, serif' }}>
                Bầu Trời 360° Với Các Chòm Sao
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Kéo chuột hoặc vuốt để quan sát không gian 360 độ. Chọn một chòm sao để tập trung và đọc nhanh ý nghĩa biểu tượng.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Hướng nhìn</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{Math.round(yaw)}°</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Độ cao</p>
                <p className="mt-1 text-sm font-semibold text-gold">{Math.round(pitch)}°</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/45 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Chòm sao focus</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{activeConstellation.name}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border/60 bg-card/45 p-3 md:p-4"
        >
          <div
            className={cn(
              'relative h-[60vh] min-h-[420px] overflow-hidden rounded-2xl border border-border/60 bg-mystic-gradient touch-none',
              isDragging ? 'cursor-grabbing' : 'cursor-grab',
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.08),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,hsl(220_60%_62%_/_0.06),transparent_35%,hsl(276_72%_35%_/_0.12))]" />

            {projectedBackgroundStars.map((star, index) => (
              <span
                key={`bg-${index}`}
                className="pointer-events-none absolute rounded-full animate-pulse-slow"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.alpha,
                  background: 'hsl(var(--gold) / 0.88)',
                  animationDelay: `${star.delay}s`,
                  transform: `translate(-50%, -50%) scale(${0.85 + star.depth * 0.35})`,
                }}
              />
            ))}

            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              {projectedConstellations.map((constellation) =>
                constellation.links.map((link, index) => (
                  <line
                    key={`${constellation.id}-line-${index}`}
                    x1={`${link.a.x}%`}
                    y1={`${link.a.y}%`}
                    x2={`${link.b.x}%`}
                    y2={`${link.b.y}%`}
                    stroke={constellation.color}
                    strokeOpacity={constellation.id === activeConstellationId ? 0.85 : 0.45}
                    strokeWidth={constellation.id === activeConstellationId ? 1.5 : 1}
                  />
                )),
              )}
            </svg>

            {projectedConstellations.map((constellation) =>
              constellation.points.map((point) => {
                if (!point.visible) return null;
                const isActive = constellation.id === activeConstellationId;

                return (
                  <button
                    key={`${constellation.id}-${point.id}`}
                    type="button"
                    onClick={() => setActiveConstellationId(constellation.id)}
                    className="absolute rounded-full transition-transform hover:scale-125"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      width: `${point.source.magnitude + (isActive ? 4 : 3)}px`,
                      height: `${point.source.magnitude + (isActive ? 4 : 3)}px`,
                      transform: `translate(-50%, -50%) scale(${0.9 + point.depth * 0.4})`,
                      background: constellation.color,
                      boxShadow: `0 0 16px ${constellation.color}`,
                      opacity: isActive ? 1 : 0.78,
                    }}
                    aria-label={`${constellation.name} - ${point.id}`}
                  />
                );
              }),
            )}

            {projectedConstellations.map((constellation) => {
              if (!constellation.centroid || constellation.id !== activeConstellationId) return null;
              return (
                <div
                  key={`${constellation.id}-label`}
                  className="pointer-events-none absolute rounded-full border border-gold/40 bg-background/60 px-3 py-1 text-xs font-semibold tracking-wide text-gold backdrop-blur"
                  style={{
                    left: `${constellation.centroid.x}%`,
                    top: `${Math.max(6, constellation.centroid.y - 8)}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {constellation.name.toUpperCase()}
                </div>
              );
            })}

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/70 bg-gold/20 shadow-[0_0_18px_hsl(var(--gold)/0.35)]" />

            <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-background/50 p-2 backdrop-blur">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRotate((prev) => !prev)}
                className="h-8 border-gold/35 bg-background/50 text-gold hover:bg-secondary"
              >
                {autoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {autoRotate ? 'Tạm dừng' : 'Tự xoay'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setYaw(32);
                  setPitch(4);
                  setAutoRotate(true);
                }}
                className="h-8 border-gold/35 bg-background/50 text-gold hover:bg-secondary"
              >
                <RotateCcw className="h-4 w-4" />
                Reset góc nhìn
              </Button>
            </div>

            <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-border/60 bg-background/45 p-3 text-xs text-muted-foreground backdrop-blur md:text-sm">
              Kéo chuột để xoay 360°. Phím mũi tên trái/phải để đổi hướng, lên/xuống để chỉnh độ cao.
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="mx-auto mt-6 grid max-w-6xl gap-4 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="rounded-2xl border border-border/60 bg-card/45 p-4 md:p-5">
            <div className="mb-4 flex items-center gap-2">
              <Compass className="h-5 w-5 text-gold" />
              <h2 className="text-xl font-semibold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                Chọn Chòm Sao
              </h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {constellations.map((constellation) => (
                <button
                  key={constellation.id}
                  type="button"
                  onClick={() => focusConstellation(constellation.id)}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-left transition-all',
                    activeConstellationId === constellation.id
                      ? 'border-gold/45 bg-gold/10 text-gold shadow-[0_8px_24px_hsl(var(--gold)/0.16)]'
                      : 'border-border/60 bg-background/45 text-foreground hover:border-gold/35',
                  )}
                >
                  <p className="text-sm font-semibold">{constellation.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{constellation.shortName}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gold/25 bg-card/45 p-4 md:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              <h2 className="text-xl font-semibold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                {activeConstellation.name}
              </h2>
              <Badge variant="secondary" className="border-gold/25">
                {activeConstellation.shortName}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{activeConstellation.meaning}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              Gợi ý: dùng chế độ này như một không gian “tĩnh tâm thị giác” trước khi bắt đầu trải bài.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Sky360;
