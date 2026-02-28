import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, Droplets, Flame, Mountain, Sparkles, Sun, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

type ZodiacElement = 'Lửa' | 'Đất' | 'Khí' | 'Nước';

type ConstellationStar = {
  id: string;
  x: number;
  y: number;
  size: number;
};

type ZodiacConstellation = {
  latinName: string;
  description: string;
  stars: ConstellationStar[];
  links: Array<[string, string]>;
};

type ZodiacSign = {
  id: string;
  name: string;
  symbol: string;
  dateRange: string;
  element: ZodiacElement;
  rulingPlanet: string;
  keywords: string[];
  strength: string;
  challenge: string;
  advice: string;
  color: string;
  imagePath: string;
  range: [number, number];
  constellation: ZodiacConstellation;
};

const zodiacSigns: ZodiacSign[] = [
  {
    id: 'aries',
    name: 'Bạch Dương',
    symbol: '♈',
    dateRange: '21/03 - 19/04',
    element: 'Lửa',
    rulingPlanet: 'Sao Hỏa',
    keywords: ['Chủ động', 'Dũng cảm', 'Nhiệt huyết'],
    strength: 'Bứt phá nhanh và rất quyết đoán khi đã chọn hướng đi.',
    challenge: 'Dễ nóng vội hoặc hành động trước khi đánh giá đủ dữ kiện.',
    advice: 'Đặt một mốc kiểm tra ngắn trước khi ra quyết định lớn.',
    color: 'hsl(12 88% 62%)',
    imagePath: '/zodiac/aries.svg',
    range: [321, 419],
    constellation: {
      latinName: 'Aries',
      description: 'Nhóm sao hình cong nhỏ, biểu tượng đầu cừu và tinh thần tiên phong.',
      stars: [
        { id: 'hamal', x: 18, y: 70, size: 3.3 },
        { id: 'sheratan', x: 34, y: 57, size: 2.8 },
        { id: 'mesarthim', x: 50, y: 46, size: 2.4 },
        { id: 'botein', x: 67, y: 36, size: 2.2 },
        { id: 'gamma-ari', x: 84, y: 28, size: 2.0 },
      ],
      links: [
        ['hamal', 'sheratan'],
        ['sheratan', 'mesarthim'],
        ['mesarthim', 'botein'],
        ['botein', 'gamma-ari'],
      ],
    },
  },
  {
    id: 'taurus',
    name: 'Kim Ngưu',
    symbol: '♉',
    dateRange: '20/04 - 20/05',
    element: 'Đất',
    rulingPlanet: 'Sao Kim',
    keywords: ['Ổn định', 'Kiên trì', 'Thực tế'],
    strength: 'Có năng lực xây dựng nền tảng bền vững và đáng tin cậy.',
    challenge: 'Ngại thay đổi khi môi trường đã không còn phù hợp.',
    advice: 'Giữ vững giá trị cốt lõi nhưng linh hoạt với cách thực hiện.',
    color: 'hsl(124 42% 55%)',
    imagePath: '/zodiac/taurus.svg',
    range: [420, 520],
    constellation: {
      latinName: 'Taurus',
      description: 'Cụm sao tạo thành đầu bò với Aldebaran sáng nổi bật.',
      stars: [
        { id: 'aldebaran', x: 40, y: 56, size: 3.5 },
        { id: 'elnath', x: 64, y: 36, size: 2.8 },
        { id: 'ain', x: 26, y: 40, size: 2.5 },
        { id: 'hyadum', x: 36, y: 42, size: 2.3 },
        { id: 'prima-hya', x: 53, y: 49, size: 2.1 },
        { id: 'secunda-hya', x: 64, y: 58, size: 2.0 },
        { id: 'zeta-tau', x: 76, y: 70, size: 2.1 },
      ],
      links: [
        ['ain', 'hyadum'],
        ['hyadum', 'aldebaran'],
        ['aldebaran', 'prima-hya'],
        ['prima-hya', 'secunda-hya'],
        ['secunda-hya', 'zeta-tau'],
        ['aldebaran', 'elnath'],
      ],
    },
  },
  {
    id: 'gemini',
    name: 'Song Tử',
    symbol: '♊',
    dateRange: '21/05 - 20/06',
    element: 'Khí',
    rulingPlanet: 'Sao Thủy',
    keywords: ['Linh hoạt', 'Giao tiếp', 'Tò mò'],
    strength: 'Học nhanh và kết nối thông tin tốt trong nhiều bối cảnh.',
    challenge: 'Dễ phân tán năng lượng, khó giữ nhịp cho mục tiêu dài hạn.',
    advice: 'Mỗi ngày ưu tiên một việc quan trọng nhất trước tiên.',
    color: 'hsl(214 85% 66%)',
    imagePath: '/zodiac/gemini.svg',
    range: [521, 620],
    constellation: {
      latinName: 'Gemini',
      description: 'Hai chuỗi sao song hành tượng trưng cặp song sinh Castor và Pollux.',
      stars: [
        { id: 'castor', x: 30, y: 24, size: 3.0 },
        { id: 'pollux', x: 52, y: 28, size: 3.3 },
        { id: 'wasat', x: 38, y: 48, size: 2.4 },
        { id: 'mekbuda', x: 58, y: 52, size: 2.4 },
        { id: 'tejat', x: 38, y: 73, size: 2.2 },
        { id: 'propus', x: 57, y: 78, size: 2.1 },
      ],
      links: [
        ['castor', 'wasat'],
        ['wasat', 'tejat'],
        ['pollux', 'mekbuda'],
        ['mekbuda', 'propus'],
        ['wasat', 'mekbuda'],
      ],
    },
  },
  {
    id: 'cancer',
    name: 'Cự Giải',
    symbol: '♋',
    dateRange: '21/06 - 22/07',
    element: 'Nước',
    rulingPlanet: 'Mặt Trăng',
    keywords: ['Tinh tế', 'Bảo vệ', 'Gắn kết'],
    strength: 'Đồng cảm tốt, biết tạo cảm giác an toàn cho người xung quanh.',
    challenge: 'Dễ bị cảm xúc kéo lệch khỏi mục tiêu thực tế.',
    advice: 'Ghi rõ ranh giới cảm xúc để giữ sự cân bằng trong quyết định.',
    color: 'hsl(194 82% 65%)',
    imagePath: '/zodiac/cancer.svg',
    range: [621, 722],
    constellation: {
      latinName: 'Cancer',
      description: 'Nhóm sao mờ với cụm Beehive ở trung tâm, tạo hình như chiếc càng cua.',
      stars: [
        { id: 'acubens', x: 26, y: 50, size: 2.8 },
        { id: 'altarf', x: 44, y: 35, size: 2.4 },
        { id: 'asellus-borealis', x: 50, y: 52, size: 2.7 },
        { id: 'asellus-australis', x: 58, y: 60, size: 2.5 },
        { id: 'tegmine', x: 74, y: 49, size: 2.3 },
      ],
      links: [
        ['acubens', 'asellus-borealis'],
        ['asellus-borealis', 'asellus-australis'],
        ['asellus-australis', 'tegmine'],
        ['asellus-borealis', 'altarf'],
      ],
    },
  },
  {
    id: 'leo',
    name: 'Sư Tử',
    symbol: '♌',
    dateRange: '23/07 - 22/08',
    element: 'Lửa',
    rulingPlanet: 'Mặt Trời',
    keywords: ['Tự tin', 'Sáng tạo', 'Dẫn dắt'],
    strength: 'Lan tỏa năng lượng tích cực và truyền cảm hứng mạnh.',
    challenge: 'Dễ tự tạo áp lực phải luôn hoàn hảo trước người khác.',
    advice: 'Tập trung giá trị thực tế thay vì chỉ kết quả bề mặt.',
    color: 'hsl(41 94% 59%)',
    imagePath: '/zodiac/leo.svg',
    range: [723, 822],
    constellation: {
      latinName: 'Leo',
      description: 'Hình dấu hỏi ngược (The Sickle) và phần thân sư tử kéo dài về phía đông.',
      stars: [
        { id: 'regulus', x: 24, y: 58, size: 3.5 },
        { id: 'algieba', x: 33, y: 40, size: 2.8 },
        { id: 'adhafera', x: 45, y: 30, size: 2.5 },
        { id: 'ras-elased', x: 57, y: 36, size: 2.2 },
        { id: 'zosma', x: 68, y: 50, size: 2.4 },
        { id: 'denebola', x: 82, y: 62, size: 2.7 },
      ],
      links: [
        ['regulus', 'algieba'],
        ['algieba', 'adhafera'],
        ['adhafera', 'ras-elased'],
        ['ras-elased', 'zosma'],
        ['zosma', 'denebola'],
      ],
    },
  },
  {
    id: 'virgo',
    name: 'Xử Nữ',
    symbol: '♍',
    dateRange: '23/08 - 22/09',
    element: 'Đất',
    rulingPlanet: 'Sao Thủy',
    keywords: ['Tỉ mỉ', 'Phân tích', 'Kỷ luật'],
    strength: 'Nhìn ra chi tiết then chốt và tối ưu quy trình rất tốt.',
    challenge: 'Có thể tự phê bình quá mức dẫn đến trì hoãn.',
    advice: 'Hoàn thành phiên bản 80% trước, tối ưu sau.',
    color: 'hsl(146 45% 58%)',
    imagePath: '/zodiac/virgo.svg',
    range: [823, 922],
    constellation: {
      latinName: 'Virgo',
      description: 'Một chuỗi sao dài với Spica là điểm sáng chủ đạo của chòm.',
      stars: [
        { id: 'zavijava', x: 18, y: 42, size: 2.3 },
        { id: 'porrima', x: 31, y: 50, size: 2.4 },
        { id: 'auva', x: 43, y: 44, size: 2.2 },
        { id: 'vindemiatrix', x: 56, y: 34, size: 2.5 },
        { id: 'heze', x: 67, y: 46, size: 2.0 },
        { id: 'spica', x: 76, y: 62, size: 3.6 },
        { id: 'syrma', x: 62, y: 72, size: 2.0 },
        { id: 'kappa-vir', x: 45, y: 70, size: 1.9 },
      ],
      links: [
        ['zavijava', 'porrima'],
        ['porrima', 'auva'],
        ['auva', 'vindemiatrix'],
        ['vindemiatrix', 'heze'],
        ['heze', 'spica'],
        ['spica', 'syrma'],
        ['syrma', 'kappa-vir'],
      ],
    },
  },
  {
    id: 'libra',
    name: 'Thiên Bình',
    symbol: '♎',
    dateRange: '23/09 - 22/10',
    element: 'Khí',
    rulingPlanet: 'Sao Kim',
    keywords: ['Cân bằng', 'Hợp tác', 'Thẩm mỹ'],
    strength: 'Giỏi kết nối và dung hòa các quan điểm khác nhau.',
    challenge: 'Dễ chần chừ vì muốn mọi thứ hài hòa tuyệt đối.',
    advice: 'Đặt thời hạn quyết định rõ ràng để tránh kéo dài.',
    color: 'hsl(281 72% 66%)',
    imagePath: '/zodiac/libra.svg',
    range: [923, 1022],
    constellation: {
      latinName: 'Libra',
      description: 'Nhóm sao nhỏ cân đối mô phỏng hai đĩa cân của nữ thần công lý.',
      stars: [
        { id: 'zubenelgenubi', x: 22, y: 58, size: 2.8 },
        { id: 'zubeneschamali', x: 44, y: 44, size: 3.0 },
        { id: 'brachium', x: 64, y: 38, size: 2.1 },
        { id: 'sigma-lib', x: 75, y: 56, size: 2.0 },
        { id: 'upsilon-lib', x: 56, y: 68, size: 1.9 },
      ],
      links: [
        ['zubenelgenubi', 'zubeneschamali'],
        ['zubeneschamali', 'brachium'],
        ['brachium', 'sigma-lib'],
        ['sigma-lib', 'upsilon-lib'],
        ['upsilon-lib', 'zubenelgenubi'],
      ],
    },
  },
  {
    id: 'scorpio',
    name: 'Bọ Cạp',
    symbol: '♏',
    dateRange: '23/10 - 21/11',
    element: 'Nước',
    rulingPlanet: 'Sao Diêm Vương',
    keywords: ['Sâu sắc', 'Kiên định', 'Chuyển hóa'],
    strength: 'Đào sâu bản chất vấn đề và theo đuổi đến cùng.',
    challenge: 'Khó buông bỏ khi đã đầu tư cảm xúc mạnh.',
    advice: 'Dùng dữ kiện hiện tại để đánh giá thay vì ký ức cũ.',
    color: 'hsl(338 85% 63%)',
    imagePath: '/zodiac/scorpio.svg',
    range: [1023, 1121],
    constellation: {
      latinName: 'Scorpius',
      description: 'Hình cong dài như chiếc đuôi bọ cạp, nổi bật với Antares đỏ cam.',
      stars: [
        { id: 'dschubba', x: 20, y: 34, size: 2.4 },
        { id: 'antares', x: 36, y: 50, size: 3.8 },
        { id: 'acrux', x: 42, y: 62, size: 2.1 },
        { id: 'sargas', x: 56, y: 58, size: 2.3 },
        { id: 'jabbah', x: 68, y: 66, size: 2.0 },
        { id: 'shaula', x: 79, y: 78, size: 2.6 },
        { id: 'lesath', x: 89, y: 74, size: 2.1 },
      ],
      links: [
        ['dschubba', 'antares'],
        ['antares', 'acrux'],
        ['antares', 'sargas'],
        ['sargas', 'jabbah'],
        ['jabbah', 'shaula'],
        ['shaula', 'lesath'],
      ],
    },
  },
  {
    id: 'sagittarius',
    name: 'Nhân Mã',
    symbol: '♐',
    dateRange: '22/11 - 21/12',
    element: 'Lửa',
    rulingPlanet: 'Sao Mộc',
    keywords: ['Tự do', 'Khám phá', 'Lạc quan'],
    strength: 'Mở rộng tầm nhìn và thích nghi nhanh với bối cảnh mới.',
    challenge: 'Dễ bỏ ngang nếu thiếu cảm hứng tức thời.',
    advice: 'Chia mục tiêu lớn thành chặng ngắn để giữ đà.',
    color: 'hsl(29 91% 63%)',
    imagePath: '/zodiac/sagittarius.svg',
    range: [1122, 1221],
    constellation: {
      latinName: 'Sagittarius',
      description: 'Cụm “teapot” nổi tiếng, biểu trưng chiếc cung đang giương bắn.',
      stars: [
        { id: 'kaus-borealis', x: 24, y: 46, size: 2.2 },
        { id: 'nunki', x: 39, y: 36, size: 2.8 },
        { id: 'phi-sgr', x: 49, y: 46, size: 2.0 },
        { id: 'kaus-media', x: 58, y: 56, size: 2.4 },
        { id: 'kaus-australis', x: 46, y: 70, size: 3.0 },
        { id: 'ascella', x: 68, y: 64, size: 2.3 },
        { id: 'alnasl', x: 82, y: 77, size: 2.2 },
      ],
      links: [
        ['kaus-borealis', 'nunki'],
        ['nunki', 'phi-sgr'],
        ['phi-sgr', 'kaus-media'],
        ['kaus-media', 'kaus-australis'],
        ['kaus-australis', 'kaus-borealis'],
        ['kaus-media', 'ascella'],
        ['ascella', 'alnasl'],
      ],
    },
  },
  {
    id: 'capricorn',
    name: 'Ma Kết',
    symbol: '♑',
    dateRange: '22/12 - 19/01',
    element: 'Đất',
    rulingPlanet: 'Sao Thổ',
    keywords: ['Bền bỉ', 'Trách nhiệm', 'Chiến lược'],
    strength: 'Lập kế hoạch tốt và có năng lực triển khai dài hạn.',
    challenge: 'Dễ cứng nhắc hoặc quá nghiêm khắc với chính mình.',
    advice: 'Xen kẽ nhịp nghỉ để duy trì hiệu suất bền vững.',
    color: 'hsl(213 24% 62%)',
    imagePath: '/zodiac/capricorn.svg',
    range: [1222, 119],
    constellation: {
      latinName: 'Capricornus',
      description: 'Hình tam giác lệch nhẹ, tượng trưng sinh vật dê biển trong thần thoại.',
      stars: [
        { id: 'algiedi', x: 20, y: 64, size: 2.7 },
        { id: 'dabih', x: 34, y: 50, size: 2.9 },
        { id: 'nashira', x: 52, y: 44, size: 2.3 },
        { id: 'deneb-algedi', x: 70, y: 58, size: 2.8 },
        { id: 'omega-cap', x: 54, y: 70, size: 1.9 },
        { id: 'iota-cap', x: 34, y: 76, size: 2.0 },
      ],
      links: [
        ['algiedi', 'dabih'],
        ['dabih', 'nashira'],
        ['nashira', 'deneb-algedi'],
        ['deneb-algedi', 'omega-cap'],
        ['omega-cap', 'iota-cap'],
        ['iota-cap', 'algiedi'],
      ],
    },
  },
  {
    id: 'aquarius',
    name: 'Bảo Bình',
    symbol: '♒',
    dateRange: '20/01 - 18/02',
    element: 'Khí',
    rulingPlanet: 'Sao Thiên Vương',
    keywords: ['Đổi mới', 'Độc lập', 'Tư duy hệ thống'],
    strength: 'Nhìn ra mô hình lớn và đề xuất giải pháp khác biệt.',
    challenge: 'Đôi khi tách khỏi cảm xúc thực tế của tình huống.',
    advice: 'Kết nối ý tưởng lớn với bước hành động nhỏ mỗi ngày.',
    color: 'hsl(194 78% 66%)',
    imagePath: '/zodiac/aquarius.svg',
    range: [120, 218],
    constellation: {
      latinName: 'Aquarius',
      description: 'Chuỗi sao uốn lượn như dòng nước chảy từ bình xuống đất.',
      stars: [
        { id: 'sadalmelik', x: 20, y: 42, size: 3.0 },
        { id: 'sadalsuud', x: 36, y: 50, size: 2.9 },
        { id: 'skat', x: 50, y: 60, size: 2.4 },
        { id: 'albali', x: 63, y: 50, size: 2.1 },
        { id: 'ancha', x: 74, y: 62, size: 2.0 },
        { id: 'situla', x: 84, y: 74, size: 2.2 },
      ],
      links: [
        ['sadalmelik', 'sadalsuud'],
        ['sadalsuud', 'skat'],
        ['skat', 'albali'],
        ['albali', 'ancha'],
        ['ancha', 'situla'],
      ],
    },
  },
  {
    id: 'pisces',
    name: 'Song Ngư',
    symbol: '♓',
    dateRange: '19/02 - 20/03',
    element: 'Nước',
    rulingPlanet: 'Sao Hải Vương',
    keywords: ['Trực giác', 'Sáng tạo', 'Thấu cảm'],
    strength: 'Nhạy với tín hiệu tinh tế và giàu tưởng tượng.',
    challenge: 'Có thể mơ hồ mục tiêu nếu thiếu cấu trúc.',
    advice: 'Viết 3 ưu tiên rõ ràng trước khi bắt đầu ngày mới.',
    color: 'hsl(262 73% 68%)',
    imagePath: '/zodiac/pisces.svg',
    range: [219, 320],
    constellation: {
      latinName: 'Pisces',
      description: 'Hai cụm sao nối bằng một đường dài, tượng trưng hai cá bơi ngược chiều.',
      stars: [
        { id: 'alpherg', x: 18, y: 38, size: 2.8 },
        { id: 'eta-psc', x: 30, y: 50, size: 2.1 },
        { id: 'gamma-psc', x: 42, y: 64, size: 2.0 },
        { id: 'omega-psc', x: 56, y: 72, size: 1.9 },
        { id: 'iota-psc', x: 66, y: 58, size: 2.0 },
        { id: 'kappa-psc', x: 77, y: 46, size: 2.2 },
        { id: 'fumalsamakah', x: 89, y: 34, size: 3.1 },
      ],
      links: [
        ['alpherg', 'eta-psc'],
        ['eta-psc', 'gamma-psc'],
        ['gamma-psc', 'omega-psc'],
        ['omega-psc', 'iota-psc'],
        ['iota-psc', 'kappa-psc'],
        ['kappa-psc', 'fumalsamakah'],
      ],
    },
  },
];

function getCurrentSignIdByDate(date: Date): string {
  const mmdd = (date.getMonth() + 1) * 100 + date.getDate();
  const matched = zodiacSigns.find((sign) => {
    const [start, end] = sign.range;
    if (start <= end) return mmdd >= start && mmdd <= end;
    return mmdd >= start || mmdd <= end;
  });
  return matched?.id ?? zodiacSigns[0].id;
}

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
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
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
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
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
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
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
