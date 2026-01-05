# Extra Muros - Production Deployment Guide

This guide covers deploying the Extra Muros application to production using Vercel.

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Database schema is finalized
- [ ] All environment variables documented
- [ ] Security review completed
- [ ] Performance optimization done
- [ ] Error handling implemented
- [ ] Monitoring setup planned

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│              Vercel Platform                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────────────┐│
│  │  Student PWA │  │   Admin Website      ││
│  │              │  │                      ││
│  │  app.domain  │  │  admin.domain        ││
│  └──────────────┘  └──────────────────────┘│
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │         API Server                   │  │
│  │         /api/*                       │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
         │                │
         ▼                ▼
   ┌──────────┐     ┌──────────┐
   │  Turso   │     │  Vercel  │
   │ Database │     │   Blob   │
   └──────────┘     └──────────┘
```

## Step 1: Prepare Production Environment

### 1.1 Create Production Turso Database
```bash
turso db create extra-muros-prod --location ams
```

### 1.2 Run Production Migrations
```bash
# Connect to prod database
export TURSO_DATABASE_URL=$(turso db show extra-muros-prod --url)
export TURSO_AUTH_TOKEN=$(turso db tokens create extra-muros-prod)

# Run setup
npm run db:setup

# Create admin user (don't seed demo users in production)
node -e "
import bcrypt from 'bcrypt';
import { createUser } from './server/models/db.js';
const hash = await bcrypt.hash('YourSecurePassword123!', 10);
await createUser('admin@yourschool.be', hash, 'admin', 'Admin', 'User');
console.log('✅ Production admin created');
"
```

## Step 2: Configure Vercel Project

### 2.1 Install Vercel CLI
```bash
npm i -g vercel
```

### 2.2 Login and Link Project
```bash
vercel login
vercel link
```

### 2.3 Set Environment Variables
```bash
# Database
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production

# Storage
vercel env add BLOB_READ_WRITE_TOKEN production

# Security
vercel env add JWT_SECRET production
vercel env add JWT_EXPIRES_IN production

# Server
vercel env add NODE_ENV production
vercel env add PORT production

# CORS
vercel env add CORS_ORIGINS production
```

Or use Vercel Dashboard:
1. Go to project settings
2. Navigate to Environment Variables
3. Add all variables with "Production" scope

### 2.4 Environment Variable Values

```env
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://app.yourschool.be,https://admin.yourschool.be

# Turso Production
TURSO_DATABASE_URL=libsql://extra-muros-prod-yourorg.turso.io
TURSO_AUTH_TOKEN=your-production-token

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_PRODUCTION_TOKEN

# JWT - Generate new secure secret!
JWT_SECRET=your-production-jwt-secret-min-64-chars-very-secure
JWT_EXPIRES_IN=7d
```

## Step 3: Configure Custom Domains

### 3.1 Add Domains to Vercel
```bash
vercel domains add app.yourschool.be
vercel domains add admin.yourschool.be
```

### 3.2 Configure DNS
Add these records to your DNS:

```
Type   Name    Value
────────────────────────────────────────
CNAME  app     cname.vercel-dns.com
CNAME  admin   cname.vercel-dns.com
```

### 3.3 Update vercel.json for Domains
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/admin",
      "dest": "admin/index.html",
      "headers": {
        "cache-control": "public, max-age=0, must-revalidate"
      }
    },
    {
      "src": "/admin/(.*)",
      "dest": "admin/$1"
    },
    {
      "src": "/(.*)",
      "dest": "student/$1",
      "headers": {
        "cache-control": "public, max-age=0, must-revalidate"
      }
    }
  ]
}
```

## Step 4: Deploy

### 4.1 Deploy to Production
```bash
vercel --prod
```

### 4.2 Verify Deployment
```bash
# Test API health
curl https://app.yourschool.be/api/health

# Test login
curl -X POST https://app.yourschool.be/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourschool.be","password":"YourPassword"}'
```

## Step 5: Post-Deployment

### 5.1 Test All Endpoints
- [ ] Authentication works
- [ ] File uploads work
- [ ] Database queries work
- [ ] Manifest generation works
- [ ] PWA installs properly
- [ ] Offline mode works

### 5.2 Performance Checks
```bash
# Check load times
curl -w "@curl-format.txt" -o /dev/null -s https://app.yourschool.be

# Test under load
ab -n 1000 -c 10 https://app.yourschool.be/api/health
```

### 5.3 Security Hardening

1. **Enable HTTPS Only**
   - Vercel handles this automatically
   - Ensure all links use https://

2. **Set Security Headers**
   Add to `vercel.json`:
   ```json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           },
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "X-XSS-Protection",
             "value": "1; mode=block"
           }
         ]
       }
     ]
   }
   ```

3. **Rate Limiting**
   Implement rate limiting for API endpoints (consider Vercel Edge Config)

4. **CORS Configuration**
   Only allow your production domains

### 5.4 Monitoring Setup

1. **Vercel Analytics**
   ```bash
   npm i @vercel/analytics
   ```
   Add to both apps:
   ```javascript
   import { Analytics } from '@vercel/analytics/react';
   <Analytics />
   ```

2. **Error Tracking**
   Consider adding Sentry or similar:
   ```bash
   npm i @sentry/react
   ```

3. **Uptime Monitoring**
   Use services like:
   - Vercel monitoring (built-in)
   - UptimeRobot
   - Pingdom

## Step 6: Database Backups

### 6.1 Automated Turso Backups
Turso provides automatic backups, but you can also:

```bash
# Manual backup
turso db shell extra-muros-prod ".backup backup-$(date +%Y%m%d).db"

# Restore from backup
turso db shell extra-muros-prod ".restore backup-20250105.db"
```

### 6.2 Backup Schedule
Set up a cron job or GitHub Action for regular backups:

```yaml
# .github/workflows/backup.yml
name: Database Backup
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Backup Database
        run: |
          curl -sSfL https://get.tur.so/install.sh | bash
          turso db shell extra-muros-prod ".backup backup-$(date +%Y%m%d).db"
```

## Rollback Procedure

If something goes wrong:

### Option 1: Revert to Previous Deployment
```bash
vercel rollback
```

### Option 2: Rollback Database
```bash
turso db shell extra-muros-prod ".restore backup-YYYYMMDD.db"
```

## Scaling Considerations

### Database Scaling
- Turso automatically scales reads
- Monitor query performance
- Add indexes as needed
- Consider database replicas for geo-distribution

### Storage Scaling
- Vercel Blob automatically scales
- Monitor storage usage in Vercel dashboard
- Set up alerts for quota limits

### API Scaling
- Vercel automatically scales serverless functions
- Monitor function execution time
- Optimize slow endpoints
- Consider caching for frequently accessed data

## Maintenance Windows

For major updates:

1. **Announce maintenance window** to users
2. **Enable maintenance mode** (serve static page)
3. **Deploy updates**
4. **Run migrations**
5. **Test thoroughly**
6. **Disable maintenance mode**

## Support & Troubleshooting

### Common Production Issues

**Issue: 502 Bad Gateway**
- Check server logs: `vercel logs`
- Verify environment variables
- Check database connection

**Issue: Files not uploading**
- Verify `BLOB_READ_WRITE_TOKEN`
- Check storage quota
- Review file size limits

**Issue: Authentication failures**
- Verify `JWT_SECRET` is set
- Check cookie settings (secure, sameSite)
- Verify CORS configuration

### Getting Help
- Vercel Support: support@vercel.com
- Turso Discord: https://discord.gg/turso
- Project documentation: Check this repository

## Cost Estimation

### Vercel
- **Hobby Plan**: Free for small projects
- **Pro Plan**: $20/month (recommended for production)
- **Enterprise**: Custom pricing

### Turso
- **Starter**: Free (500MB storage, 1B reads/month)
- **Scaler**: $29/month
- **Enterprise**: Custom pricing

### Vercel Blob
- Included in Vercel plan
- Additional costs for high usage

**Estimated Total**: $20-50/month for a school with ~500 students

## Checklist

Before going live:

- [ ] Production database created and initialized
- [ ] All environment variables set
- [ ] Custom domains configured
- [ ] SSL certificates active
- [ ] Security headers configured
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Error tracking setup
- [ ] Performance tested
- [ ] Documentation complete
- [ ] Team trained on system
- [ ] Support procedures documented

## Launch Day

1. ✅ Final smoke tests
2. ✅ Verify all integrations
3. ✅ Send launch announcement
4. ✅ Monitor logs closely
5. ✅ Be ready for support requests
6. ✅ Collect user feedback

Congratulations on deploying Extra Muros! 🚀
