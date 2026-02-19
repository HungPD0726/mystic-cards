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
];

export function getSpread(id: string): SpreadConfig | undefined {
  return spreads.find((s) => s.id === id);
}
