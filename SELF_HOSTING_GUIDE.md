# 🏠 Emergency Supply Manager - Self-Hosting Guide

## 📋 **Prerequisites**

### **System Requirements:**
- **OS**: Linux (Ubuntu 20.04+ recommended), Windows Server, or macOS
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: 10GB+ free space
- **Network**: Internet connection for updates

### **Software Requirements:**
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: For cloning the repository

## 🚀 **Quick Start (Docker)**

### **1. Clone the Repository:**
```bash
git clone <your-repo-url>
cd emergency-supply-manager
```

### **2. Build and Start:**
```bash
# Build the application
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### **3. Access the Application:**
- **Local**: http://localhost:3000
- **Network**: http://your-server-ip:3000

## 🔧 **Advanced Configuration**

### **Environment Variables:**
Create a `.env` file:
```bash
# Application
NODE_ENV=production
PORT=3000

# Database (if using external database)
DATABASE_URL=postgresql://user:password@localhost:5432/emergency_supply

# Security
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
```

### **SSL/HTTPS Setup:**
1. **Obtain SSL certificates** (Let's Encrypt recommended)
2. **Place certificates** in `./ssl/` directory:
   - `cert.pem` - SSL certificate
   - `key.pem` - Private key
3. **Uncomment SSL lines** in `nginx.conf`

### **Domain Configuration:**
Update `nginx.conf`:
```nginx
server_name your-domain.com www.your-domain.com;
```

## 📊 **Monitoring & Maintenance**

### **Health Checks:**
```bash
# Check application health
curl http://localhost:3000

# Check Docker containers
docker-compose ps

# View application logs
docker-compose logs emergency-supply-manager
```

### **Backup Data:**
```bash
# Backup application data
docker-compose exec emergency-supply-manager tar -czf /app/data/backup-$(date +%Y%m%d).tar.gz /app/data

# Copy backup to host
docker cp emergency-supply-manager:/app/data/backup-$(date +%Y%m%d).tar.gz ./
```

### **Updates:**
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

## 🔒 **Security Configuration**

### **Firewall Setup (Ubuntu):**
```bash
# Install UFW
sudo apt install ufw

# Configure firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
```

### **Nginx Security:**
- **Rate limiting**: Configured in nginx.conf
- **Security headers**: X-Frame-Options, X-XSS-Protection, etc.
- **SSL/TLS**: HTTPS redirect and secure protocols

## 📱 **PWA Features**

### **Mobile Installation:**
- **Android**: Open in Chrome, tap "Add to Home Screen"
- **iOS**: Open in Safari, tap Share → "Add to Home Screen"
- **Offline Support**: Service worker enables offline functionality

### **PWA Configuration:**
- **Manifest**: `/public/manifest.json`
- **Service Worker**: `/public/sw.js`
- **Icons**: Place in `/public/icons/`

## 🐳 **Docker Commands**

### **Basic Operations:**
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f emergency-supply-manager

# Execute commands in container
docker-compose exec emergency-supply-manager sh
```

### **Maintenance:**
```bash
# Update images
docker-compose pull

# Rebuild containers
docker-compose up --build -d

# Clean up unused images
docker system prune -a
```

## 📈 **Performance Optimization**

### **Nginx Caching:**
- **Static assets**: 1 year cache
- **API responses**: No cache
- **Gzip compression**: Enabled

### **Application Optimization:**
- **Next.js optimization**: Automatic code splitting
- **Image optimization**: Next.js Image component
- **Bundle analysis**: `npm run analyze`

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **Port Already in Use:**
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

#### **Permission Issues:**
```bash
# Fix Docker permissions
sudo chown -R $USER:$USER .
```

#### **SSL Certificate Issues:**
```bash
# Check certificate validity
openssl x509 -in ssl/cert.pem -text -noout
```

### **Logs and Debugging:**
```bash
# Application logs
docker-compose logs emergency-supply-manager

# Nginx logs
docker-compose logs nginx

# System logs
journalctl -u docker
```

## 📞 **Support**

### **Documentation:**
- **Next.js**: https://nextjs.org/docs
- **Docker**: https://docs.docker.com/
- **Nginx**: https://nginx.org/en/docs/

### **Emergency Supply Manager Features:**
- **Daily Quotes**: Spiritual motivation system
- **Progress Tracking**: Comprehensive preparedness monitoring
- **Emergency Kit Check**: 25+ item checklist
- **Philippines Features**: Regional hazard awareness
- **PWA Support**: Mobile app-like experience

## 🎯 **Production Checklist**

### **Before Going Live:**
- [ ] SSL certificates configured
- [ ] Domain DNS pointing to server
- [ ] Firewall configured
- [ ] Backup strategy implemented
- [ ] Monitoring setup
- [ ] Security headers configured
- [ ] Performance optimization applied

### **Post-Deployment:**
- [ ] Test all features
- [ ] Verify PWA installation
- [ ] Check mobile responsiveness
- [ ] Monitor logs for errors
- [ ] Set up automated backups

**Your Emergency Supply Manager is now ready for self-hosted deployment!** 🚀✨
