# 🚀 BMC CivicConnect — Production Deployment Guide

This guide provides end-to-end instructions for deploying the **BMC CivicConnect (Smart Civic Complaint & Service Delivery Platform)** monorepo across cloud platforms, serverless hosting, or custom VPS instances.

---

## 📋 Table of Contents
1. [Prerequisites & Database Setup](#1-prerequisites--database-setup)
2. [Option A: 1-Click Fullstack on Render (Recommended)](#option-a-1-click-fullstack-on-render-recommended)
3. [Option B: Decoupled — Vercel (Frontend) + Render / Railway (Backend)](#option-b-decoupled--vercel-frontend--render--railway-backend)
4. [Option C: Docker & Docker Compose on VPS (AWS / DigitalOcean / Linode)](#option-c-docker--docker-compose-on-vps-aws--digitalocean--linode)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Post-Deployment Database Seeding](#6-post-deployment-database-seeding)
7. [Health Checks & Verification](#7-health-checks--verification)

---

## 1. Prerequisites & Database Setup

### 1.1 MongoDB Atlas Configuration
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Under **Network Access**, ensure IP Access List includes `0.0.0.0/0` (Allow Access from Anywhere) so cloud instances (Render, Vercel, Railway) can connect.
3. Under **Database Access**, verify your database user has read/write privileges on the `bmc_civic_connect` database.
4. Obtain your connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.yopnzzs.mongodb.net/bmc_civic_connect?retryWrites=true&w=majority
   ```

---

## Option A: 1-Click Fullstack on Render (Recommended)

Render can build the entire monorepo and serve both the Express API and built React SPA from a single web service.

### Step-by-Step Instructions:
1. Push your code to GitHub:
   ```bash
   git push origin main
   ```
2. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New +** $\to$ **Blueprint** (or **Web Service**).
3. Select the GitHub repository `BMC-CivicConnect_Tech-Practical`.
4. Render will automatically detect the [`render.yaml`](./render.yaml) file or you can configure manually:
   - **Environment**: `Node`
   - **Node Version**: `20`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     node server/dist/server.js
     ```
5. Add the following **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Render default port |
   | `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas URI |
   | `JWT_ACCESS_SECRET` | *(Generate a 32+ char random string)* | Access token signing |
   | `JWT_REFRESH_SECRET` | *(Generate a 32+ char random string)* | Refresh token signing |
   | `CLIENT_URL` | `https://your-service-name.onrender.com` | CORS origin |

6. Click **Create Web Service**. Once deployed, your site will be live at `https://your-service-name.onrender.com`.

---

## Option B: Decoupled — Vercel (Frontend) + Render / Railway (Backend)

### Step 1: Deploy Backend on Render or Railway
1. Create a **Web Service** pointing to the GitHub repository.
2. Set **Build Command**:
   ```bash
   npm install && npm run build --workspace=@bmc/shared && npm run build --workspace=@bmc/server
   ```
3. Set **Start Command**:
   ```bash
   node server/dist/server.js
   ```
4. Set Environment Variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `mongodb+srv://...`
   - `JWT_ACCESS_SECRET` = *(Secret string)*
   - `JWT_REFRESH_SECRET` = *(Secret string)*
   - `CLIENT_URL` = `https://your-frontend.vercel.app` (Add your Vercel URL once deployed)
5. Copy your backend domain (e.g. `https://bmc-backend.onrender.com`).

### Step 2: Deploy Frontend on Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New...** $\to$ **Project**.
2. Import the GitHub repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (or `client`)
   - **Build Command**: `npm run build --workspace=@bmc/client`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`
4. Add **Environment Variables**:
   | Variable | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://bmc-backend.onrender.com/api/v1` |
   | `VITE_SOCKET_URL` | `https://bmc-backend.onrender.com` |
5. Click **Deploy**. Vercel will build and launch the frontend with SPA rewrites from [`vercel.json`](./vercel.json).
6. Update the `CLIENT_URL` environment variable on your backend to match your Vercel domain.

---

## Option C: Docker & Docker Compose on VPS (AWS / DigitalOcean / Linode)

Deploy with zero configuration using Docker on any Linux VPS or server.

### Step 1: Clone and Configure on Server
```bash
git clone https://github.com/Bhautik-4B/BMC-CivicConnect_Tech-Practical.git
cd BMC-CivicConnect_Tech-Practical
cp .env.example .env
```

### Step 2: Edit `.env`
```bash
nano .env
```
Ensure `MONGODB_URI`, `JWT_ACCESS_SECRET`, and `CLIENT_URL` are configured with your values.

### Step 3: Launch with Docker Compose
```bash
docker compose up -d --build
```

### Step 4: Check Logs and Status
```bash
docker compose logs -f
docker compose ps
```
The full application will be running on `http://YOUR_SERVER_IP:5000` or mapped domain.

---

## 5. Environment Variables Reference

| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Enables production caching & optimizations |
| `PORT` | No | `5000` | Server listening port |
| `MONGODB_URI` | Yes | `mongodb+srv://...` | Connection URI to MongoDB Atlas |
| `JWT_ACCESS_SECRET` | Yes | `bmc_jwt_access_super_secret_key_...` | Signs JWT access tokens |
| `JWT_REFRESH_SECRET` | Yes | `bmc_jwt_refresh_super_secret_key_...` | Signs JWT refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Token expiry duration |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token expiry duration |
| `CLIENT_URL` | Yes | `https://your-domain.com,https://app.vercel.app` | Comma-separated CORS allowed origins |
| `VITE_API_URL` | No | `/api/v1` or `https://backend.com/api/v1` | Frontend API client base URL |
| `VITE_SOCKET_URL` | No | `https://backend.com` | Real-time WebSocket connection URL |

---

## 6. Post-Deployment Database Seeding

To seed the initial 8 Bhavnagar Wards, 5 Departments, Staff Roster, and 12 complete demo tickets:

### From local machine against production database:
```bash
MONGODB_URI="mongodb+srv://..." npm run seed --workspace=@bmc/server
```

### Or inside Docker container:
```bash
docker compose exec app npm run seed --workspace=@bmc/server
```

### Default Seeded Profiles for Testing:
- **BMC Super Admin**: Mobile `9999999999` / Password `Admin@123`
- **Road Dept Officer**: Mobile `9888888881` / Password `Admin@123`
- **Sanitation Officer**: Mobile `9888888882` / Password `Admin@123`
- **Water Supply Officer**: Mobile `9888888883` / Password `Admin@123`
- **Field Staff (Amit Patel)**: Mobile `9777777771` / Password `Admin@123`
- **Citizen (Bhautik Sorathiya)**: Mobile `9876543210` / OTP `123456`

---

## 7. Health Checks & Verification

After deployment, verify the services are responding:

```bash
# 1. API Health Check
curl -I https://your-deployed-domain.com/api/v1/health

# 2. Public Master Data Endpoint
curl https://your-deployed-domain.com/api/v1/admin/wards
```

Expected Response:
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "BMC CivicConnect API is healthy",
  "timestamp": "2026-09-12T12:00:00.000Z"
}
```
