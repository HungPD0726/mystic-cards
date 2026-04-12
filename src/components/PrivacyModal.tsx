import { ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PrivacyModalProps {
  trigger: React.ReactNode;
}

export function PrivacyModal({ trigger }: PrivacyModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="border-gold/20 bg-[rgba(11,5,28,0.98)] text-foreground sm:max-w-lg">
        <DialogHeader>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <DialogTitle className="text-2xl text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
            Cam kết bảo mật
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            Mystic Cards được thiết kế để giữ trải nghiệm riêng tư, nhẹ nhàng và an tâm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-2xl border border-border/60 bg-background/45 p-4 text-sm leading-relaxed text-foreground/90">
          <p>Chúng tôi không cố tình lưu trữ thông tin nhạy cảm ngoài phạm vi cần thiết để vận hành tính năng bạn chọn.</p>
          <p>Dữ liệu đồng bộ được tách theo tài khoản, truyền qua kết nối mã hóa và không được chia sẻ cho bên thứ ba ngoài hạ tầng dịch vụ cần thiết.</p>
          <p>Bạn luôn có thể dùng ứng dụng ở chế độ cục bộ và chỉ lưu các phiên rút bài khi thật sự muốn.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

