import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Compass, Pause, Play, RotateCcw, Sparkles, Stars, Info, ChevronRight, Map as MapIcon, Wand2 } from 'lucide-react';
import { zodiacSigns } from '@/data/zodiac';

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
  isZodiac?: boolean;
  symbol?: string;
};

const H_FOV = 110;
const V_FOV = 72;

// Transform zodiac signs from data to 360 constellations
const zodiacConstellations: Constellation[] = zodiacSigns.map((sign, index) => {
  // Distribute lon every 30 degrees starting from 0
  const centerLon = (index * 30) % 360;
  const centerLat = Math.sin(index * 0.5) * 15; // Vary lat slightly for visual interest

  return {
    id: sign.id,
    name: sign.name,
    shortName: sign.element,
    meaning: sign.strength,
    color: sign.color,
    symbol: sign.symbol,
    isZodiac: true,
    center: { lon: centerLon, lat: centerLat },
    stars: sign.constellation.stars.map(s => ({
      id: s.id,
      lon: centerLon + (s.x - 50) * 0.3, // Scale x/y to lon/lat
      lat: centerLat - (s.y - 50) * 0.3,
      magnitude: s.size
    })),
    links: sign.constellation.links
  };
});

const otherConstellations: Constellation[] = [
  {
    id: 'orion',
    name: 'Orion',
    shortName: 'Thợ săn',
    meaning: 'Biểu tượng của ý chí, hành động và sự can đảm đối mặt thử thách.',
    color: 'hsl(45 92% 64%)',
    center: { lon: 45, lat: -15 }, // Adjusted to not overlap much with Taurus (30) or Gemini (60)
    stars: [
      { id: 'betelgeuse', lon: 35, lat: -1 },
      { id: 'bellatrix', lon: 44, lat: -3 },
      { id: 'alnitak', lon: 41, lat: -15 },
      { id: 'alnilam', lon: 45, lat: -15 },
      { id: 'mintaka', lon: 49, lat: -14 },
      { id: 'saiph', lon: 41, lat: -30 },
      { id: 'rigel', lon: 53, lat: -32 },
    ].map(s => ({ ...s, magnitude: 1.8 + Math.random() })),
    links: [
      ['betelgeuse', 'bellatrix'], ['betelgeuse', 'alnitak'], ['bellatrix', 'mintaka'],
      ['alnitak', 'alnilam'], ['alnilam', 'mintaka'], ['alnitak', 'saiph'],
      ['mintaka', 'rigel'], ['saiph', 'rigel'],
    ],
  },
  {
    id: 'ursa-major',
    name: 'Ursa Major',
    shortName: 'Đại Hùng',
    meaning: 'Định hướng và kiên định, thường được dùng làm mốc tìm phương hướng.',
    color: 'hsl(158 70% 62%)',
    center: { lon: 172, lat: 45 },
    stars: [
      { id: 'dubhe', lon: 155, lat: 56 }, { id: 'merak', lon: 160, lat: 48 },
      { id: 'phecda', lon: 169, lat: 44 }, { id: 'megrez', lon: 173, lat: 49 },
      { id: 'alioth', lon: 182, lat: 49 }, { id: 'mizar', lon: 191, lat: 45 },
      { id: 'alkaid', lon: 200, lat: 39 },
    ].map(s => ({ ...s, magnitude: 1.8 + Math.random() })),
    links: [
      ['dubhe', 'merak'], ['merak', 'phecda'], ['phecda', 'megrez'],
      ['megrez', 'dubhe'], ['megrez', 'alioth'], ['alioth', 'mizar'], ['mizar', 'alkaid'],
    ],
  },
];

const constellations = [...zodiacConstellations, ...otherConstellations];

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
  const visible = Math.abs(dx) <= H_FOV / 2 + 15 && Math.abs(dy) <= V_FOV / 2 + 15;
  const x = 50 + (dx / (H_FOV / 2)) * 50;
  const y = 50 - (dy / (V_FOV / 2)) * 50;
  const depth = 1 - Math.min(Math.sqrt(dx*dx + dy*dy) / (H_FOV / 1.5), 1);

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
  const stars: Array<{ lon: number; lat: number; size: number; alpha: number; delay: number; color: string }> = [];
  let seed = 131;

  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const colors = ['#ffffff', '#fff4ea', '#f0faff', '#fff8e7', '#e2f2ff'];

  for (let i = 0; i < 350; i += 1) {
    stars.push({
      lon: next() * 360,
      lat: -70 + next() * 140,
      size: 0.4 + next() * 2.5,
      alpha: 0.15 + next() * 0.8,
      delay: next() * 5,
      color: colors[Math.floor(next() * colors.length)]
    });
  }

  return stars;
}

