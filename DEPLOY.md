# Deploy Guide

This project currently deploys cleanly with a hybrid setup:

- Frontend: Vite app on GitHub Pages, Vercel, or Netlify
- Backend API: Express server from `server/` on Render
- Product backend: Supabase for auth, data, storage, and edge functions

Do not point the Render API at the Supabase Postgres database. The schema in
`server/src/models` is different from the schema in `supabase/migrations`.

## 1. Provision Supabase

Create a Supabase project first. The frontend depends on it for auth and data.

Run the migrations:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Deploy the edge function:

```bash
npx supabase functions deploy tarot-interpret --no-verify-jwt
```

Set the edge function secret:

```bash
npx supabase secrets set LOVABLE_API_KEY=<your-lovable-api-key>
```

Configure Supabase Auth:

- Set `Site URL` to your frontend production URL
- Add all production callback URLs to `Redirect URLs`
- Enable `Google` in Auth providers
- Enable `GitHub` too if you plan to keep GitHub login enabled in the UI

For Google Auth, use the same web client id in both places:

- Supabase Google provider config
- Render env `GOOGLE_CLIENT_ID`

## 2. Provision a separate Postgres database for Render

Use Render Postgres, Neon, Railway, or another managed Postgres instance for
the Express API.

Why a separate database is required:

- `server/` uses Sequelize models with numeric user ids
- Supabase tables use UUID user ids from `auth.users`
- Table shapes also differ, including `readings`

Set aside the Postgres connection string. You will use it as `DATABASE_URL` in
Render.

## 3. Deploy the Express API to Render

This repo already includes [`render.yaml`](/d:/Dự án tự tạo/mystic-cards/render.yaml).
You can deploy it as a Render Blueprint or create the service manually with the
same settings.

Required env vars for the Render service:

- `NODE_ENV=production`
- `PORT=5000`
- `DB_DIALECT=postgres`
- `DATABASE_URL=<your-separate-postgres-url>`
- `DB_SSL=true`
- `DB_SSL_REJECT_UNAUTHORIZED=false`
- `JWT_SECRET=<strong-random-secret>`
- `JWT_EXPIRES_IN=7d`
- `GOOGLE_CLIENT_ID=<your-google-web-client-id>`
- `CORS_ORIGIN=<your-frontend-production-origin>`

Build and start commands:

```bash
cd server
npm install
npm run build
npm start
```

After deployment, verify the API health check:

```text
https://<your-render-service>.onrender.com/api/health
```

## 4. Deploy the frontend

Create your frontend env file from [`.env.example`](/d:/Dự án tự tạo/mystic-cards/.env.example).

Required frontend env vars:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api`

Optional frontend env vars:

- `VITE_BASE_PATH=/` for root hosting
- `VITE_BASE_PATH=/mystic-cards/` for GitHub Pages repo hosting
- `VITE_GOOGLE_API_KEY` for direct Gemini fallback if the edge function fails
- `VITE_GEMINI_MODEL`

Build command:

```bash
npm install
npm run build
```

GitHub Pages:

```bash
npm run deploy
```

If you use the existing GitHub Actions workflow, add these repository secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL`
- `VITE_GOOGLE_API_KEY` if you want the browser-side Gemini fallback

Also make sure GitHub Pages is configured to deploy from `GitHub Actions`.

Vercel or Netlify:

- Build command: `npm run build`
- Output directory: `dist`

## 5. Production checks

Run these checks after both deploys are live:

1. Open the frontend and confirm Supabase email login works.
2. Test Google login and confirm it returns from Supabase without a backend sync error.
3. Save a tarot reading and confirm it appears in Supabase `public.readings`.
4. Upload an avatar and confirm the file lands in the `avatars` storage bucket.
5. Generate an AI interpretation and confirm the `tarot-interpret` edge function responds.
6. Hit `GET /api/health` on Render and confirm the API is up.

## Current integration notes

The frontend still depends on the Render API for backend token sync during
Supabase auth flows:

- `POST /api/auth/google-login`
- `POST /api/auth/google-sync`

That is why the frontend deploy is not yet fully Supabase-only.
