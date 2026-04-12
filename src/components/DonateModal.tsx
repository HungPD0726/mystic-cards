import { Coffee, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DonateModalProps {
  trigger: React.ReactNode;
}

export function DonateModal({ trigger }: DonateModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="border-gold/20 bg-[rgba(11,5,28,0.98)] text-foreground sm:max-w-lg">
        <DialogHeader>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
            <Coffee className="h-5 w-5" />
          </div>
          <DialogTitle className="text-2xl text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
            Ủng hộ dự án
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            Một chút hỗ trợ sẽ giúp dự án tiếp tục được chăm chút thêm về trải nghiệm, nội dung và AI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 rounded-2xl border border-border/60 bg-background/45 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-gold/20 bg-gold/10 p-2 text-gold">
              <HeartHandshake className="h-4 w-4" />
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              Bạn có thể gắn QR cá nhân hoặc thay nút bên dưới bằng liên kết Buy Me a Coffee, Momo hoặc bất kỳ kênh ủng hộ nào bạn dùng.
            </p>
          </div>

          <div className="rounded-[24px] border border-dashed border-gold/25 bg-[linear-gradient(135deg,rgba(255,214,102,0.08),rgba(54,24,97,0.18))] p-6 text-center">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-2xl border border-gold/25 bg-background/70 text-xs uppercase tracking-[0.24em] text-gold/70">
              QR Donate
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Thay placeholder này bằng QR thật hoặc link ủng hộ của bạn.</p>
          </div>

          <Button asChild className="w-full glow-gold">
            <a href="https://www.buymeacoffee.com/" target="_blank" rel="noreferrer">
              Mở trang ủng hộ
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

