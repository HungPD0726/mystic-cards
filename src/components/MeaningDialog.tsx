import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DrawnCard } from '@/data/types';

interface MeaningDialogProps {
  drawnCard: DrawnCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MeaningDialog({ drawnCard, open, onOpenChange }: MeaningDialogProps) {
  if (!drawnCard) return null;

  const { card, orientation, position } = drawnCard;
  const isReversed = orientation === 'reversed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-gold/30 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
            {card.name}
            {isReversed && (
              <Badge variant="destructive" className="text-xs">Ngược</Badge>
            )}
          </DialogTitle>
          {position && (
            <DialogDescription className="text-muted-foreground">
              Vị trí: <span className="font-semibold text-foreground">{position}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <img
              src={card.imagePath}
              alt={card.name}
              className={`h-48 rounded-lg object-contain ${isReversed ? 'rotate-180' : ''}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {card.keywords.map(kw => (
              <Badge key={kw} variant="secondary" className="border-gold/20">
                {kw}
              </Badge>
            ))}
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <h4 className="mb-1 font-semibold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                {isReversed ? '🔻 Ý nghĩa ngược' : '🔺 Ý nghĩa xuôi'}
              </h4>
              <p className="text-foreground/90">
                {isReversed ? card.reversedMeaning : card.uprightMeaning}
              </p>
            </div>

            <div>
              <h4 className="mb-1 font-semibold text-muted-foreground">Mô tả</h4>
              <p className="text-foreground/70">{card.description}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
