import { SpreadConfig } from './types';

export const spreads: SpreadConfig[] = [
  {
    id: 'one-card',
    name: 'Một Lá',
    description: 'Rút một lá bài để nhận thông điệp ngắn gọn, trực tiếp cho câu hỏi của bạn.',
    cardCount: 1,
    positions: [{ id: 'message', label: 'Thông điệp', description: 'Thông điệp chính cho bạn' }],
    icon: '🃏',
  },
  {
    id: 'three-card',
    name: 'Ba Lá',
    description: 'Trải bài kinh điển: Quá khứ - Hiện tại - Tương lai. Giúp bạn nhìn rõ bức tranh tổng thể.',
    cardCount: 3,
    positions: [
      { id: 'past', label: 'Quá khứ', description: 'Những gì đã xảy ra, nền tảng của tình huống' },
      { id: 'present', label: 'Hiện tại', description: 'Tình huống hiện tại của bạn' },
      { id: 'future', label: 'Tương lai', description: 'Hướng đi sắp tới nếu tiếp tục con đường này' },
    ],
    icon: '🔮',
  },
  {
    id: 'yes-no',
    name: 'Yes / No',
    description: 'Rút một lá để trả lời câu hỏi Có hoặc Không. Upright = Có, Reversed = Không.',
    cardCount: 1,
    positions: [{ id: 'answer', label: 'Câu trả lời', description: 'Upright = Có, Reversed = Không' }],
    icon: '⚖️',
  },
  // === TRẢI BÀI THEO CHỦ ĐỀ ===
  {
    id: 'love',
    name: 'Tình Yêu',
    description: 'Trải bài tình yêu 5 lá giúp bạn hiểu rõ hơn về mối quan hệ, tình cảm và đối phương.',
    cardCount: 5,
    positions: [
      { id: 'current-love', label: 'Tình cảm hiện tại', description: 'Tình trạng mối quan hệ hiện tại của bạn' },
      { id: 'you', label: 'Bạn', description: 'Bạn đang mang đến điều gì trong mối quan hệ' },
      { id: 'partner', label: 'Đối phương', description: 'Đối phương đang nghĩ và cảm nhận gì' },
      { id: 'challenge', label: 'Thách thức', description: 'Rào cản hoặc vấn đề cần vượt qua' },
      { id: 'potential', label: 'Tiềm năng', description: 'Hướng đi tiềm năng của mối quan hệ' },
    ],
    icon: '💕',
  },
  {
    id: 'career',
    name: 'Sự Nghiệp',
    description: 'Trải bài sự nghiệp 4 lá giúp bạn định hướng con đường nghề nghiệp và tài chính.',
    cardCount: 4,
    positions: [
      { id: 'present', label: 'Hiện tại', description: 'Tình hình công việc hiện tại của bạn' },
      { id: 'challenge', label: 'Thách thức', description: 'Thách thức hoặc khó khăn đang gặp' },
      { id: 'action', label: 'Hành động', description: 'Hành động bạn nên thực hiện' },
      { id: 'outcome', label: 'Kết quả', description: 'Kết quả tiềm năng nếu bạn hành động đúng' },
    ],
    icon: '💼',
  },
  {
    id: 'daily',
    name: 'Hàng Ngày',
    description: 'Nhận một lá bài may mắn và thông điệp hướng dẫn cho ngày hôm nay.',
    cardCount: 1,
    positions: [{ id: 'daily-guidance', label: 'Gợi ý hàng nay', description: 'Thông điệp may mắn cho ngày hôm nay' }],
    icon: '☀️',
  },
  // === TRẢI BÀI NÂNG CAO ===
  {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    description: 'Trải bài cổ điển 10 lá giúp phân tích chi tiết và toàn diện về bất kỳ tình huống nào.',
    cardCount: 10,
    positions: [
      { id: 'present', label: 'Hiện tại', description: 'Tình huống hiện tại của bạn' },
      { id: 'challenge', label: 'Thách thức', description: 'Thách thức hoặc ảnh hưởng cần đối mặt' },
      { id: 'past', label: 'Quá khứ', description: 'Quá khứ ảnh hưởng đến tình huống' },
      { id: 'future', label: 'Tương lai', description: 'Hướng đi sắp tới' },
      { id: 'above', label: 'Mục tiêu', description: 'Mục tiêu hoặc khát vọng của bạn' },
      { id: 'below', label: 'Nền tảng', description: 'Nền tảng hoặc cơ sở của tình huống' },
      { id: 'advice', label: 'Lời khuyên', description: 'Lời khuyên từ lá bài' },
      { id: 'external', label: 'Yếu tố bên ngoài', description: 'Ảnh hưởng từ bên ngoài' },
      { id: 'hopes-fears', label: 'Hy vọng & Nỗi sợ', description: 'Hy vọng và nỗi sợ của bạn' },
      { id: 'outcome', label: 'Kết quả', description: 'Kết quả cuối cùng' },
    ],
    icon: '☘️',
  },
  {
    id: 'horseshoe',
    name: 'Móng Ngựa',
    description: 'Trải bài 7 lá theo phong cách Hy Lạp cổ đại, giúp bạn nhìn toàn diện về tình huống.',
    cardCount: 7,
    positions: [
      { id: 'situation', label: 'Tình huống', description: 'Tình huống hiện tại bạn đang đối mặt' },
      { id: 'helping', label: 'Đang giúp', description: 'Những yếu tố đang hỗ trợ bạn' },
      { id: 'hindering', label: 'Đang cản trở', description: 'Những yếu tố đang cản trở bạn' },
      { id: 'advice', label: 'Lời khuyên', description: 'Lời khuyên cho bạn' },
      { id: 'your-thought', label: 'Bạn nghĩ gì', description: 'Điều bạn đang nghĩ về tình huống' },
      { id: 'future-holds', label: 'Tương lai', description: 'Điều tương lai mang lại' },
      { id: 'final-outcome', label: 'Kết quả cuối', description: 'Kết quả cuối cùng' },
    ],
    icon: '🐴',
  },
];

export function getSpread(id: string): SpreadConfig | undefined {
  return spreads.find((s) => s.id === id);
}
