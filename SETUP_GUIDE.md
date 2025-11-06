# lofiles-dashboard OAuth Setup Guide

This guide will walk you through setting up the lofiles-dashboard with GitHub OAuth authentication.

## Prerequisites

- Node.js 18+ and npm
- GitHub account
- (Optional) Docker for containerized deployment

## Part 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"** button
4. Fill in the application details:

   **For Local Development:**
   - Application name: `lofiles-dashboard-dev`
   - Homepage URL: `http://localhost:3001`
   - Authorization callback URL: `http://localhost:3001/auth/callback`

   **For Production:**
   - Application name: `lofiles-dashboard`
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL: `https://yourdomain.com/auth/callback`

5. Click **"Register application"**
6. On the next screen:
   - Copy the **Client ID**
   - Click **"Generate a new client secret"**
   - Copy the **Client Secret** (you won't be able to see it again!)

## Part 2: Local Development Setup

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd lofiles-dashboard

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Edit the `.env` file with your OAuth credentials:

```bash
# GitHub OAuth App Configuration
GITHUB_CLIENT_ID=your_client_id_from_step_1
GITHUB_CLIENT_SECRET=your_client_secret_from_step_1

# Generate a secure session secret (run this command to generate one):
# openssl rand -hex 32
SESSION_SECRET=paste_generated_secret_here

# Backend Configuration
PORT=3001
FRONTEND_URL=http://localhost:3001

# Frontend Configuration (for API calls)
REACT_APP_BACKEND_URL=http://localhost:3001

NODE_ENV=development
```

### Step 3: Run the Application

**Option A: Development Mode (Recommended for development)**

Terminal 1 - Start the backend:
```bash
cd server
npm run dev
```

Terminal 2 - Start the frontend:
```bash
npm start
```

The frontend will run on `http://localhost:3000` and proxy API calls to the backend on port 3001.

**Option B: Production Mode (Testing production build)**

```bash
# Build frontend
npm run build

# Build backend
cd server
npm run build
cd ..

# Start backend (which also serves the frontend)
cd server
npm start
```

Access the app at `http://localhost:3001`

### Step 4: Test OAuth Flow

1. Open your browser to `http://localhost:3000` (dev mode) or `http://localhost:3001` (production mode)
2. Click **"Sign in with GitHub"**
3. You'll be redirected to GitHub
4. Authorize the application
5. You'll be redirected back to the dashboard, logged in!

## Part 3: Docker Deployment

### Step 1: Prepare Environment

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your production values:

```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
SESSION_SECRET=$(openssl rand -hex 32)
FRONTEND_URL=http://localhost:3001  # Or your production domain
PORT=3001
NODE_ENV=production
```

### Step 2: Build and Run

```bash
# Build and start the container
docker compose up -d --build

# View logs
docker compose logs -f

# Access the app at http://localhost:3001
```

### Step 3: Custom Port

```bash
# Run on a different port (e.g., 4000)
APP_PORT=4000 docker compose up -d --build

# Access at http://localhost:4000
```

## Part 4: Production Deployment (Self-Hosted)

### Requirements

- Linux server (Ubuntu/Debian recommended)
- Domain name pointing to your server
- Reverse proxy (Nginx/Caddy)
- SSL certificate (Let's Encrypt)

### Step 1: Server Setup

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin

# Clone the repository
git clone <repository-url>
cd lofiles-dashboard
```

### Step 2: Configure for Production

Create a production GitHub OAuth App:
- Homepage URL: `https://yourdomain.com`
- Callback URL: `https://yourdomain.com/auth/callback`

Edit `.env`:
```bash
GITHUB_CLIENT_ID=your_production_client_id
GITHUB_CLIENT_SECRET=your_production_client_secret
SESSION_SECRET=$(openssl rand -hex 32)
FRONTEND_URL=https://yourdomain.com
PORT=3001
NODE_ENV=production
```

### Step 3: Reverse Proxy Configuration

**Example Nginx configuration** (`/etc/nginx/sites-available/lofiles`):

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL configuration (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Docker container
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/lofiles /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

### Step 5: Start the Application

```bash
docker compose up -d --build

# Check logs
docker compose logs -f
```

### Step 6: Auto-restart on Reboot

Create a systemd service (`/etc/systemd/system/lofiles.service`):

```ini
[Unit]
Description=Lofiles Dashboard
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/lofiles-dashboard
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable lofiles
sudo systemctl start lofiles
```

## Troubleshooting

### OAuth Redirect Issues

**Error**: "The redirect_uri MUST match the registered callback URL"

**Solution**: Ensure your GitHub OAuth App callback URL exactly matches:
- Local: `http://localhost:3001/auth/callback`
- Production: `https://yourdomain.com/auth/callback`

### Session Issues

**Error**: Session expires immediately

**Solutions**:
1. Check that `SESSION_SECRET` is at least 32 characters
2. For HTTPS deployments, ensure `NODE_ENV=production`
3. Verify cookies are enabled in your browser

### CORS Errors

**Error**: "Access to fetch... has been blocked by CORS policy"

**Solution**: Ensure `FRONTEND_URL` in `.env` matches the URL you're accessing:
- Dev (separate servers): `FRONTEND_URL=http://localhost:3000`
- Production: `FRONTEND_URL=https://yourdomain.com`

### Backend Won't Start

**Error**: "GITHUB_CLIENT_ID is required"

**Solution**: The `.env` file must be in the **root directory**, not in the `server/` directory.

## Security Checklist

- [ ] Use HTTPS in production (get free SSL from Let's Encrypt)
- [ ] Generate a strong `SESSION_SECRET` (minimum 32 characters)
- [ ] Never commit `.env` file to git
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Use firewall to restrict server access if single-user
- [ ] Regularly rotate your GitHub OAuth credentials
- [ ] Monitor server logs for suspicious activity

## Getting Help

- Check the [README.md](README.md) for general information
- Review the [CLAUDE.md](CLAUDE.md) for technical architecture
- Search existing GitHub issues
- Create a new issue with:
  - Your setup (Docker/local/production)
  - Error messages
  - Steps to reproduce

## Next Steps

Once you're logged in:
1. Explore the **Triage Widget** to see PRs needing your review
2. Check the **In-Flight Widget** for your open PRs
3. Use the **Focus Widget** to pin important items
4. The dashboard auto-refreshes every 5 minutes

Enjoy your distraction-free GitHub workflow! 🎯
