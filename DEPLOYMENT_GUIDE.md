# Deployment Guide

This project is configured for independent deployments:

- Frontend: Vercel
- Backend API: Render, Railway, Fly.io, or another Node server host
- Database: Supabase Postgres, Neon, Render Postgres, Railway Postgres, or any external PostgreSQL database

The frontend must know the backend URL through `VITE_API_URL`. The backend must allow the frontend origin through `FRONTEND_URL` and `CORS_ORIGINS`.

## Architecture

```txt
Browser
  -> Frontend on Vercel
  -> Backend API on Render/Railway
  -> PostgreSQL database
```

Important runtime URLs:

```txt
Frontend URL: https://your-frontend.vercel.app
Backend URL:  https://your-backend.onrender.com
tRPC API:     https://your-backend.onrender.com/api/trpc
Health API:   https://your-backend.onrender.com/api/health
OAuth URL:    https://your-backend.onrender.com/api/oauth/callback
```

## Required Versions

Recommended:

```txt
Node.js: 24.x
pnpm: 10.x
```

The project currently uses `pnpm` and ESM modules.

## Local Pre-Deployment Checks

Run these before deploying:

```bash
pnpm install
pnpm run check
pnpm run build:client
pnpm run build:backend
```

Optional database schema push:

```bash
pnpm run db:push
```

Only run `db:push` against the database you intend to update.

## Frontend Deployment: Vercel

Import the GitHub repository into Vercel and use these settings.

### Build and Output Settings

```txt
Framework Preset: Vite
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm run build:client
Output Directory: dist/public
Root Directory: ./
```

The repository includes [vercel.json](./vercel.json), which keeps Vercel frontend-only and sends all non-file routes to `index.html` for the React SPA. This is required for direct visits to client-side routes such as `/admin`, `/blog`, and `/blog/my-post`.

### Vercel Environment Variables

Set these in Vercel Project Settings -> Environment Variables.

Required:

```txt
VITE_API_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
PUBLIC_SITE_URL=https://your-frontend.vercel.app
```

Optional analytics:

```txt
VITE_ANALYTICS_ENDPOINT=https://cloud.umami.is/script.js
VITE_ANALYTICS_WEBSITE_ID=your-umami-website-id
```

Optional Google Maps frontend proxy settings:

```txt
VITE_FRONTEND_FORGE_API_URL=your-forge-proxy-url
VITE_FRONTEND_FORGE_API_KEY=your-forge-public-key
```

Do not set these on Vercel:

```txt
DATABASE_URL
JWT_SECRET
GOOGLE_CLIENT_SECRET
GROQ_API_KEY
HUGGINGFACE_API_KEY
SMTP_PASSWORD
NODE_ENV
```

`VITE_*` variables are bundled into browser JavaScript. Never put private secrets in `VITE_*`.

## Backend Deployment: Render

Create a new Render Web Service from the same GitHub repository.

### Render Service Settings

```txt
Environment: Node
Region: choose closest to your users/database
Branch: main
Root Directory: ./
Build Command: pnpm install --frozen-lockfile && pnpm run build:backend
Start Command: pnpm run start:backend
Health Check Path: /api/health
Auto Deploy: Yes
```

If Render asks for a Node version, set:

```txt
NODE_VERSION=24
```

Render automatically provides `PORT`. Do not hard-code the backend port in production.

### Render Environment Variables

Required core variables:

```txt
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=generate-a-long-random-secret
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-frontend.vercel.app
PUBLIC_SITE_URL=https://your-frontend.vercel.app
```

Required Google OAuth variables:

```txt
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Admin ownership:

```txt
OWNER_EMAIL=your-admin-email@example.com
OWNER_NAME=Your Name
OWNER_GOOGLE_SUB=optional-google-user-sub
```

AI chat and RAG:

```txt
GROQ_API_URL=https://api.groq.com/openai/v1
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
HUGGINGFACE_API_KEY=your-huggingface-api-key
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
HUGGINGFACE_EMBEDDING_URL=https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2
```

Weather:

```txt
OPENWEATHER_API_KEY=your-openweather-api-key
```

Email/contact/newsletter notifications:

```txt
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-email-app-password
EMAIL_FROM=your-email@gmail.com
CONTACT_EMAIL_TO=recipient@example.com
```

Optional Manus/Forge integrations:

```txt
BUILT_IN_FORGE_API_URL=your-forge-api-url
BUILT_IN_FORGE_API_KEY=your-forge-api-key
```

Backend-only production flag:

```txt
SERVE_STATIC_FRONTEND=false
```

Do not set `NODE_ENV` manually unless the platform requires it. The `start:backend` script already runs the server in production mode.

## Backend Deployment: Railway Alternative

Create a Railway service from the GitHub repository.

Use these commands:

```txt
Build Command: pnpm install --frozen-lockfile && pnpm run build:backend
Start Command: pnpm run start:backend
```

Set the same backend environment variables listed in the Render section.

Health endpoint:

```txt
/api/health
```

## Database Setup

Use a hosted PostgreSQL database.

Recommended options:

- Supabase Postgres
- Neon
- Railway Postgres
- Render Postgres

Set the backend environment variable:

```txt
DATABASE_URL=postgresql://user:password@host:port/database
```

Then apply the Drizzle schema from your local machine or deployment shell:

```bash
pnpm run db:push
```

If you use Supabase pooler URLs, keep `sslmode` and pooler settings exactly as Supabase provides them.

## Google OAuth Setup

Go to Google Cloud Console -> APIs & Services -> Credentials.

Use one OAuth Client ID for the app.

Authorized JavaScript origins:

```txt
https://your-frontend.vercel.app
https://your-backend.onrender.com
```

Authorized redirect URIs:

```txt
https://your-backend.onrender.com/api/oauth/callback
```

Then set:

Frontend on Vercel:

```txt
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Backend on Render/Railway:

