import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/features/auth/context/AuthContext';
import { toast } from 'sonner';
import { getReadingHistory } from '@/hooks/useTarotReading';
import { saveCurrentReading, StoredReading } from '@/lib/readingSession';
import {
  buildStoredReadingFromDbReading,
  buildStoredReadingFromHistoryEntry,
  DbReadingRecord,
  matchesReadingHistoryFilter,
} from '@/lib/readingHistoryHelpers';
import {
  CalendarDays,
  Cloud,
  HardDrive,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import type { ReadingHistory } from '@/data/types';

const spreadLabels: Record<string, string> = {
  'one-card': '1 Lá',
  'three-card': '3 Lá',
  'yes-no': 'Yes / No',
  love: 'Tình Yêu',
  career: 'Sự Nghiệp',
  daily: 'Thông Điệp Hôm Nay',
  horseshoe: 'Móng Ngựa',
  'celtic-cross': 'Celtic Cross',
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleString('vi-VN');
  } catch {
    return dateStr;
  }
};

const ReadingHistoryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [dbReadings, setDbReadings] = useState<DbReadingRecord[]>([]);
  const [localHistory, setLocalHistory] = useState<ReadingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadDbReadings = useCallback(async () => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('readings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDbReadings((data ?? []) as DbReadingRecord[]);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải lịch sử từ cloud.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLocalHistory(getReadingHistory());

    if (isAuthenticated) {
      void loadDbReadings();
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, loadDbReadings]);

  const activeFilter = useMemo(
    () => ({
      query,
      fromDate,
      toDate,
    }),
    [fromDate, query, toDate],
  );

  const filteredDbReadings = useMemo(
    () =>
      dbReadings.filter((reading) =>
        matchesReadingHistoryFilter(
          {
            spreadName: reading.spread_name,
            notes: reading.notes ?? null,
            aiInterpretation: reading.ai_interpretation,
            date: reading.created_at,
            drawnCards: Array.isArray(reading.drawn_cards)
              ? reading.drawn_cards.map((card) =>
                  typeof card === 'object' && card !== null
                    ? {
                        cardName: typeof (card as { cardName?: unknown }).cardName === 'string'
                          ? (card as { cardName: string }).cardName
                          : typeof (card as { cardName?: unknown; name?: unknown }).name === 'string'
                            ? (card as { name: string }).name
                            : '',
                        position: typeof (card as { position?: unknown }).position === 'string'
                          ? (card as { position: string }).position
                          : '',
                      }
                    : { cardName: '', position: '' },
                )
              : [],
          },
          activeFilter,
        ),
      ),
    [activeFilter, dbReadings],
  );

  const filteredLocalHistory = useMemo(
    () =>
      localHistory.filter((reading) =>
        matchesReadingHistoryFilter(
          {
            spreadName: reading.spreadName,
            notes: reading.notes ?? null,
            aiInterpretation: reading.aiInterpretation ?? null,
            date: reading.date,
            drawnCards: reading.drawnCards,
          },
          activeFilter,
        ),
      ),
    [activeFilter, localHistory],
  );

  const totalVisibleReadings = filteredDbReadings.length + filteredLocalHistory.length;
  const totalAiReadings =
    filteredDbReadings.filter((reading) => Boolean(reading.ai_interpretation)).length +
    filteredLocalHistory.filter((reading) => Boolean(reading.aiInterpretation)).length;
  const totalFocusedReadings =
    filteredDbReadings.filter((reading) => Boolean(reading.notes?.trim())).length +
    filteredLocalHistory.filter((reading) => Boolean(reading.notes?.trim())).length;
  const hasActiveFilters = Boolean(query.trim() || fromDate || toDate);

  const deleteDbReading = async (id: string) => {
    try {
      const { error } = await supabase.from('readings').delete().eq('id', id);
      if (error) {
        throw error;
      }

      setDbReadings((prev) => prev.filter((reading) => reading.id !== id));
      toast.success('Đã xóa lịch sử.');
    } catch (error) {
      console.error(error);
      toast.error('Không thể xóa. Vui lòng thử lại.');
    }
  };

  const deleteLocalReading = (id: string) => {
    const nextHistory = localHistory.filter((reading) => reading.id !== id);
    setLocalHistory(nextHistory);
    localStorage.setItem('tarot-reading-history', JSON.stringify(nextHistory));
  };

  const clearLocalHistory = () => {
    if (!window.confirm('Xóa toàn bộ lịch sử cục bộ?')) {
      return;
    }

    setLocalHistory([]);
    localStorage.setItem('tarot-reading-history', JSON.stringify([]));
  };

  const clearFilters = () => {
    setQuery('');
    setFromDate('');
    setToDate('');
  };

  const replayReading = (storedReading: StoredReading | null) => {
    if (!storedReading) {
      toast.error('Không thể khôi phục trải bài cũ này.');
      return;
    }

    saveCurrentReading(storedReading);
    navigate(`/reading/${storedReading.spreadType}/result`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Đang tải lịch sử...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.12),transparent_42%),radial-gradient(circle_at_82%_18%,hsl(var(--primary)/0.14),transparent_28%),radial-gradient(circle_at_18%_88%,hsl(var(--accent)/0.14),transparent_26%)]" />

      <div className="container relative mx-auto max-w-6xl px-4 py-8 md:py-10">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 overflow-hidden rounded-[30px] border border-border/60 bg-card/45 p-6 backdrop-blur md:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-background/40 px-4 py-1.5">
                <Wand2 className="h-4 w-4 text-gold" />
                <span className="text-xs uppercase tracking-[0.22em] text-gold/90">Reading Archive</span>
              </div>

              <h1 className="text-4xl font-bold text-foreground md:text-5xl" style={{ fontFamily: 'Cinzel, serif' }}>
                Lịch Sử Xem Bài
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Xem lại các trải bài đã lưu, lọc theo thời gian hoặc nội dung, rồi mở lại đúng phiên bạn muốn tiếp tục
                đọc. Phần này được hoàn thiện theo tinh thần lịch sử và replay của Tarot-vibe nhưng giữ kiến trúc React
                gọn hơn.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Bản ghi hiển thị</p>
                <p className="mt-2 text-2xl font-semibold text-gold">{totalVisibleReadings}</p>
                <p className="mt-1 text-sm text-muted-foreground">Cloud và cục bộ sau khi áp dụng bộ lọc.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Có luận giải AI</p>
                <p className="mt-2 text-2xl font-semibold text-gold">{totalAiReadings}</p>
                <p className="mt-1 text-sm text-muted-foreground">Những phiên đã có diễn giải để xem lại nhanh.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Có câu hỏi tập trung</p>
                <p className="mt-2 text-2xl font-semibold text-gold">{totalFocusedReadings}</p>
                <p className="mt-1 text-sm text-muted-foreground">Các phiên đã lưu mục tiêu hoặc điều đang băn khoăn.</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="mb-8 rounded-[28px] border border-border/60 bg-card/45 p-5 backdrop-blur md:p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <Search className="h-4 w-4 text-gold" />
                Tìm theo spread, câu hỏi hoặc tên lá bài
              </label>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ví dụ: tình yêu, The Magician, công việc..."
                className="border-gold/20 bg-background/55"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:w-[360px]">
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-gold" />
                  Từ ngày
                </label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="border-gold/20 bg-background/55"
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-gold" />
                  Đến ngày
                </label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className="border-gold/20 bg-background/55"
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="border-gold/30 text-gold hover:bg-secondary lg:min-w-[150px]"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </motion.section>

        {totalVisibleReadings === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[28px] border border-border/60 bg-card/45 px-6 py-16 text-center"
          >
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
              {hasActiveFilters ? 'Không có kết quả phù hợp' : 'Chưa có lịch sử để hiển thị'}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {hasActiveFilters
                ? 'Thử nới lỏng bộ lọc hoặc tìm bằng tên spread, tên lá bài và câu hỏi tập trung.'
                : 'Bắt đầu một trải bài mới để lịch sử của bạn xuất hiện tại đây.'}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="border-gold/30 text-gold hover:bg-secondary">
                  Xóa bộ lọc
                </Button>
              )}
              <Link to="/reading">
                <Button className="glow-gold">Xem bài ngay</Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {isAuthenticated && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-gold" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                    Cloud ({filteredDbReadings.length})
                  </h2>
                </div>

                {filteredDbReadings.length === 0 ? (
                  <div className="rounded-2xl border border-border/60 bg-card/35 px-5 py-8 text-center text-sm text-muted-foreground">
                    Không có bản ghi cloud nào khớp với bộ lọc hiện tại.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredDbReadings.map((reading, index) => (
                      <motion.div
                        key={reading.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <Card className="border-border/60 bg-card/55 p-5 transition-colors hover:bg-card/70">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] uppercase tracking-wide text-gold">
                                    {spreadLabels[reading.spread_type] ?? reading.spread_type}
                                  </span>
                                  {reading.ai_interpretation && (
                                    <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1 text-[11px] uppercase tracking-wide text-purple-200">
                                      AI
                                    </span>
                                  )}
                                  {reading.notes?.trim() && (
                                    <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] uppercase tracking-wide text-sky-200">
                                      Focus
                                    </span>
                                  )}
                                </div>

                                <h3 className="mt-3 text-xl font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                                  {reading.spread_name}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">{formatDate(reading.created_at)}</p>

                                {reading.notes?.trim() && (
                                  <div className="mt-4 rounded-2xl border border-gold/15 bg-background/45 px-4 py-3">
                                    <p className="text-xs uppercase tracking-[0.2em] text-gold/80">Câu hỏi tập trung</p>
                                    <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                                      "{reading.notes.trim()}"
                                    </p>
                                  </div>
                                )}

                                <div className="mt-4 flex flex-wrap gap-2">
                                  {(Array.isArray(reading.drawn_cards) ? reading.drawn_cards : []).map((card, cardIndex) => {
                                    const safeCard = typeof card === 'object' && card !== null ? (card as Record<string, unknown>) : {};
                                    const cardName =
                                      typeof safeCard.cardName === 'string'
                                        ? safeCard.cardName
                                        : typeof safeCard.name === 'string'
                                          ? safeCard.name
                                          : `Lá ${cardIndex + 1}`;
                                    const isReversed =
                                      safeCard.orientation === 'reversed' ||
                                      safeCard.isReversed === true ||
                                      safeCard.is_reversed === true ||
                                      safeCard.is_reversed === 1;

                                    return (
                                      <div
                                        key={`${reading.id}-${cardIndex}`}
                                        className={cn(
                                          'rounded-full border px-3 py-1 text-xs',
                                          isReversed
                                            ? 'border-destructive/20 bg-destructive/10 text-destructive'
                                            : 'border-accent/20 bg-accent/10 text-accent',
                                        )}
                                      >
                                        <span className="font-medium">{cardName}</span>
                                        <span className="ml-1">{isReversed ? '▼' : '▲'}</span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {reading.ai_interpretation && (
                                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                    {reading.ai_interpretation}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                                <Button
                                  variant="outline"
                                  className="border-gold/30 text-gold hover:bg-secondary"
                                  onClick={() => replayReading(buildStoredReadingFromDbReading(reading))}
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Xem lại
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => deleteDbReading(reading.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Cục bộ ({filteredLocalHistory.length})
                  </h2>
                </div>

                {localHistory.length > 0 && (
                  <Button variant="destructive" size="sm" className="text-xs" onClick={clearLocalHistory}>
                    Xóa tất cả
                  </Button>
                )}
              </div>

              {filteredLocalHistory.length === 0 ? (
                <div className="rounded-2xl border border-border/60 bg-card/35 px-5 py-8 text-center text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? 'Không có bản ghi cục bộ nào khớp với bộ lọc hiện tại.'
                    : 'Bạn chưa lưu bản ghi cục bộ nào.'}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredLocalHistory.map((reading, index) => (
                    <motion.div
                      key={reading.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Card className="border-border/60 bg-card/45 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-border/60 bg-background/50 px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                                {spreadLabels[reading.spreadType] ?? reading.spreadType}
                              </span>
                              {reading.aiInterpretation && (
                                <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1 text-[11px] uppercase tracking-wide text-purple-200">
                                  AI
                                </span>
                              )}
                              {reading.notes?.trim() && (
                                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] uppercase tracking-wide text-sky-200">
                                  Focus
                                </span>
                              )}
                            </div>

                            <h3 className="mt-3 text-xl font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                              {reading.spreadName}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">{formatDate(reading.date)}</p>

                            {reading.notes?.trim() && (
                              <div className="mt-4 rounded-2xl border border-gold/15 bg-background/45 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.2em] text-gold/80">Câu hỏi tập trung</p>
                                <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                                  "{reading.notes.trim()}"
                                </p>
                              </div>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                              {reading.drawnCards.map((card, cardIndex) => (
                                <div
                                  key={`${reading.id}-${cardIndex}`}
                                  className={cn(
                                    'rounded-full border px-3 py-1 text-xs',
                                    card.orientation === 'reversed'
                                      ? 'border-destructive/20 bg-destructive/10 text-destructive'
                                      : 'border-accent/20 bg-accent/10 text-accent',
                                  )}
                                >
                                  <span className="font-medium">{card.cardName}</span>
                                  <span className="ml-1">{card.orientation === 'reversed' ? '▼' : '▲'}</span>
                                </div>
                              ))}
                            </div>

                            {reading.aiInterpretation && (
                              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                {reading.aiInterpretation}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                            <Button
                              variant="outline"
                              className="border-gold/30 text-gold hover:bg-secondary"
                              onClick={() => replayReading(buildStoredReadingFromHistoryEntry(reading))}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Xem lại
                            </Button>
                            <Button
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => deleteLocalReading(reading.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {!isAuthenticated && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  <Link to="/login" className="text-gold hover:underline">
                    Đăng nhập
                  </Link>{' '}
                  để đồng bộ lịch sử lên cloud và xem trên mọi thiết bị.
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingHistoryPage;
