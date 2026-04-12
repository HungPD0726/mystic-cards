import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
  Shuffle,
  Sparkles,
  Stars,
  Wand2,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MeaningDialog } from '@/components/MeaningDialog';
import { SpreadLayout } from '@/components/SpreadLayout';
import { CardBack } from '@/components/TarotCard';
import { Textarea } from '@/components/ui/textarea';
import { DrawnCard, SpreadType } from '@/data/types';
import { useTarotReading } from '@/hooks/useTarotReading';
import { createStoredReading, saveCurrentReading, setAutoAI } from '@/lib/readingSession';
import { mainThemes } from '@/data/themes';
import { ClarificationAnswer } from '@/data/clarifyQuestions';
import { ClarifyModal } from '@/components/ClarifyModal';
import { FocusScreen } from '@/components/FocusScreen';
import { LightningCanvas, LightningCanvasHandle } from '@/components/LightningCanvas';
import { useAudioManager } from '@/hooks/useAudioManager';
import { Switch } from '@/components/ui/switch';
import { useFullscreen } from '@/hooks/useFullscreen';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const LIGHTNING_STORAGE_KEY = 'mystic_lightning_enabled';

const ReadingDraw = () => {
  const { spread: spreadId } = useParams<{ spread: string }>();
  const navigate = useNavigate();
  const reading = useTarotReading(spreadId as SpreadType);
  const { playSfx } = useAudioManager();
  const { isFullscreen, toggle } = useFullscreen();
  const lightningRef = useRef<LightningCanvasHandle | null>(null);

  const [selectedCard, setSelectedCard] = useState<DrawnCard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [focusQuestion, setFocusQuestion] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState(mainThemes[0]?.id ?? 'love');
  const [selectedSubThemeId, setSelectedSubThemeId] = useState(mainThemes[0]?.subThemes[0]?.id ?? '');
  const [showFocusScreen, setShowFocusScreen] = useState(false);
  const [hasFocusCompleted, setHasFocusCompleted] = useState(false);
  const [clarifyOpen, setClarifyOpen] = useState(false);
  const [fullscreenPromptOpen, setFullscreenPromptOpen] = useState(false);
  const [lightningEnabled, setLightningEnabled] = useState<boolean>(() => {
    const raw = window.localStorage.getItem(LIGHTNING_STORAGE_KEY);
    return raw === null ? true : raw === 'true';
  });

  const activeTheme = useMemo(
    () => mainThemes.find((theme) => theme.id === selectedThemeId) ?? mainThemes[0],
    [selectedThemeId],
  );
  const activeSubTheme =
    activeTheme?.subThemes.find((subTheme) => subTheme.id === selectedSubThemeId) ?? activeTheme?.subThemes[0];

  useEffect(() => {
    if (activeTheme && !activeTheme.subThemes.some((subTheme) => subTheme.id === selectedSubThemeId)) {
      setSelectedSubThemeId(activeTheme.subThemes[0]?.id ?? '');
    }
  }, [activeTheme, selectedSubThemeId]);

  useEffect(() => {
    window.localStorage.setItem(LIGHTNING_STORAGE_KEY, String(lightningEnabled));
  }, [lightningEnabled]);

  useEffect(() => {
    setHasFocusCompleted(false);
    setShowFocusScreen(false);
  }, [spreadId]);

  useEffect(() => {
    if (!reading.isShuffled || reading.drawIndex > 0 || !focusQuestion.trim()) {
      return;
    }

    if (!hasFocusCompleted) {
      setShowFocusScreen(true);
    }
  }, [focusQuestion, hasFocusCompleted, reading.drawIndex, reading.isShuffled]);

  if (!reading.spread) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-foreground">Không tìm thấy kiểu trải bài này.</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Hãy quay lại trang chọn trải bài và bắt đầu với một layout hợp lệ.
        </p>
        <Button onClick={() => navigate('/reading')}>Quay lại /reading</Button>
      </div>
    );
  }

  const totalCards = reading.spread.cardCount;
  const progress = Math.round((reading.drawIndex / totalCards) * 100);
  const nextPosition = reading.spread.positions[reading.drawIndex];
  const trimmedFocusQuestion = focusQuestion.trim();
  const focusCharacterCount = focusQuestion.length;
  const requiresFocusScreen = !!trimmedFocusQuestion && reading.drawIndex === 0;
  const canDrawNext = !requiresFocusScreen || hasFocusCompleted;
  const stageText = !reading.isShuffled
    ? reading.isShuffling
      ? 'Đang xáo bộ bài'
      : 'Sẵn sàng bắt đầu'
    : reading.allRevealed
      ? 'Đã hoàn tất trải bài'
      : `Đang mở vị trí ${reading.drawIndex + 1}/${totalCards}`;

  const handleCardClick = (index: number) => {
    setSelectedCard(reading.drawnCards[index]);
    setDialogOpen(true);
  };

  const buildReadingPayload = (clarificationAnswers?: ClarificationAnswer[] | null) =>
    createStoredReading(reading.spread.id, reading.spread.name, reading.drawnCards, {
      notes: focusQuestion,
      clarificationAnswers,
    });

  const persistCurrentReading = (clarificationAnswers?: ClarificationAnswer[] | null) => {
    const storedReading = buildReadingPayload(clarificationAnswers);
    saveCurrentReading(storedReading);
    return storedReading;
  };

  const handleViewResult = () => {
    persistCurrentReading();
    setAutoAI(false);
    navigate(`/reading/${reading.spread.id}/result`);
  };

  const handleClarifyComplete = (answers: ClarificationAnswer[]) => {
    persistCurrentReading(answers);
    setAutoAI(true);
    navigate(`/reading/${reading.spread.id}/result`);
  };

  const handleShuffle = () => {
    playSfx('shuffle');
    setHasFocusCompleted(false);
    setShowFocusScreen(false);
    setFullscreenPromptOpen(true);
    reading.shuffle();
  };

  const handleDrawNext = () => {
    if (!canDrawNext) {
      setShowFocusScreen(true);
      return;
    }

    playSfx('draw');
    reading.drawNext();
  };

  const handleRevealComplete = (index: number) => {
    if (!reading.drawnCards[index]?.revealed) {
      return;
    }

    playSfx('flip');
    if (lightningEnabled) {
      lightningRef.current?.triggerLightning();
    }
  };

  const handleReset = () => {
    setHasFocusCompleted(false);
    setShowFocusScreen(false);
    setClarifyOpen(false);
    reading.reset();
  };

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <LightningCanvas ref={lightningRef} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.14),transparent_40%),radial-gradient(circle_at_85%_20%,hsl(var(--primary)/0.18),transparent_30%),radial-gradient(circle_at_10%_90%,hsl(var(--accent)/0.16),transparent_28%)]" />

      <div className="container relative mx-auto px-4 py-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 max-w-6xl overflow-hidden rounded-[30px] border border-border/60 bg-card/45 p-5 backdrop-blur md:p-7"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-background/40 px-4 py-1.5">
              <Stars className="h-4 w-4 text-gold" />
              <span className="text-xs uppercase tracking-[0.22em] text-gold/90">Reading Session</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => void toggle()}
              className="border-gold/30 text-gold hover:bg-secondary"
              title="Chế độ toàn màn hình"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl" style={{ fontFamily: 'Cinzel, serif' }}>
                <span className="mr-2">{reading.spread.icon}</span>
                {reading.spread.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {reading.spread.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Trạng thái</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{stageText}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tiến độ</p>
                <p className="mt-2 text-sm font-semibold text-gold">
                  {reading.drawIndex}/{totalCards} lá
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Điểm nhấn</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {trimmedFocusQuestion ? 'Luận giải sẽ bám theo câu hỏi bạn vừa chọn.' : 'Hãy giữ một ý định rõ ràng trước khi rút.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="rounded-[30px] border border-border/60 bg-card/40 p-4 md:p-6"
          >
            <AnimatePresence mode="wait">
              {!reading.isShuffled ? (
                <motion.div
                  key="deck"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="py-4"
                >
                  <div className="mb-6 rounded-[26px] border border-gold/20 bg-background/45 p-4 sm:p-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-gold/80">Nghi thức tập trung</p>
                          <h2 className="mt-2 text-xl font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                            Chọn đúng chủ đề rồi giữ một câu hỏi trong lòng trước khi xáo bài
                          </h2>
                          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            Lấy cảm hứng từ Tarot-vibe, bạn có thể chọn chủ đề lớn, đi vào tiểu chủ đề rồi dùng một câu hỏi preset
                            làm điểm neo cho cả phiên đọc bài.
                          </p>
                        </div>
                        <Badge variant="secondary" className="w-fit border-gold/20 bg-gold/10 text-gold">
                          {focusCharacterCount}/180
                        </Badge>
                      </div>

                      <div className="grid gap-3 md:grid-cols-5">
                        {mainThemes.map((theme) => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setSelectedThemeId(theme.id)}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              theme.id === activeTheme.id
                                ? 'border-gold/40 bg-gold/10 text-gold'
                                : 'border-border/60 bg-card/60 text-muted-foreground hover:border-gold/25 hover:text-foreground'
                            }`}
                          >
                            <div className="text-lg">{theme.icon}</div>
                            <p className="mt-2 text-sm font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
                              {theme.name}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed">{theme.description}</p>
                          </button>
                        ))}
                      </div>

                      {activeTheme && (
                        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-gold/80">Tiểu chủ đề</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {activeTheme.subThemes.map((subTheme) => (
                              <button
                                key={subTheme.id}
                                type="button"
                                onClick={() => setSelectedSubThemeId(subTheme.id)}
                                className={`rounded-full border px-3 py-2 text-xs transition ${
                                  subTheme.id === activeSubTheme?.id
                                    ? 'border-gold/35 bg-gold/10 text-gold'
                                    : 'border-border/60 bg-card/70 text-muted-foreground hover:border-gold/25 hover:text-foreground'
                                }`}
                              >
                                <span className="mr-1">{subTheme.icon}</span>
                                {subTheme.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeSubTheme && (
                        <div className="rounded-2xl border border-border/60 bg-background/35 p-4">
                          <p className="text-sm font-semibold text-foreground">{activeSubTheme.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{activeSubTheme.description}</p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {activeSubTheme.presetQuestions.slice(0, 6).map((prompt) => (
                              <button
                                key={prompt}
                                type="button"
                                onClick={() => setFocusQuestion(prompt.slice(0, 180))}
                                className="rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold/35 hover:text-gold"
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <Textarea
                        value={focusQuestion}
                        onChange={(event) => setFocusQuestion(event.target.value.slice(0, 180))}
                        placeholder="Ví dụ: Mình cần tập trung điều gì để cải thiện tình huống này trong 30 ngày tới?"
                        className="min-h-[110px] border-gold/20 bg-background/60 text-sm leading-relaxed focus-visible:ring-gold/20"
                      />
                    </div>
                  </div>

                  <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
                    Xáo bộ bài để bắt đầu. Nếu bạn đã nhập câu hỏi tập trung, màn focus sẽ xuất hiện trước khi được rút lá đầu tiên.
                  </p>

                  <div className="mt-8 flex justify-center overflow-x-auto pb-2 md:overflow-visible md:pb-0">
                    <div className="flex min-w-max items-end justify-center gap-1 px-3 sm:gap-2 md:min-w-0 md:gap-3 md:px-1">
                      {Array.from({ length: 7 }).map((_, index) => (
                        <div
                          key={index}
                          className="origin-bottom"
                          style={{ transform: `rotate(${(index - 3) * 7}deg) translateY(${Math.abs(index - 3) * 3}px)` }}
                        >
                          <CardBack animate={reading.isShuffling} delay={index * 0.04} className="h-36 w-24 sm:h-44 sm:w-28" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="spread"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {trimmedFocusQuestion && (
                    <div className="mb-6 rounded-2xl border border-gold/20 bg-gold/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-gold/80">Điểm tập trung</p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/90">"{trimmedFocusQuestion}"</p>
                    </div>
                  )}

                  <div className="mb-6 rounded-2xl border border-border/60 bg-background/40 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Tiến trình mở bài</p>
                        <p className="text-xs text-muted-foreground">
                          {nextPosition ? `Tiếp theo: ${nextPosition.label}` : 'Bạn đã mở đủ tất cả vị trí của trải bài.'}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gold">{progress}%</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary/70">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  <SpreadLayout
                    spreadType={reading.spread.id}
                    drawnCards={reading.drawnCards}
                    onCardClick={handleCardClick}
                    onCardRevealComplete={handleRevealComplete}
                    size="lg"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!reading.isShuffled && (
                <Button onClick={handleShuffle} disabled={reading.isShuffling} className="gap-2 glow-gold" size="lg">
                  <Shuffle className="h-4 w-4" />
                  {reading.isShuffling ? 'Đang xáo bài...' : 'Xáo bộ bài'}
                </Button>
              )}

              {reading.isShuffled && !reading.allDrawn && (
                <Button onClick={handleDrawNext} className="gap-2 glow-gold" size="lg">
                  <Layers className="h-4 w-4" />
                  {canDrawNext
                    ? nextPosition
                      ? `Mở: ${nextPosition.label}`
                      : `Rút lá ${reading.drawIndex + 1}`
                    : 'Hoàn tất nghi thức tập trung'}
                </Button>
              )}

              {reading.allRevealed && (
                <>
                  <Button onClick={() => setClarifyOpen(true)} className="gap-2 glow-gold" size="lg">
                    <Sparkles className="h-4 w-4" />
                    Tạo luận giải AI
                  </Button>
                  <Button
                    onClick={handleViewResult}
                    variant="outline"
                    className="gap-2 border-gold/30 text-gold hover:bg-secondary"
                    size="lg"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Xem kết quả
                  </Button>
                </>
              )}

              {reading.isShuffled && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="gap-2 border-gold/30 text-gold hover:bg-secondary"
                >
                  <RotateCcw className="h-4 w-4" />
                  Bắt đầu lại
                </Button>
              )}
            </div>

            {reading.allRevealed && (
              <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4 text-gold" />
                <p>Nhấn vào từng lá bài để xem nghĩa chi tiết trước khi chuyển sang màn kết quả.</p>
              </div>
            )}
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="h-fit rounded-[30px] border border-border/60 bg-card/40 p-5 backdrop-blur lg:sticky lg:top-24"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl border border-gold/30 bg-gold/10 p-2 text-gold">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: 'Cinzel, serif' }}>
                  Hướng dẫn phiên đọc
                </h2>
                <p className="text-sm text-muted-foreground">Theo dõi từng vị trí để không bị rối mạch.</p>
              </div>
            </div>

            <div className="mb-5 rounded-2xl border border-border/60 bg-background/45 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Hiệu ứng sét</p>
                  <p className="mt-1 text-xs text-muted-foreground">Bật flash thần bí khi lá bài được lật.</p>
                </div>
                <Switch checked={lightningEnabled} onCheckedChange={setLightningEnabled} />
              </div>
            </div>

            <div className="space-y-3">
              {reading.spread.positions.map((position, index) => {
                const isRevealed = index < reading.drawIndex;
                const isCurrent = index === reading.drawIndex && reading.isShuffled && !reading.allRevealed;

                return (
                  <div
                    key={position.id}
                    className={`rounded-2xl border p-4 transition-colors ${
                      isCurrent
                        ? 'border-gold/35 bg-gold/10'
                        : isRevealed
                          ? 'border-border/60 bg-background/50'
                          : 'border-border/50 bg-background/35'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          isCurrent
                            ? 'bg-gold text-background'
                            : isRevealed
                              ? 'bg-secondary text-foreground'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{position.label}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{position.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {activeSubTheme && (
              <div className="mt-5 rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gold/80">Chủ đề đang chọn</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {activeTheme?.name} • {activeSubTheme.name}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{activeSubTheme.description}</p>
              </div>
            )}
          </motion.aside>
        </div>
      </div>

      <AnimatePresence>{showFocusScreen && <FocusScreen question={trimmedFocusQuestion} onComplete={() => {
        setShowFocusScreen(false);
        setHasFocusCompleted(true);
      }} />}</AnimatePresence>

      <ClarifyModal open={clarifyOpen} onOpenChange={setClarifyOpen} onComplete={handleClarifyComplete} />
      <MeaningDialog drawnCard={selectedCard} open={dialogOpen} onOpenChange={setDialogOpen} />

      <Dialog open={fullscreenPromptOpen} onOpenChange={setFullscreenPromptOpen}>
        <DialogContent className="border-gold/20 bg-[rgba(11,5,28,0.98)] text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
              <Zap className="h-5 w-5" />
              Vào chế độ tập trung?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Toàn màn hình sẽ giúp phiên rút bài bớt xao nhãng và tạo cảm giác nghi thức hơn.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" className="border-gold/30 text-gold hover:bg-secondary" onClick={() => setFullscreenPromptOpen(false)}>
              Để sau
            </Button>
            <Button
              className="glow-gold"
              onClick={() => {
                setFullscreenPromptOpen(false);
                if (!isFullscreen) {
                  void toggle();
                }
              }}
            >
              Bật toàn màn hình
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReadingDraw;

