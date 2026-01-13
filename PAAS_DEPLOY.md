# ☁️ Serverless / PaaS Deployment Guide

This guide describes how to deploy your **Simple Monitor App** without managing any servers or VPS. 
We will use **Render** for the Backend & Database, and **Vercel** for the Frontend.

## 1. Backend & Database (Render.com)
We use Render because it offers a "Free" PostgreSQL database and easy Node.js hosting.

### Step 1: Create the Database
1.  Sign up at [render.com](https://render.com).
2.  Click **New +** -> **PostgreSQL**.
3.  **Name**: `simpleapp-db`.
4.  **Database**: `simpleapp`.
5.  **User**: `user`.
6.  **Region**: `Frankfurt` (or closest to you).
7.  **Plan**: **Free**.
8.  Click **Create Database**.
9.  **IMPORTANT:** Copy the **"Internal DB URL"** (starting with `postgres://`) - we will need this for the backend.

### Step 2: Deploy the Backend
1.  On your Render Dashboard, click **New +** -> **Web Service**.
2.  Connect your GitHub repository.
3.  **Name**: `simpleapp-api`.
4.  **Root Directory**: `backend` (Important! Do not leave empty).
5.  **Runtime**: `Node`.
6.  **Build Command**: `npm install`.
7.  **Start Command**: `npm start`.
8.  **Instance Type**: Free (or Starter for better reliability).
9.  **Environment Variables** (Click "Add Environment Variable"):
    *   `DATABASE_URL`: (Paste the "Internal DB URL" from Step 1)
    *   `JWT_SECRET`: (Generate a random secure string)
    *   `CHAPA_SECRET_KEY`: (Your Chapa key for payments)
    *   `RESEND_API_KEY`: (Your Resend key for emails)
    *   `ALERT_EMAIL`: (Your email address)
    *   `ENABLE_WORKER`: `true` (This is CRITICAL - it runs the monitoring worker inside the web server so you don't need to pay for a second service).
    *   `ENABLE_CHECK_ENDPOINT`: `true`
    *   `FRONTEND_URL`: (You will update this later after deploying frontend)
10. Click **Create Web Service**.
11. Wait for it to deploy. Once live, copy the **Service URL** (e.g., `https://simpleapp-api.onrender.com`).

---

## 2. Frontend (Vercel)
Vercel is the best host for React/Vite apps.

1.  Sign up at [vercel.com](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Framework Preset**: It should auto-detect `Vite`.
5.  **Root Directory**: Click "Edit" and select `frontend`.
6.  **Environment Variables**:
    *   `VITE_API_URL`: (Paste your Render Backend URL from above, e.g., `https://simpleapp-api.onrender.com`)
    *   *(Note: Do not add a trailing slash /)*
7.  Click **Deploy**.

## 3. Final Connection
1.  Go back to your **Render Backend** Dashboard -> Environment.
2.  Add/Update the `FRONTEND_URL` variable:
    *   `FRONTEND_URL`: (Paste your new Vercel Frontend URL, e.g., `https://simpleapp.vercel.app`).
3.  **Redeploy** the Backend (Manual Deploy -> Clear Cache & Deploy) to apply the change.

## 🎉 Done!
Your app is now live.
- **Frontend**: `https://simpleapp.vercel.app`
- **Backend**: `https://simpleapp-api.onrender.com`
