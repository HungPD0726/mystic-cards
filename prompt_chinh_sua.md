# PROMPT: Port tất cả tính năng từ TAROT-vibe sang Mystic-Cards

---

## BỐI CẢNH DỰ ÁN

### Dự án nguồn: TAROT-vibe (Vanilla HTML/CSS/JS)
- **Đường dẫn**: `d:\Dự án tự tạo\TAROT-vibe\`
- **Tech stack**: Vanilla HTML + CSS + JavaScript (không framework)
- **Thiết kế**: Dark mystic theme (tím đậm + vàng gold), nhiều hiệu ứng immersive
- **Tính năng chính**: Trải bài Tarot với 78 lá, AI interpretation (Gemini), nhạc nền + SFX, hiệu ứng lightning/particles/warp, fullscreen mode, focus screen, clarification questions, floating cards, VanillaTilt 3D, 5 main themes + 60+ sub-themes, privacy/donate modals
- **File cấu trúc quan trọng**:
  - `index.html` — HTML chính (899 dòng)
  - `style.css` — CSS (7750+ dòng)
  - `js/app.js` — Router/coordinator (331 dòng)
  - `js/form.js` — Form wizard + music trigger (800 dòng)
  - `js/reading.js` — Card reading + SFX (681 dòng)
  - `js/music.js` — Centralized MusicManager (230 dòng)
  - `js/analysis.js` — AI analysis page
  - `js/clarify_data.js` — Clarification questions data
  - `bg_music/` — 4 file mp3: `chia_bai.mp3`, `chon-the.mp3`, `lat_bai.mp3`, `mfcc-mystery-mystic-mystical-music-279834.mp3`

### Dự án đích: Mystic-Cards (React + Vite + TypeScript + TailwindCSS)
- **Đường dẫn**: `d:\Dự án tự tạo\mystic-cards\`
- **Tech stack**: React 18 + Vite + TypeScript + TailwindCSS + Supabase + Framer Motion + Radix UI
- **Thiết kế**: Dark theme tương tự nhưng clean/modern hơn, dùng shadcn/ui components
- **Package manager**: npm (có `package-lock.json`)
- **Tính năng hiện có**: Auth (Supabase), Cloud sync, AI interpretation (Gemini), Zodiac page, Sky360 page, Chat Widget, Reading History, Card Library (78 lá), Daily Tarot Widget, Background Particles (basic)
- **File cấu trúc quan trọng**:
  - `src/App.tsx` — Router chính (React Router v6, lazy loading)
  - `src/index.css` — Global CSS + Tailwind config (192 dòng)
  - `src/pages/Index.tsx` — Landing page (469 dòng)
  - `src/pages/ReadingPicker.tsx` — Chọn spread (288 dòng)
  - `src/pages/ReadingDraw.tsx` — Rút bài (379 dòng)
  - `src/pages/ReadingResult.tsx` — Kết quả + AI (584 dòng)
  - `src/components/TarotCard.tsx` — Card component (115 dòng)
  - `src/components/BackgroundParticles.tsx` — Stars + shooting stars (84 dòng)
  - `src/components/DailyTarotWidget.tsx` — Daily card widget (161 dòng)
  - `src/components/Header.tsx` — Nav header (110 dòng)
  - `src/data/cards.ts` — 78 card definitions
  - `src/data/spreads.ts` — 8 spread configs
  - `src/data/types.ts` — TypeScript types
  - `src/hooks/useTarotReading.ts` — Reading state hook
  - `src/lib/publicAsset.ts` — Asset path helper: `publicAsset('audio/file.mp3')`
  - `src/tarrotcard/` — 78 file JPG ảnh lá bài
  - `public/audio/` — Thư mục audio (cần tạo và copy 4 file mp3 từ TAROT-vibe)

---

## DANH SÁCH 10 TÍNH NĂNG CẦN THÊM VÀO MYSTIC-CARDS

### 1. 🎵 Nhạc nền + Sound Effects (SFX)

**Mô tả**: Hệ thống âm thanh immersive giống TAROT-vibe — nhạc nền loop + 3 hiệu ứng âm thanh khi tương tác bài.

**Cần làm**:
- Copy 4 file mp3 từ `TAROT-vibe/bg_music/` sang `mystic-cards/public/audio/`
- Tạo `src/hooks/useAudioManager.ts`:
  - State: `isPlaying`, `isMuted`, `volume` (persist localStorage key `mystic_music`)
  - Background music: `public/audio/mfcc-mystery-mystic-mystical-music-279834.mp3` (loop, fade-in 1.2s, fade-out 0.8s)
  - SFX: `chia_bai.mp3` (khi shuffle), `chon-the.mp3` (khi draw card), `lat_bai.mp3` (khi flip/reveal)
  - API: `play()`, `pause()`, `toggle()`, `toggleMute()`, `setVolume(v)`, `playSfx('shuffle'|'draw'|'flip')`
- Tạo `src/components/MusicWidget.tsx`:
  - Floating button góc trái dưới (z-index 9999)
  - Icon nhạc (music note SVG), ring pulse animation khi đang play
  - 5 visualizer bars animated phía dưới nút
  - Panel mở rộng (click chuột phải hoặc double-click): tên bài, volume slider, mute button, % label
  - Style: dark glass background `rgba(14,0,36,0.92)`, border tím, gold accents — match TAROT-vibe theme
- Tích hợp vào `App.tsx`: render `<MusicWidget />` cạnh `<ChatWidget />`
- Tích hợp SFX vào `ReadingDraw.tsx`:
  - `playSfx('shuffle')` khi nhấn "Xáo bộ bài"
  - `playSfx('draw')` khi nhấn "Mở: [position]"
  - `playSfx('flip')` khi card được reveal (animation complete)

**Tham khảo**: `TAROT-vibe/js/music.js` (MusicManager IIFE), `TAROT-vibe/js/reading.js` dòng 67-84 (SFX object)

---

### 2. 🌊 Focus Screen (Màn tập trung trước khi rút bài)

**Mô tả**: Overlay fullscreen hiển thị câu hỏi user + countdown 10 giây, tạo không gian "nghi lễ" trước khi bắt đầu rút bài.

**Cần làm**:
- Tạo `src/components/FocusScreen.tsx`:
  - Props: `question: string`, `onComplete: () => void`, `duration?: number` (default 10)
  - Overlay fullscreen z-50, dark gradient background
  - Hiệu ứng: câu hỏi fade-in ở giữa màn hình, font Cinzel italic gold
  - Countdown vòng tròn (circular progress) từ 10 → 0
  - Text gợi ý: "Hít thở sâu... tập trung vào câu hỏi của bạn"
  - Auto-close khi countdown = 0, hoặc nút "Bỏ qua" để skip
  - Framer Motion animations: fade, scale, blur
- Tích hợp vào `ReadingDraw.tsx`:
  - Sau khi user nhấn "Xáo bộ bài" và `isShuffled = true`
  - Trước khi cho phép rút lá đầu tiên
  - Chỉ hiện nếu user đã nhập `focusQuestion`

**Tham khảo**: TAROT-vibe hiển thị focus screen với text "Hãy hít thở sâu và tập trung..." + circle countdown

---

### 3. ⚡ Lightning Effects (Hiệu ứng sét khi lật bài)

**Mô tả**: Flash sét trên canvas overlay khi lật bài, tạo cảm giác dramatic.

**Cần làm**:
- Tạo `src/components/LightningCanvas.tsx`:
  - Canvas fullscreen, position fixed, pointer-events none, z-40
  - Hàm `triggerLightning()` exposable via ref hoặc callback
  - Vẽ 2-3 nhánh sét random (Bezier curves) từ trên xuống
  - Màu: trắng xanh nhạt (`rgba(180,200,255,0.9)`) + glow
  - Duration: flash 150ms, fade 300ms
  - Screen flash overlay (trắng opacity 0.15) kèm theo
- Tích hợp vào `ReadingDraw.tsx`:
  - Trigger mỗi khi một lá bài được reveal (drawNext)
  - Có thể toggle on/off (lưu localStorage)

**Tham khảo**: TAROT-vibe dùng canvas 2D để vẽ lightning bolts với random branching

---

### 4. 🌟 Enhanced Particles + Warp Effect

**Mô tả**: Nâng cấp BackgroundParticles hiện tại thêm mode "warp" — stars bay về trung tâm khi chuyển trang.

**Cần làm**:
- Sửa `src/components/BackgroundParticles.tsx`:
  - Thêm prop `warp?: boolean`
  - Khi `warp=true`: tất cả stars animate về center screen (tạo hiệu ứng hyperspace)
  - Thêm nhiều hạt hơn (80-100 thay vì 50)
  - Thêm "nebula glow" — 2-3 vùng sáng mờ lớn animate chậm
  - Thêm subtle "dust" particles (rất nhỏ, opacity thấp)
- Trigger warp khi navigate từ Index → ReadingPicker hoặc ReadingDraw
  - Dùng `useNavigate` + setTimeout delay 500ms trước khi navigate

---

### 5. 🃏 Floating Cards trên Landing Page

**Mô tả**: 5-7 lá bài Tarot bay chậm trên nền hero section của landing page.

**Cần làm**:
- Tạo `src/components/FloatingCards.tsx`:
  - Render 5-7 `<img>` lá bài random từ `allCards`
  - Position absolute, phân tán khắp hero section
  - CSS animation: float lên xuống chậm (8-15s cycle), rotate nhẹ (±5°)
  - Opacity thấp (0.15-0.25) để không che nội dung
  - Tilt nhẹ 3D với perspective
  - Responsive: ẩn bớt trên mobile
- Thêm vào `Index.tsx` hero section (trước `.container`)

**Tham khảo**: TAROT-vibe có `float-cards.js` với 8 lá bài bay trên landing

---

### 6. ❓ Clarification Questions (Hỏi thêm trước AI phân tích)

**Mô tả**: Sau khi rút bài xong, trước khi gọi AI, hiện modal hỏi 3 câu yes/no để AI hiểu sâu hơn.

**Cần làm**:
- Tạo `src/data/clarifyQuestions.ts`:
  ```typescript
  export interface ClarifyQuestion {
    id: string;
    text: string;
    category: 'emotion' | 'context' | 'action';
  }
  export const clarifyQuestions: ClarifyQuestion[] = [
    { id: 'q1', text: 'Bạn đang cảm thấy áp lực hoặc lo lắng về vấn đề này?', category: 'emotion' },
    { id: 'q2', text: 'Đã có ai khác liên quan hoặc ảnh hưởng đến tình huống này?', category: 'context' },
    { id: 'q3', text: 'Bạn đã thử hành động gì đó nhưng chưa thấy kết quả?', category: 'action' },
    // Thêm 10-15 câu nữa, random chọn 3
  ];
  ```
- Tạo `src/components/ClarifyModal.tsx`:
  - Dialog/modal hiện 3 câu hỏi random
  - Mỗi câu có 3 nút: "Có" / "Không" / "Bỏ qua"
  - Collect answers → truyền vào AI prompt
  - Progress indicator (1/3, 2/3, 3/3)
  - Style: mystic theme, gold accents
- Sửa `ReadingDraw.tsx` / `ReadingResult.tsx`:
  - Khi user nhấn "Tạo luận giải AI" → show ClarifyModal trước
  - Sau khi trả lời xong → gọi `generateTarotInterpretation()` với clarify answers kèm theo
- Sửa `src/lib/geminiService.ts` hoặc `aiService.ts`:
  - Thêm clarification answers vào prompt gửi AI

---

### 7. 📋 Expanded Topics + Preset Questions System

**Mô tả**: Mở rộng hệ thống chủ đề và câu hỏi gợi ý giống TAROT-vibe (5 main themes, 60+ sub-themes, hàng trăm preset questions).

**Cần làm**:
- Tạo `src/data/themes.ts`:
  ```typescript
  export interface SubTheme {
    id: string;
    name: string;
    icon: string;
    description: string;
    presetQuestions: string[];
  }
  export interface MainTheme {
    id: string;
    name: string;
    icon: string;
    color: string;
    subThemes: SubTheme[];
  }
  export const mainThemes: MainTheme[] = [
    {
      id: 'love', name: 'Tình cảm', icon: '💕', color: 'rose',
      subThemes: [
        { id: 'crush', name: 'Crush / Thầm thích', icon: '🦋', description: '...', presetQuestions: [
          'Người ấy có để ý đến mình không?',
          'Mình nên bày tỏ hay tiếp tục chờ đợi?',
          'Cảm xúc này có nên theo đuổi?',
        ]},
        { id: 'relationship', name: 'Mối quan hệ', icon: '💑', description: '...', presetQuestions: [...] },
        { id: 'ex', name: 'Người cũ', icon: '💔', description: '...', presetQuestions: [...] },
        { id: 'marriage', name: 'Hôn nhân', icon: '💍', description: '...', presetQuestions: [...] },
        // ... thêm 8-10 sub-themes nữa
      ]
    },
    {
      id: 'career', name: 'Sự nghiệp', icon: '💼', color: 'amber',
      subThemes: [
        { id: 'job-change', name: 'Đổi việc', icon: '🔄', ... },
        { id: 'promotion', name: 'Thăng tiến', icon: '📈', ... },
        { id: 'business', name: 'Kinh doanh', icon: '🏪', ... },
        // ...
      ]
    },
    {
      id: 'spiritual', name: 'Tâm linh', icon: '🔮', color: 'purple', subThemes: [...] },
    {
      id: 'health', name: 'Sức khỏe', icon: '🌿', color: 'emerald', subThemes: [...] },
    {
      id: 'finance', name: 'Tài chính', icon: '💰', color: 'yellow', subThemes: [...] },
  ];
  ```
- Sửa `ReadingDraw.tsx`:
  - Thay `focusPromptSuggestions` (3 câu cố định) → hệ thống chọn theme → sub-theme → preset questions
  - Hiện grid chủ đề trước textarea, click chọn → fill preset question

---

### 8. 🎴 VanillaTilt 3D Effect trên lá bài

**Mô tả**: Hiệu ứng nghiêng 3D + glare khi hover lên lá bài.

**Cần làm**:
- Install: `npm install vanilla-tilt`
- Tạo `src/hooks/useTilt.ts`:
  ```typescript
  import { useEffect, useRef } from 'react';
  import VanillaTilt from 'vanilla-tilt';
  export function useTilt(options = {}) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!ref.current) return;
      VanillaTilt.init(ref.current, {
        max: 15, speed: 400, glare: true, 'max-glare': 0.3,
        scale: 1.02, perspective: 1000, ...options,
      });
      return () => ref.current?.vanillaTilt?.destroy();
    }, []);
    return ref;
  }
  ```
- Apply vào `TarotCard.tsx`: wrap card front với tilt ref (chỉ khi revealed)
- Apply vào `DailyTarotWidget.tsx`: wrap card image với tilt
- Apply vào `ReadingResult.tsx`: card images trong grid

---

### 9. 🔒 Privacy Modal + ☕ Donate Modal

**Mô tả**: Modal cam kết bảo mật + modal donate/ủng hộ giống TAROT-vibe.

**Cần làm**:
- Tạo `src/components/PrivacyModal.tsx`:
  - Dialog với nội dung: "Chúng tôi cam kết bảo mật thông tin..."
  - Các điểm: không lưu dữ liệu cá nhân, mã hóa, không chia sẻ bên thứ 3
  - Icon shield, style mystic theme
- Tạo `src/components/DonateModal.tsx`:
  - Dialog với nội dung: "Ủng hộ dự án"
  - QR code placeholder (hoặc link Buy Me A Coffee)
  - Lời cảm ơn
- Thêm links vào `Header.tsx` hoặc footer:
  - Icon shield → PrivacyModal
  - Icon coffee → DonateModal

---

### 10. 📺 Fullscreen Mode

**Mô tả**: Chế độ toàn màn hình khi xem bài để tăng immersion.

**Cần làm**:
- Tạo `src/hooks/useFullscreen.ts`:
  ```typescript
  export function useFullscreen() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const toggle = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };
    useEffect(() => {
      const handler = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener('fullscreenchange', handler);
      return () => document.removeEventListener('fullscreenchange', handler);
    }, []);
    return { isFullscreen, toggle };
  }
  ```
- Thêm nút fullscreen vào `ReadingDraw.tsx`:
  - Icon Maximize/Minimize ở góc phải trên
  - Tooltip: "Chế độ toàn màn hình"
  - Auto-suggest fullscreen khi bắt đầu shuffle (dialog nhỏ hỏi "Bạn có muốn vào chế độ tập trung?")

---

## QUY TẮC KHI TRIỂN KHAI

1. **Tech stack**: React 18 + TypeScript + TailwindCSS + Framer Motion. KHÔNG dùng vanilla JS.
2. **Style**: Dùng TailwindCSS classes. Color scheme: `--gold`, `--mystic-purple`, `--mystic-deep` (đã define sẵn trong `index.css`).
3. **Font**: Tiêu đề dùng `Cinzel`, body dùng `Crimson Text` (đã import sẵn).
4. **Components**: Dùng shadcn/ui components có sẵn (`Button`, `Dialog`, `Badge`, `Slider`, `Textarea`, etc.) trong `src/components/ui/`.
5. **Assets**: Dùng `publicAsset('audio/file.mp3')` để tạo đường dẫn tới file trong `public/`.
6. **Animation**: Ưu tiên Framer Motion (`motion.div`, `AnimatePresence`).
7. **State**: Dùng React hooks (`useState`, `useEffect`, `useRef`). Persist với `localStorage`.
8. **Routing**: React Router v6 (`useNavigate`, `useParams`, `Link`).
9. **Responsive**: Mobile-first, breakpoints `sm:`, `md:`, `lg:`.
10. **Naming**: File components PascalCase, hooks camelCase với prefix `use`, data files camelCase.

## THỨ TỰ TRIỂN KHAI GỢI Ý

1. Copy audio files → `public/audio/`
2. `useAudioManager` + `MusicWidget` (nhạc nền + SFX)
3. `FocusScreen` (tích hợp ReadingDraw)
4. `LightningCanvas` (tích hợp ReadingDraw)
5. `FloatingCards` (tích hợp Index)
6. Nâng cấp `BackgroundParticles` (warp mode)
7. `themes.ts` + expand preset questions (tích hợp ReadingDraw)
8. `clarifyQuestions.ts` + `ClarifyModal` (tích hợp ReadingResult)
9. `useTilt` + apply VanillaTilt
10. `PrivacyModal` + `DonateModal` + `useFullscreen`

---

**Hãy bắt đầu triển khai lần lượt từng tính năng. Sau mỗi tính năng, commit code và kiểm tra `npm run build` để đảm bảo không có lỗi TypeScript.**
