# ☁️ How to Host the Backend (So it works everywhere)

To make the AI work *without* your computer, you must host the **Backend** on a cloud server. Vercel cannot host the backend because the AI model is too large.

We recommend **Render.com** (it has a free tier) or **Railway.app**.

## Step 1: Push Changes
Ensure you have pushed the new `Dockerfile` to GitHub.

## Step 2: Deploy to Render
1.  Sign up at [render.com](https://render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Select the **backend** directory as the Root Directory (if asked, or just ensuring it builds from there).
    *   **Root Directory**: `backend`
    *   **Runtime**: Docker
5.  Render will auto-detect the `Dockerfile` in the backend folder.
6.  Click **Create Web Service**.

## Step 3: Connect Frontend to Backend
Once Render finishes deploying (it takes a few minutes), it will give you a URL like:
`https://audioscript-backend.onrender.com`

1.  Go to **Vercel**.
2.  Go to **Settings** -> **Environment Variables**.
3.  Update `VITE_API_URL` to your new Render URL:
    *   `https://audioscript-backend.onrender.com`
4.  **Redeploy** Vercel.

**Done!** Now your website works on any device, 24/7, without your computer being on.
