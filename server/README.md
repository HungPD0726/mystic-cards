# Astral Arcana Backend API

Backend cho ứng dụng Astral Arcana, dùng để xác thực người dùng và lưu lịch sử xem bói.

## Stack

- Express.js
- TypeScript
- SQL Server
- Sequelize
- JWT

## Yêu cầu

- Node.js 18+
- SQL Server
- npm

## Cài đặt

```bash
cd server
npm install
```

Tạo file `.env` từ `server/.env.example`, sau đó cấu hình các biến như:

- `PORT`
- `NODE_ENV`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`

## Chạy backend

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Production:

```bash
npm start
```

Seed dữ liệu:

```bash
npm run seed
```

Reset database:

```bash
npm run reset-db
```

## API hiện có

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Readings:

- `GET /api/readings`
- `POST /api/readings`
- `GET /api/readings/:id`
- `DELETE /api/readings/:id`

Cards:

- `GET /api/cards`
- `GET /api/cards/:slug`

Health:

- `GET /api/health`

## Ghi chú

- Frontend local hiện thường chạy ở `http://localhost:8080`.
- CORS được đọc từ `CORS_ORIGIN` và có thể khai báo nhiều origin, ngăn cách bằng dấu phẩy.
- File mô tả backend cũ bị lỗi encoding và đã được thay bằng bản ngắn, đúng với codebase hiện tại.
