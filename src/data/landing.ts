import {
  Heart,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Wand2,
  Compass,
  Clock3,
  Brain,
  Stars,
  type LucideIcon,
} from 'lucide-react';

export interface LandingTopic {
  icon: LucideIcon;
  label: string;
  desc: string;
  to: string;
  delay: number;
}

export interface LandingStep {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface LandingStrength {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const landingTopics: LandingTopic[] = [
  {
    icon: Heart,
    label: 'Tình cảm',
    desc: 'Khám phá cảm xúc, kết nối và hướng đi trong các mối quan hệ.',
    to: '/reading/three-card',
    delay: 0.55,
  },
  {
    icon: Briefcase,
    label: 'Công việc',
    desc: 'Nhìn rõ cơ hội, thử thách và quyết định quan trọng trong sự nghiệp.',
    to: '/reading/three-card',
    delay: 0.65,
  },
  {
    icon: GraduationCap,
    label: 'Phát triển',
    desc: 'Nhận thông điệp giúp bạn trưởng thành và hiểu chính mình hơn.',
    to: '/reading/one-card',
    delay: 0.75,
  },
];

export const landingSteps: LandingStep[] = [
  {
    icon: MessageCircle,
    title: 'Đặt câu hỏi đúng',
    desc: 'Mô tả ngắn gọn điều bạn đang vướng mắc để Tarot phản chiếu đúng trọng tâm.',
  },
  {
    icon: Wand2,
    title: 'Rút trải bài phù hợp',
    desc: 'Chọn trải một lá khi cần nhanh, hoặc ba lá khi cần nhìn toàn cảnh.',
  },
  {
    icon: Compass,
    title: 'Đọc và hành động',
    desc: 'Kết hợp trực giác của bạn với gợi ý từ AI để ra quyết định thực tế.',
  },
];

export const landingStrengths: LandingStrength[] = [
  {
    icon: Clock3,
    title: 'Nhanh và rõ ràng',
    desc: 'Hoàn tất một phiên xem bài chỉ trong vài phút.',
  },
  {
    icon: Brain,
    title: 'Gợi mở có chiều sâu',
    desc: 'Diễn giải AI bám sát bối cảnh thay vì câu trả lời khuôn mẫu.',
  },
  {
    icon: Stars,
    title: 'Không gian tập trung',
    desc: 'Thiết kế tối giản giúp bạn tập trung vào câu hỏi của chính mình.',
  },
];
