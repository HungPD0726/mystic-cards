# Mystic Cards Backend API

Backend API for the Mystic Cards tarot application.

## Stack

- Express.js
- TypeScript
- Sequelize
- PostgreSQL (default)
- JWT

## Requirements

- Node.js 18+
- PostgreSQL (local or managed cloud)
- npm

## Setup

```bash
cd server
npm install
```

Create `.env` from `server/.env.example`.

Important variables:

- `PORT`
- `NODE_ENV`
- `DB_DIALECT` (`postgres` by default)
- `DATABASE_URL` (recommended for cloud deployments)
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_SSL`
- `DB_SSL_REJECT_UNAUTHORIZED`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`

## Scripts

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

Seed data:

```bash
npm run seed
```

Reset database schema:

```bash
npm run reset-db
```

## API

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
