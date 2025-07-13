# Step-by-Step Deployment Commands for landing.ayand.cloud

Copy and paste these commands in order on your Ubuntu server:

## Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3 python3-pip python3-venv nginx git curl ufw

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Setup firewall
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

## Step 2: Upload and Setup Your Application

```bash
# Create project directory
mkdir -p ~/livekit-isaria
cd ~/livekit-isaria

# Upload your files here (via SCP, SFTP, or git clone)
# If using git:
# git clone https://github.com/yourusername/your-repo.git .

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install flask python-dotenv livekit requests

# Create logs directory
mkdir -p logs
```

## Step 3: Create Production Environment File

```bash
# Create .env.production file
cat > .env.production << 'EOF'
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your-super-secret-production-key-here-change-this

LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_URL=wss://your-livekit-server.com

OPENROUTER_API_KEY=your-openrouter-api-key

HOST=0.0.0.0
PORT=5000
EOF

# Edit the file to add your real API keys
nano .env.production
```

## Step 4: Create PM2 Configuration

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'livekit-isaria',
    script: 'venv/bin/python',
    args: 'app.py',
    cwd: '/home/ubuntu/livekit-isaria',
    instances: 1,
    exec_mode: 'fork',
    env_file: '.env.production',
    env: {
      NODE_ENV: 'production',
      FLASK_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    autorestart: true
  }]
}
EOF

# If you're using a different user than 'ubuntu', replace it in the cwd path above
```

## Step 5: Configure Nginx

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/livekit-isaria << 'EOF'
server {
    listen 80;
    server_name landing.ayand.cloud;

    # Real IP from Cloudflare
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    real_ip_header CF-Connecting-IP;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Static files with caching
    location /static/ {
        alias /home/ubuntu/livekit-isaria/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main application
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support for LiveKit
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/livekit-isaria /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 6: Start Application with PM2

```bash
# Make sure you're in the project directory
cd ~/livekit-isaria

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Copy and run the command that pm2 startup outputs
```

## Step 7: Configure Cloudflare

**In your Cloudflare dashboard for ayand.cloud:**

1. **DNS Settings:**
   - Add A record: `landing` → `YOUR_SERVER_IP` (Proxied ☁️ ON)

2. **SSL/TLS Settings:**
   - SSL/TLS encryption mode: **Full**
   - Always Use HTTPS: **On**

## Step 8: Test Your Deployment

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs livekit-isaria --lines 20

# Test local connection
curl -I http://localhost:5000

# Check Nginx status
sudo systemctl status nginx

# Check if everything is working
curl -I http://landing.ayand.cloud
```

## Step 9: Create Deployment Script for Future Updates

```bash
# Create deployment script
cat > ~/deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying LiveKit Isaria Application..."

cd ~/livekit-isaria

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    git pull origin main
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
pip install -r requirements.txt 2>/dev/null || echo "No requirements.txt found"

# Restart PM2 application
pm2 restart livekit-isaria

# Show status
pm2 status

echo "✅ Deployment complete!"
echo "🌐 Your application is available at: https://landing.ayand.cloud"
EOF

# Make script executable
chmod +x ~/deploy.sh
```

## Quick Commands for Management

```bash
# View application status
pm2 status

# View real-time logs
pm2 logs livekit-isaria

# Restart application
pm2 restart livekit-isaria

# Monitor resources
pm2 monit

# Deploy updates (after making changes)
~/deploy.sh

# Check Nginx logs if needed
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting Commands

```bash
# If application won't start
pm2 logs livekit-isaria --lines 50

# Test Python app directly
cd ~/livekit-isaria
source venv/bin/activate
python app.py

# Check if port 5000 is in use
sudo netstat -tlnp | grep :5000

# Restart Nginx if needed
sudo systemctl restart nginx

# Test Nginx configuration
sudo nginx -t
```

---

## Important Notes:

1. **Replace placeholder values** in `.env.production` with your actual API keys
2. **Update the user path** in Nginx and PM2 configs if you're not using the `ubuntu` user
3. **Make sure your server IP** is correctly pointed to in Cloudflare DNS
4. **Test each step** before proceeding to the next

After completing these steps, your application will be live at `https://landing.ayand.cloud`! 🎉