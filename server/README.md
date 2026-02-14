# Mystic Cards Backend API

Backend API cho ứng dụng Tarot Reading **Mystic Cards**, được xây dựng bằng Express.js, TypeScript và SQL Server.

## 🚀 Công nghệ sử dụng

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Sequelize** - ORM cho SQL Server
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## 📋 Yêu cầu

- Node.js >= 16
- SQL Server
- npm hoặc yarn

## ⚙️ Cài đặt

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Cấu hình Environment Variables

Copy file `.env.example` thành `.env` và cập nhật thông tin:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=1433
DB_NAME=mystic_cards
DB_USER=sa
DB_PASSWORD=your_password

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

### 3. Seed Database

Chạy script để tạo database và seed 78 lá bài tarot:

```bash
npm run seed
```

### 4. Khởi động server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký user mới

  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Đăng nhập

  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - Lấy thông tin user hiện tại (requires authentication)

### Readings (Requires Authentication)

- `GET /api/readings` - Lấy danh sách readings
  - Query params: `page`, `limit`
- `POST /api/readings` - Lưu reading mới

  ```json
  {
    "spreadType": "three-card",
    "spreadName": "Ba Lá",
    "drawnCards": [...],
    "notes": "Optional notes"
  }
  ```

- `GET /api/readings/:id` - Lấy chi tiết một reading

- `DELETE /api/readings/:id` - Xóa reading

### Cards (Public)

- `GET /api/cards` - Lấy tất cả tarot cards
  - Query params: `group`, `search`

- `GET /api/cards/:slug` - Lấy card theo slug

### Health Check

- `GET /api/health` - Kiểm tra server status

## 🔐 Authentication

API sử dụng JWT tokens. Sau khi login, include token trong header:

```
Authorization: Bearer <your_token_here>
```

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.ts       # Database configuration
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── readingController.ts
│   │   └── cardController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Reading.ts
│   │   ├── Card.ts
│   │   └── index.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── readings.ts
│   │   ├── cards.ts
│   │   └── index.ts
│   ├── scripts/
│   │   └── seed.ts
│   ├── app.ts
│   └── server.ts
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

## 🗄️ Database Schema

### Users Table

- `id` - Primary Key
- `email` - Unique, Email format
- `username` - Unique
- `password` - Hashed với bcrypt
- `createdAt`, `updatedAt`

### Readings Table

- `id` - Primary Key
- `userId` - Foreign Key → Users
- `spreadType` - String (one-card, three-card, yes-no)
- `spreadName` - String
- `drawnCards` - JSON
- `notes` - Text (optional)
- `createdAt`, `updatedAt`

### Cards Table

- `id` - Primary Key
- `name` - String
- `slug` - Unique
- `imagePath` - String
- `keywords` - JSON Array
- `uprightMeaning` - Text
- `reversedMeaning` - Text
- `description` - Text
- `group` - String (major, wands, cups, swords, pentacles)

## 🛠️ Development

```bash
# Run in development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start
```

## 📝 Notes

- Passwords được hash tự động khi tạo/update user
- JWT tokens expire sau 7 ngày (configurable)
- Database sync tự động khi start server (development mode)
- CORS được configure cho frontend ở port 5173
