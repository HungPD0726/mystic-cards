# Astral Arcana

Ứng dụng xem bói theo chủ đề huyền học, tập trung vào Tarot, cung hoàng đạo và phần luận giải có hỗ trợ AI.

## Tính năng chính

- Chọn nhiều kiểu trải bài: nhanh, cổ điển, theo chủ đề và chuyên sâu.
- Rút bài trực quan theo từng vị trí, xem nghĩa chi tiết trước khi sang kết quả.
- Tạo luận giải AI cho toàn bộ spread.
- Lưu lịch sử cục bộ hoặc đồng bộ qua Supabase khi đã đăng nhập.
- Các module bổ trợ như Zodiac và Sky 360.

## Frontend

Yêu cầu:

- Node.js 18+
- npm

Chạy local:

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
```

Test:

```bash
npm run test
```

Các biến môi trường frontend đang được dùng:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL`
- `VITE_BASE_PATH` cho GitHub Pages nếu cần

## Backend

Thư mục `server/` chứa API Express + TypeScript cho xác thực và lưu lịch sử xem bói.

Chạy backend:

```bash
cd server
npm install
npm run dev
```

Tài liệu backend chi tiết hơn nằm ở [server/README.md](/d:/Dự án tự tạo/mystic-cards/server/README.md).

## Cấu trúc chính

- `src/pages/ReadingPicker.tsx`: trang chọn spread tại `/reading`
- `src/pages/ReadingDraw.tsx`: màn rút bài theo spread
- `src/pages/ReadingResult.tsx`: màn tổng hợp kết quả và luận giải AI
- `src/data/spreads.ts`: cấu hình toàn bộ spread
- `src/lib/readingSession.ts`: helper lưu phiên xem bói hiện tại

## Deploy

Project đang có script deploy GitHub Pages:

```bash
npm run deploy
```

Nếu deploy dưới subpath, đặt `VITE_BASE_PATH` tương ứng trước khi build.
