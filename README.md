# SimpleApp Monitor - Owner's Manual

Welcome to **SimpleApp Monitor**, your professional Uptime Monitoring SaaS. 
This guide assumes **zero coding knowledge**. Follow these steps to get your business running on your computer.

## 1. Installation (One-Time Setup)

You need two pieces of software to run this "Factory":

1.  **Docker Desktop** (The Engine)
    *   Download & Install: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
    *   *Note: Open it after installation to ensure it's running.*
2.  **VS Code** (The Dashboard)
    *   Download & Install: [https://code.visualstudio.com/](https://code.visualstudio.com/)

## 2. The "Keys" (Configuration)

The app needs passwords to send emails and process payments. We store these in a secure file called `.env`.

1.  Open this project folder in **VS Code**.
2.  Look for the folder named `backend`.
3.  Inside `backend`, create a new file named `.env`.
4.  Copy and paste the text below into that file:

```ini
# --- Server Config ---
PORT=5000
NODE_ENV=development

# --- Database (Don't change this) ---
DATABASE_URL=postgres://user:password@db:5432/simpleapp

# --- Security ---
JWT_SECRET=my-super-secret-password-123

# --- Email (Resend.com) ---
# Sign up at resend.com to get a free API Key
RESEND_API_KEY=re_123456789
# The email where alerts go (for testing)
ALERT_EMAIL=your-email@gmail.com

# --- Payments (Chapa) ---
# Sign up at chapa.co for a test key
CHAPA_SECRET_KEY=CHASECK_TEST-xxxxxxxxxxxx

# --- System Links (Don't change this) ---
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:80
ENABLE_CHECK_ENDPOINT=true
```

## 3. Launching the App

1.  Open **Docker Desktop** and make sure it says "Engine Running" (bottom left).
2.  In **VS Code**, open the "Terminal" (Click `Terminal` > `New Terminal` at the top).
3.  Type this **exact command** and hit Enter:

```bash
docker-compose up --build
```

**What will happen?**
*   You will see a lot of text scrolling. This is the factory building itself.
*   Wait until you see: `Server is running on port 5000` and `Worker is now running`.

## 4. Using Your Product

*   **The Website:** Open your browser and go to `http://localhost`.
    *   *This is what your customers verify.*
*   **The Admin/API:** Running at `http://localhost:5000`.

### How to Test It:
1.  **Register:** Go to `http://localhost`, click "Register". Use a real email if you set up Resend, or check the terminal logs for the "Verification Link".
2.  **Add a Website:** Log in, type `https://google.com`, and click "Add".
3.  **Watch it Work:** The dashboard will show "UP".
4.  **Status Page:** Look for "View Public Status Page" on your dashboard. This is the link you share with customers.

## 5. Stopping the App

To stop everything:
1.  Go to the Terminal where it's running.
2.  Press `Ctrl + C` on your keyboard.
3.  Type `docker-compose down` to clean up.

## 6. Going Live (Production Strategy)

Ready to make money? Follow this roadmap to put your app on the internet.

### Step 1: Buy "Land" (Server & Domain)
1.  **Server (VPS):** Buy a cheap Ubuntu server ($5/mo) from DigitalOcean, Hetzner, or Linode.
2.  **Domain:** Buy `your-app.com` from Namecheap or GoDaddy.
3.  **DNS:** Point your domain's `A Record` to your Server's IP Address.

### Step 2: Prepare the Server
Login to your server (via SSH) and run these commands once:
```bash
# Install Docker & Git
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt-get install -y git

# Clone your code
git clone https://github.com/YOUR_USERNAME/SimpleApp.git ~/simpleapp
```

### Step 3: Connect the Pipeline
Go to your GitHub Repository Settings > **Secrets and variables** > **Actions**.
Add these "Repository Secrets":
*   `VPS_HOST`: Your server's IP address (e.g., `123.45.67.89`).
*   `VPS_USER`: Usually `root`.
*   `VPS_SSH_KEY`: Your private SSH key (so GitHub can login).
*   `DOMAIN_NAME`: `your-app.com`.
*   `RESEND_API_KEY`: Your real email key.
*   `CHAPA_SECRET_KEY`: Your real payment key.
*   `JWT_SECRET`: A long random password.
*   `ALERT_EMAIL`: Your admin email.

### Step 4: Launch
Just **Push to Main**.
*   Github Actions will detect the change.
*   It will login to your server.
*   It will update the code, build the app, and restart it.
*   **Time to deployment:** ~2 minutes.

---
*Built by DeepSeek & Team*
