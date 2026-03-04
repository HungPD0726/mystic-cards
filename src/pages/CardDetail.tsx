import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCardBySlug } from '@/data/cards';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { publicAsset } from '@/lib/publicAsset';

const CardDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const card = slug ? getCardBySlug(slug) : undefined;
  const placeholderSrc = publicAsset('placeholder.svg');

  if (!card) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy lá bài.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/cards" className="text-muted-foreground hover:text-gold">Thư viện</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-gold">{card.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
          {/* Card image */}
          <div className="w-48 h-72 flex-shrink-0 rounded-xl border-2 border-gold/50 overflow-hidden bg-card glow-gold">
            <img
              src={card.imagePath}
              alt={card.name}
              className="h-full w-full object-contain p-2"
              onError={(e) => { (e.target as HTMLImageElement).src = placeholderSrc; }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-5">
            <h1 className="text-3xl font-bold text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
              {card.name}
            </h1>

            <div className="flex flex-wrap gap-1.5">
              {card.keywords.map(kw => (
                <Badge key={kw} variant="secondary" className="border-gold/20">{kw}</Badge>
              ))}
            </div>

            <div>
              <h2 className="mb-1 text-sm font-semibold text-gold/80" style={{ fontFamily: 'Cinzel, serif' }}>
                🔺 Ý nghĩa xuôi (Upright)
              </h2>
              <p className="text-sm text-foreground/90">{card.uprightMeaning}</p>
            </div>

            <div>
              <h2 className="mb-1 text-sm font-semibold text-gold/80" style={{ fontFamily: 'Cinzel, serif' }}>
                🔻 Ý nghĩa ngược (Reversed)
              </h2>
              <p className="text-sm text-foreground/90">{card.reversedMeaning}</p>
            </div>

            <div>
              <h2 className="mb-1 text-sm font-semibold text-muted-foreground">Mô tả</h2>
              <p className="text-sm text-foreground/70">{card.description}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CardDetail;