```txt
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## CORS and Cookies

Because frontend and backend are on different domains, the backend must allow the frontend origin.

Set on backend:

```txt
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-frontend.vercel.app
```

For a custom domain:

```txt
FRONTEND_URL=https://lidetadmassu.dev
CORS_ORIGINS=https://lidetadmassu.dev,https://your-frontend.vercel.app
PUBLIC_SITE_URL=https://lidetadmassu.dev
```

The frontend sends API requests with credentials enabled, so the backend CORS configuration must allow credentials.

## Custom Domain Setup

If your public site is:

```txt
https://lidetadmassu.dev
```

Set on Vercel:

```txt
PUBLIC_SITE_URL=https://lidetadmassu.dev
VITE_API_URL=https://your-backend.onrender.com
```

Set on backend:

```txt
PUBLIC_SITE_URL=https://lidetadmassu.dev
FRONTEND_URL=https://lidetadmassu.dev
CORS_ORIGINS=https://lidetadmassu.dev,https://your-frontend.vercel.app
```

Update Google OAuth:

```txt
Authorized JavaScript origins:
https://lidetadmassu.dev
https://your-backend.onrender.com

Authorized redirect URIs:
https://your-backend.onrender.com/api/oauth/callback
```

## Post-Deployment Verification

After backend deploy:

```txt
https://your-backend.onrender.com/api/health
```

Expected:

```json
{
  "ok": true,
  "service": "lidet-portfolio-api"
}
```

After frontend deploy, open browser DevTools -> Network and confirm:

```txt
GET/POST https://your-backend.onrender.com/api/trpc/...
```

No API request should go to:

```txt
https://your-frontend.vercel.app/api/trpc
```

Also test direct SPA routes in a fresh tab:

```txt
https://your-frontend.vercel.app/admin
https://your-frontend.vercel.app/blog
```

Test these flows:

- Home page loads
- Projects, skills, certificates, blog posts, and testimonials fetch
- Contact form submits
- Newsletter subscribe works
- AI chat works
- Admin login redirects through Google
- Admin image uploads work
- Uploaded images display from backend URLs

## Troubleshooting

### `Unexpected token '<', "<!doctype "... is not valid JSON`

The frontend is calling the frontend domain instead of the backend.

Fix:

```txt
VITE_API_URL=https://your-backend.onrender.com
```

Then redeploy the frontend.

### `Unexpected token 'A', "A server e"... is not valid JSON`

The backend returned a platform error page.

Fix:

- Check backend deployment logs.
- Confirm `pnpm run build:backend` succeeds.
- Confirm `pnpm run start:backend` is the start command.
- Confirm required backend env vars are set.

### CORS Error

Fix backend env:

```txt
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-frontend.vercel.app
```

Redeploy backend.

### Google OAuth Redirect Error

Fix Google Cloud Console redirect URI:

```txt
https://your-backend.onrender.com/api/oauth/callback
```

Also confirm:

```txt
VITE_API_URL=https://your-backend.onrender.com
```

### Database Queries Return Empty Arrays

Check:

```txt
DATABASE_URL
pnpm run db:push
```

Also confirm the deployed backend is using the same database where you added content.

### Uploaded Images Do Not Show

New uploaded project, blog, and certificate images are stored as database-backed `data:image/...` values in the relevant `imageUrl` or `coverImageUrl` fields. After choosing an image in the admin dashboard, save the project, blog post, or certificate so the image data is written to the database.

Older records that still point to `/uploads/...` may fail after redeploys on hosts with ephemeral filesystems. Re-upload and save those images once so they are converted to database-backed image data.

## Security Notes

Never expose these in frontend/Vercel `VITE_*` variables:

```txt
DATABASE_URL
JWT_SECRET
GOOGLE_CLIENT_SECRET
GROQ_API_KEY
HUGGINGFACE_API_KEY
SMTP_PASSWORD
OPENWEATHER_API_KEY
```

If any private key or password was pasted into chat, committed to Git, or exposed in build logs, rotate it before production launch.

Keep `.env` local-only and do not commit it.
