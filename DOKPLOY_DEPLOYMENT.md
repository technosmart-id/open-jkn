# Dokploy Deployment Guide for open-jkn

## Server Information
- **SSH**: `ssh root@194.31.53.215`
- **API Key**: `ZuJadiwtWndNJGEiLBeMoCNnVuveQtJZwcexkqvAAYppdmwvhIsGbLdaSDsLgjUv`
- **API Docs**: http://194.31.53.215:3000/api/settings.getOpenApiDocument
- **Organization**: UGM
- **Domain**: open-jkn.technosmart.id
- **Git Repository**: https://github.com/ariefan/open-jkn.git (Dokploy-2026-01-23-gc931k)

---

## Step 1: Access Dokploy Dashboard

1. Open your browser and go to: **http://194.31.53.215:3000**
2. Login with your credentials
3. Navigate to **Organization: UGM**

---

## Step 2: Create PostgreSQL Database Service

Before deploying the application, you need to create a PostgreSQL database:

1. In Dokploy, click **"Create Service"** or **"New Application"**
2. Select **"PostgreSQL"** from the service templates
3. Configure the database:
   ```
   Name: openjkn-db
   User: openjkn
   Password: <generate-strong-password>
   Database: openjkn
   Port: 5432
   ```
4. Click **"Create"** or **"Deploy"**
5. Wait for PostgreSQL to start (usually 1-2 minutes)
6. Note the connection string from the service details

**Connection String Format:**
```
postgresql://openjkn:<password>@openjkn-db:5432/openjkn
```

---

## Step 3: Create Application Project

1. Click **"Create New Project"** or **"New Application"**
2. Select **"Git"** as deployment type
3. Configure Git settings:
   - **Repository**: Select `Dokploy-2026-01-23-gc931k` or enter URL: `https://github.com/ariefan/open-jkn.git`
   - **Branch**: `main`
   - **Build Type**: Docker
4. Click **"Continue"** or **"Create Project"**

---

## Step 4: Configure Build Arguments and Environment Variables

### Build Arguments (CRITICAL for Docker Compose deployments)

If you're using **Docker Compose** service type in Dokploy, you MUST configure build arguments. These are needed during the Docker build process:

```bash
DATABASE_URL=postgresql://openjkn:<password>@openjkn-db:5432/openjkn
BETTER_AUTH_URL=https://open-jkn.technosmart.id
BETTER_AUTH_SECRET=<generate-secret>
NEXT_PUBLIC_BETTER_AUTH_URL=https://open-jkn.technosmart.id
NEXT_PUBLIC_APP_URL=https://open-jkn.technosmart.id
RESEND_API_KEY=
```

**How to add build arguments in Dokploy:**
1. Go to your Docker Compose service settings
2. Look for **"Build Args"** or **"Build Arguments"** section
3. Add each variable from above as a build argument
4. Save the configuration

### Runtime Environment Variables

These should also be added as environment variables:

#### Required Variables
```bash
# Database (replace <password> with actual password)
DATABASE_URL=postgresql://openjkn:<password>@openjkn-db:5432/openjkn

# Better Auth
BETTER_AUTH_URL=https://open-jkn.technosmart.id
BETTER_AUTH_SECRET=<generate-secret>
NEXT_PUBLIC_BETTER_AUTH_URL=https://open-jkn.technosmart.id
NEXT_PUBLIC_APP_URL=https://open-jkn.technosmart.id
```

### Generate BETTER_AUTH_SECRET
Run this command locally to generate a secure secret:
```bash
openssl rand -base64 32
```

### Optional Variables
```bash
# Google OAuth (if you want to enable)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Email Service (Resend)
RESEND_API_KEY=re-your-api-key
```

---

## Step 5: Configure Persistent Volumes

Create a volume for uploaded files:

1. Go to **"Volumes"** or **"Storage"** section
2. Click **"Add Volume"**
3. Configure:
   - **Path**: `/app/uploads`
   - **Type**: Persistent Volume
   - **Size**: 1 GB (or more depending on expected uploads)
4. Click **"Create"**

---

## Step 6: Configure Domain