const backgroundStars = createBackgroundStars();

// Shooting stars data
const shootingStarsInitial = Array.from({ length: 3 }).map(() => ({
  id: Math.random(),
  lon: Math.random() * 360,
  lat: Math.random() * 60 - 30,
  active: false
}));

const Sky360 = () => {
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeConstellationId, setActiveConstellationId] = useState(constellations[0].id);
  const [shootingStar, setShootingStar] = useState<{lon: number, lat: number, x: number, y: number} | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const requestRef = useRef<number>();

  // Auto-rotation logic
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const animate = () => {
      setYaw((prev) => (prev + 0.15) % 360);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [autoRotate, isDragging]);

  // Random shooting star
  useEffect(() => {
    const triggerShootingStar = () => {
      const lon = Math.random() * 360;
      const lat = Math.random() * 60 - 30;
      setShootingStar({ lon, lat, x: 0, y: 0 });
      
      setTimeout(() => {
        setShootingStar(null);
      }, 1000);
    };

    const timer = setInterval(() => {
      if (Math.random() > 0.7) triggerShootingStar();
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') setYaw((prev) => (prev - 4 + 360) % 360);
      if (event.key === 'ArrowRight') setYaw((prev) => (prev + 4) % 360);
      if (event.key === 'ArrowUp') setPitch((prev) => clamp(prev + 3, -35, 35));
      if (event.key === 'ArrowDown') setPitch((prev) => clamp(prev - 3, -35, 35));
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
          color: star.color
        };
      })
      .filter((star) => star.visible);
  }, [yaw, pitch]);

  const projectedShootingStar = useMemo(() => {
    if (!shootingStar) return null;
    const p = projectPoint(shootingStar.lon, shootingStar.lat, yaw, pitch);
    return p.visible ? p : null;
  }, [shootingStar, yaw, pitch]);

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

    setYaw((prev) => (prev - deltaX * 0.15 + 360) % 360);
    setPitch((prev) => clamp(prev + deltaY * 0.12, -35, 35));
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
    
    // Smooth transition
    const startYaw = yaw;
    const startPitch = pitch;
    const endYaw = target.center.lon;
    const endPitch = target.center.lat;
    
    // We'll let framer-motion or just state updates handle it
    // For now simple jump, but we could add lerp
    setYaw(endYaw);
    setPitch(endPitch);
    setAutoRotate(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#02040a]">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container relative mx-auto px-4 py-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-8 max-w-6xl rounded-3xl border border-gold/20 bg-card/30 p-6 backdrop-blur-2xl shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                <Stars className="h-4 w-4 text-gold" />
                <span className="text-xs tracking-[0.2em] uppercase text-gold/90 font-bold">Vũ Trụ Huyền Bí</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                Bầu Trời Tâm Linh 360°
              </h1>
              <p className="max-w-2xl text-muted-foreground leading-relaxed">
                Hòa mình vào không gian vô tận của vũ trụ. Khám phá 12 cung hoàng đạo và các chòm sao cổ đại để tìm thấy sự kết nối giữa bản thân và các vì tinh tú.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="bg-background/40 border border-gold/10 rounded-2xl p-4 min-w-[120px] backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Kinh độ (Yaw)</p>
                <p className="text-xl font-bold text-foreground flex items-baseline gap-1">
                  {Math.round(yaw)}<span className="text-xs text-gold">°</span>
                </p>
              </div>
              <div className="bg-background/40 border border-gold/10 rounded-2xl p-4 min-w-[120px] backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Vĩ độ (Pitch)</p>
                <p className="text-xl font-bold text-gold flex items-baseline gap-1">
                  {Math.round(pitch)}<span className="text-xs">°</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          
          {/* Constellation Selector Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
          >
            <div className="flex items-center gap-2 mb-4 px-2">
              <MapIcon className="w-5 h-5 text-gold" />
              <h3 className="font-bold text-gold uppercase tracking-widest text-sm">Danh sách chòm sao</h3>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-2 mb-2">Cung hoàng đạo</p>
              {zodiacConstellations.map((constellation) => (
                <button
                  key={constellation.id}
                  onClick={() => focusConstellation(constellation.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 group",
                    activeConstellationId === constellation.id
                      ? "bg-gold/10 border-gold/40 text-gold shadow-lg shadow-gold/5"
                      : "bg-card/20 border-white/5 text-muted-foreground hover:border-gold/20 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl group-hover:scale-110 transition-transform">{constellation.symbol}</span>
                    <span className="font-bold text-sm tracking-wide">{constellation.name}</span>
                  </div>
                  <ChevronRight className={cn("w-4 h-4 transition-transform", activeConstellationId === constellation.id ? "rotate-90 text-gold" : "opacity-0 group-hover:opacity-100")} />
                </button>
              ))}

              <div className="pt-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-2 mb-2">Chòm sao khác</p>
                {otherConstellations.map((constellation) => (
                  <button
                    key={constellation.id}
                    onClick={() => focusConstellation(constellation.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 group",
                      activeConstellationId === constellation.id
                        ? "bg-primary/10 border-primary/40 text-primary shadow-lg shadow-primary/5"
                        : "bg-card/20 border-white/5 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Stars className="w-5 h-5" />
                      <span className="font-bold text-sm tracking-wide">{constellation.name}</span>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 transition-transform", activeConstellationId === constellation.id ? "rotate-90 text-primary" : "opacity-0 group-hover:opacity-100")} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main 360 Viewer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            <div
              className={cn(
                'relative h-[65vh] min-h-[500px] overflow-hidden rounded-[2.5rem] border-2 border-gold/20 bg-mystic-gradient shadow-2xl touch-none group/viewer',
                isDragging ? 'cursor-grabbing' : 'cursor-grab',
              )}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* Nebula Effects */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] bg-blue-500/5 blur-[80px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-[30%] right-[20%] w-[50%] h-[50%] bg-purple-500/5 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: '3s' }} />
              </div>

              {/* Background Stars */}
              {projectedBackgroundStars.map((star, index) => (
                <span
                  key={`bg-${index}`}
                  className="pointer-events-none absolute rounded-full"
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    opacity: star.alpha * (0.5 + star.depth * 0.5),
                    background: star.color,
                    boxShadow: star.size > 1.5 ? `0 0 8px ${star.color}` : 'none',
                    transform: `translate(-50%, -50%) scale(${0.8 + star.depth * 0.4})`,
                  }}
                />
              ))}

              {/* Shooting Star */}
              {projectedShootingStar && (
                <motion.div
                  initial={{ opacity: 0, x: -100, y: -100 }}
                  animate={{ opacity: [0, 1, 0], x: 100, y: 100 }}
                  transition={{ duration: 0.8, ease: "linear" }}
                  className="absolute pointer-events-none w-1 h-1 bg-white rounded-full shadow-[0_0_20px_white]"
                  style={{
                    left: `${projectedShootingStar.x}%`,
                    top: `${projectedShootingStar.y}%`,
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-full -translate-y-1/2 w-20 h-[1px] bg-gradient-to-r from-transparent to-white" />
                </motion.div>
              )}

              {/* Constellation Lines */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {projectedConstellations.map((constellation) =>
                  constellation.links.map((link, index) => (
                    <line
                      key={`${constellation.id}-line-${index}`}
                      x1={`${link.a.x}%`}
                      y1={`${link.a.y}%`}
                      x2={`${link.b.x}%`}
                      y2={`${link.b.y}%`}
                      stroke={constellation.color}
                      strokeOpacity={constellation.id === activeConstellationId ? 0.9 : 0.2}
                      strokeWidth={constellation.id === activeConstellationId ? 2 : 1}
                      filter={constellation.id === activeConstellationId ? "url(#glow)" : "none"}
                      style={{ transition: 'stroke-opacity 0.5s, stroke-width 0.5s' }}
                    />
                  )),
                )}
              </svg>

              {/* Constellation Stars */}
              {projectedConstellations.map((constellation) =>
                constellation.points.map((point) => {
                  if (!point.visible) return null;
                  const isActive = constellation.id === activeConstellationId;

                  return (
                    <button
                      key={`${constellation.id}-${point.id}`}
                      type="button"
                      onClick={() => focusConstellation(constellation.id)}
                      className="absolute rounded-full transition-all duration-500 hover:scale-150"
                      style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        width: `${point.source.magnitude * (isActive ? 2.5 : 1.5) + 4}px`,
                        height: `${point.source.magnitude * (isActive ? 2.5 : 1.5) + 4}px`,
                        transform: `translate(-50%, -50%) scale(${0.9 + point.depth * 0.4})`,
                        background: constellation.color,
                        boxShadow: `0 0 ${isActive ? 20 : 10}px ${constellation.color}`,
                        opacity: isActive ? 1 : 0.4,
                        zIndex: isActive ? 10 : 1
                      }}
                    />
                  );
                }),
              )}

              {/* Active Constellation Label */}
              <AnimatePresence>
                {activeConstellation.centroid && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="pointer-events-none absolute flex flex-col items-center gap-1"
                    style={{
                      left: `${activeConstellation.centroid.x}%`,
                      top: `${Math.max(10, activeConstellation.centroid.y - 12)}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="bg-background/80 border border-gold/40 px-4 py-2 rounded-2xl backdrop-blur-xl shadow-2xl">
                      <div className="flex items-center gap-2">
                        {activeConstellation.symbol && <span className="text-xl">{activeConstellation.symbol}</span>}
                        <span className="text-sm font-bold tracking-[0.2em] text-gold uppercase">{activeConstellation.name}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Center Reticle */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-30 group-hover/viewer:opacity-100 transition-opacity">
                <div className="w-full h-full border border-gold/40 rounded-full animate-ping-slow" />
                <div className="absolute w-1 h-1 bg-gold rounded-full" />
              </div>

              {/* Controls Overlay */}
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <div className="bg-background/40 border border-white/10 p-1 rounded-2xl backdrop-blur-xl flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAutoRotate((prev) => !prev)}
                    className={cn("h-10 rounded-xl px-4 transition-all", autoRotate ? "text-gold bg-gold/10" : "text-muted-foreground")}
                  >
                    {autoRotate ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {autoRotate ? 'Dừng xoay' : 'Tự xoay'}
                  </Button>
                  <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setYaw(0);
                      setPitch(0);
                      setAutoRotate(true);
                    }}
                    className="h-10 rounded-xl px-4 text-muted-foreground hover:text-gold"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Info Tip Overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="bg-black/40 border border-white/5 px-4 py-2 rounded-full backdrop-blur-xl text-[10px] uppercase tracking-widest text-white/60 flex items-center gap-2">
                  <Compass className="w-3 h-3" />
                  Kéo để xoay • Phím mũi tên để điều chỉnh
                </div>
                <div className="flex gap-2">
                   {/* Elements indicator */}
                   <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-400">Khí</Badge>
                   <Badge variant="outline" className="bg-red-500/10 border-red-500/20 text-red-400">Lửa</Badge>
                   <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-400">Đất</Badge>
                   <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400">Nước</Badge>
                </div>
              </div>
            </div>

            {/* Constellation Details Card */}
            <motion.div
              key={activeConstellation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-gold/20 bg-card/30 p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                {activeConstellation.symbol && <span className="text-[120px] leading-none">{activeConstellation.symbol}</span>}
              </div>
              
              <div className="relative space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-3xl">
                    {activeConstellation.symbol || <Stars className="w-8 h-8 text-gold" />}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                      {activeConstellation.name}
                    </h2>
                    <p className="text-sm text-muted-foreground uppercase tracking-[0.3em] font-bold">
                      {activeConstellation.shortName}
                    </p>
                  </div>
                </div>
                
                <Separator className="bg-gold/10" />
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-gold mt-1 flex-shrink-0" />
                    <p className="text-lg leading-relaxed text-foreground/90 italic">
                      "{activeConstellation.meaning}"
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button className="rounded-full glow-gold px-8 py-6 h-auto font-bold text-lg group" asChild>
                      <Link to={activeConstellation.isZodiac ? `/zodiac` : `/reading`}>
                        {activeConstellation.isZodiac ? 'Khám phá Cung' : 'Bắt đầu Trải bài'}
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="rounded-full border-gold/20 text-gold hover:bg-gold/5 px-8 py-6 h-auto font-bold text-lg">
                      <Wand2 className="w-5 h-5 mr-2" />
                      Thiền định
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Sky360;
