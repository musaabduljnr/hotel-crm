# Haven CRM — Production Deployment Guide

This guide walks you through deploying the Haven CRM application to production across various platforms.

---

## Architecture Overview

Haven CRM can be deployed in two architectures:

1. **Unified Full-Stack Deployment (Recommended for simplicity)**:
   - A single Node.js service (e.g., Render, Railway, Heroku) runs the Express backend and serves the compiled React production assets.
2. **Decoupled Deployment**:
   - **Frontend**: Hosted on Vercel or Netlify.
   - **Backend**: Hosted on Render, Railway, or Fly.io.
   - **Database**: Hosted on Supabase (PostgreSQL) or a managed MySQL provider (Railway / Aiven).

---

## Option 1: Unified Deployment on Render (Easiest & Free)

Render can build the React frontend and run the Express API in a single service.

### Steps:

1. Push your repository to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository `musaabduljnr/hotel-crm`.
5. Configure the service:
   - **Name**: `hotel-crm`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. Under **Advanced** → **Environment Variables**, set:
   | Key | Example Value | Description |
   |-----|---------------|-------------|
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `5000` | Port for Express |
   | `JWT_SECRET` | *(Generate a 64+ char random string)* | Used to sign auth tokens |
   | `CLIENT_URL` | `*` or your Render URL | Allowed CORS origin |
   | `DB_SSL` | `true` | Required for most cloud databases |
   | `DATABASE_URL` | `mysql://user:pass@host:3306/hotel_crm` | Hosted MySQL connection string |

   *Or if using Supabase:*
   | Key | Value | Description |
   |-----|-------|-------------|
   | `USE_SUPABASE_AUTH` | `true` | Enables Supabase mode |
   | `SUPABASE_URL` | `https://your-ref.supabase.co` | Your Supabase project URL |
   | `SUPABASE_ANON_KEY` | `eyJhb...` | Anon public API key |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhb...` | Service role admin key |

7. Click **Create Web Service**.
8. Once deployed, test the health endpoint at: `https://your-app-name.onrender.com/api/health`.

---

## Option 2: Decoupled Deployment (Vercel + Render/Railway)

### A. Deploy Backend on Render / Railway

1. In Render or Railway, create a new Web Service pointing to the repository.
2. Set the **Root Directory** to `backend`.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Configure database variables (`DATABASE_URL` or `DB_*`, plus `JWT_SECRET`).
6. Set `CLIENT_URL` to your frontend Vercel URL (e.g., `https://your-crm.vercel.app`).

### B. Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import the `musaabduljnr/hotel-crm` repository.
3. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
4. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://your-backend-render-url.onrender.com/api` |
   | `GENERATE_SOURCEMAP` | `false` |
5. Click **Deploy**. Vercel will automatically use [`frontend/vercel.json`](../frontend/vercel.json) to handle single-page application route rewrites.

---

## Option 3: Docker Deployment

You can run the entire stack (Database + Backend + Frontend) using Docker Compose.

### Quick Start:

1. Clone the repository:
   ```bash
   git clone https://github.com/musaabduljnr/hotel-crm.git
   cd hotel-crm
   ```

2. Generate or update your environment credentials in `docker-compose.yml` or a `.env` file.

3. Start all services:
   ```bash
   docker compose up -d --build
   ```

4. The application will be accessible at:
   - Web App & API: `http://localhost:5000`
   - MySQL Database: `localhost:3306`

---

## Database Provisioning

### 1. Supabase (PostgreSQL)

If using Supabase:
1. Create a new project in the [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor**.
3. Copy the contents of [`database/migrations/002_supabase_hotel_crm.sql`](../database/migrations/002_supabase_hotel_crm.sql) and run it.
4. Go to **Settings** → **API** to copy:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key
5. Set `USE_SUPABASE_AUTH=true` in your backend environment.

### 2. Managed MySQL (Railway, Aiven, PlanetScale)

If using managed MySQL:
1. Create a MySQL database instance.
2. Execute [`database/schema.sql`](../database/schema.sql) in your database console or via MySQL CLI:
   ```bash
   mysql -h <host> -u <user> -p <database_name> < database/schema.sql
   ```
3. Copy your connection URL and set it as `DATABASE_URL` in your backend environment.

---

## Production Security Checklist

Before launching to live users:

- [ ] Ensure `JWT_SECRET` is set to a cryptographically secure random string (minimum 32 characters).
- [ ] Ensure default administrator credentials are changed immediately after initial login.
- [ ] Confirm `DB_SSL=true` is enabled when connecting to cloud database providers over public internet.
- [ ] Confirm CORS `CLIENT_URL` explicitly points to your domain(s) if not serving frontend directly from Express.
- [ ] Confirm `NODE_ENV=production` is set so that stack traces and verbose debug information are suppressed.
