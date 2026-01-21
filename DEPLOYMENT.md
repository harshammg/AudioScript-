# ☁️ Deployment Guide: Hybrid Architecture

AudioScript uses a **Hybrid Architecture**:
- **Frontend**: Runs in the Cloud (Vercel).
- **Backend**: Runs Locally (Your Computer) for privacy and speed.

This creates a security challenge called **Mixed Content**.
*   Vercel is **Secure** (HTTPS).
*   Localhost is **Insecure** (HTTP).
*   Browsers block Vercel from talking to Localhost.

## 🟢 Solution 1: Use Localhost (Recommended)

The easiest way to use the app is to open the Frontend on your computer, not Vercel.

1.  Ensure your backend is running (`uvicorn main:socket_app ...`).
2.  Ensure your frontend is running (`npm run dev`).
3.  Open **[http://localhost:5173](http://localhost:5173)** in Chrome/Edge.
4.  It works perfectly!

---

## 🟠 Solution 2: Connect Vercel to Localhost

If you *must* use the Vercel link, you need to turn your local backend into a secure public link. We use a tool called **ngrok** for this.

### Step 1: Install ngrok
1.  Go to [ngrok.com](https://ngrok.com) and sign up (it's free).
2.  Download and install ngrok.

### Step 2: Start the Tunnel
In a new terminal on your computer, run:

```bash
ngrok http 8001
```

It will show a URL like: `https://abcd-123-456.ngrok-free.app`

### Step 3: Configure Vercel
1.  Copy that HTTPS URL.
2.  Go to your **Vercel Project Dashboard**.
3.  Click **Settings** -> **Environment Variables**.
4.  Add a new variable:
    *   **Key**: `VITE_API_URL`
    *   **Value**: `https://abcd-123-456.ngrok-free.app` (Your ngrok URL)
5.  **Save**.
6.  **Redeploy** your project (Deployment -> Redeploy).

Now the Vercel site can talk to your computer securely! "Error Cleared".

---

## 📱 Sharing with Others (Other Devices)

If you want **other people** (or your phone) to use the Vercel link:

1.  **Your Computer Must Be On**: The website uses *your* computer's brain (backend) to process audio. If you turn off your computer or close the backend, the website stops working for everyone.
2.  **Ngrok Must Be Running**: The `ngrok` terminal window must stay open.
3.  **Same URL**: Once you set the `VITE_API_URL` in Vercel to your ngrok link, anyone in the world can open your Vercel website and it will connect to your computer to transcribe.