1. Go to **"Domains"** section
2. Click **"Add Domain"**
3. Configure:
   - **Domain**: `open-jkn.technosmart.id`
   - **Port**: `3000`
   - **Enable SSL**: ✅ (Let's Encrypt)
   - **HTTPS Redirect**: ✅
4. Click **"Save"** or **"Add Domain"**

**Important**: Ensure your domain DNS points to `194.31.53.215`:
```
A Record: open-jkn.technosmart.id → 194.31.53.215
```

---

## Step 7: Deploy Application

1. Click **"Deploy"** button in Dokploy
2. Monitor the build logs:
   - Dokploy will pull the Git repository
   - Build the Docker image
   - Run database migrations automatically
   - Start the application on port 3000

**Expected Build Time**: 5-10 minutes (first build takes longer)

---

## Step 8: Verify Deployment

After deployment completes:

1. **Check Application Status**: Should show "Running" or "Active"
2. **Visit Application**: https://open-jkn.technosmart.id
3. **Test Functionality**:
   - ✅ Homepage loads
   - ✅ Login works (create first user)
   - ✅ Dashboard loads
   - ✅ File uploads work

---

## Post-Deployment Checklist

### Initial Setup
1. **Create Admin User**:
   - Visit https://open-jkn.technosmart.id/auth/signup
   - Create the first user account
   - This user will have admin privileges

2. **Run Database Seeders** (optional, for testing):
   - Visit https://open-jkn.technosmart.id/pengaturan/seeders
   - Click "Jalankan Buat Semua Data" to create test data
   - This will populate the database with sample JKN data

3. **Test Key Features**:
   - Participant management (/peserta)
   - Registration workflow (/pendaftaran)
   - Data changes (/perubahan)
   - Payment tracking (/pembayaran)

### Monitoring
1. **View Logs**: In Dokploy dashboard, click "Logs" to see real-time application logs
2. **Resource Usage**: Monitor CPU, memory, and disk usage
3. **Database Backups**: Configure automated backups in PostgreSQL service settings

---

## Troubleshooting

### Application Won't Start
**Check Logs**: Look for error messages in Dokploy logs

**Common Issues**:
- Database connection failed → Verify DATABASE_URL is correct
- Port 3000 already in use → Check for conflicting services
- Migration failed → Database may not be ready, wait and retry

### Build Error: BETTER_AUTH_SECRET is not set

If you see this error during the Docker build:
```
Error: BETTER_AUTH_SECRET is not set. Please set it in your .env.local file.
Error: Failed to collect page data for /api/notifications
```

**Solution**: You need to configure **Build Arguments** in Dokploy:

1. Go to your Docker Compose service in Dokploy
2. Click on **Settings** or **Configuration**
3. Find the **"Build Args"** section
4. Add these build arguments:
   ```
   DATABASE_URL=postgresql://openjkn:<password>@openjkn-db:5432/openjkn
   BETTER_AUTH_URL=https://open-jkn.technosmart.id
   BETTER_AUTH_SECRET=<your-secret>
   NEXT_PUBLIC_BETTER_AUTH_URL=https://open-jkn.technosmart.id
   NEXT_PUBLIC_APP_URL=https://open-jkn.technosmart.id
   RESEND_API_KEY=
   ```
5. Save and redeploy

**Why is this needed?**
The Docker build process runs Next.js data collection, which requires these environment variables at build time, not just at runtime.

### Database Connection Issues
1. Verify PostgreSQL service is running
2. Check DATABASE_URL format
3. Ensure application and database are in the same network
4. Test connection manually from the container

### SSL Certificate Issues
1. Verify DNS points to correct IP (194.31.53.215)
2. Wait 5-10 minutes for DNS propagation
3. Check port 80 and 443 are accessible
4. Re-request SSL certificate in Dokploy

### File Upload Issues
1. Verify `/app/uploads` volume is mounted
2. Check volume has write permissions
3. Ensure sufficient disk space

---

## Maintenance

### Update Application
1. Push changes to Git repository
2. Dokploy will auto-deploy (if configured)
3. Or manually trigger deployment in Dokploy dashboard

### Database Backups
```bash
# SSH into server
ssh root@194.31.53.215

# Backup database
docker exec <postgres-container> pg_dump -U openjkn openjkn > backup.sql

# Restore database
docker exec -i <postgres-container> psql -U openjkn openjkn < backup.sql
```

### View Application Logs
```bash
# Via Dokploy dashboard: Logs section
# Or via SSH:
docker logs -f <app-container-name>
```

---

## Security Considerations

1. **Change Default Passwords**: Ensure PostgreSQL has a strong password
2. **Use HTTPS**: SSL should be enabled
3. **Firewall Rules**: Only expose ports 80, 443, and 3000 (if needed)
4. **Regular Backups**: Set up automated database backups
5. **Monitor Logs**: Check for suspicious activity
6. **Update Dependencies**: Keep dependencies updated

---

## API Access (Optional)

If you need to interact with Dokploy via API:

```bash
# Get OpenAPI documentation
curl -H "x-api-key: ZuJadiwtWndNJGEiLBeMoCNnVuveQtJZwcexkqvAAYppdmwvhIsGbLdaSDsLgjUv" \
  http://194.31.53.215:3000/api/settings.getOpenApiDocument

# Example: List applications
curl -H "x-api-key: ZuJadiwtWndNJGEiLBeMoCNnVuveQtJZwcexkqvAAYppdmwvhIsGbLdaSDsLgjUv" \
  http://194.31.53.215:3000/api/application.list
```

---

## Support

- **Dokploy Documentation**: https://dokploy.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Docker Documentation**: https://docs.docker.com/

---

## Quick Reference

**Application URL**: https://open-jkn.technosmart.id
**Dokploy Dashboard**: http://194.31.53.215:3000
**Organization**: UGM
**Repository**: https://github.com/ariefan/open-jkn.git

**Environment Variables Needed**:
- DATABASE_URL
- BETTER_AUTH_URL
- BETTER_AUTH_SECRET
- NEXT_PUBLIC_BETTER_AUTH_URL
- NEXT_PUBLIC_APP_URL

**Volumes**:
- /app/uploads (persistent)

**Domain**:
- open-jkn.technosmart.id (SSL enabled)
