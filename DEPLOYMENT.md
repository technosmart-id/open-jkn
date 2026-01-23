# Deployment Guide - open-jkn

This guide covers deploying the open-jkn application to production using Docker and Dokploy.

## Prerequisites

- Git repository with the application code
- Dokploy instance (self-hosted or managed)
- PostgreSQL database (managed or self-hosted)
- Domain name configured (e.g., open-jkn.technosmart.id)

## Quick Start

### 1. Local Testing with Docker

Before deploying to production, test the Docker build locally:

```bash
# Build the Docker image
docker build -t open-jkn .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop the services
docker-compose down
```

### 2. Generate Production Secrets

Generate a secure secret for Better Auth:

```bash
openssl rand -base64 32
```

Keep this secret safe - you'll need it for production environment variables.

### 3. Prepare Database

Choose one of the following options:

#### Option A: Managed PostgreSQL (Recommended)
- Create an account with [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app)
- Create a new database
- Copy the connection string

#### Option B: Self-hosted on Dokploy
1. Deploy PostgreSQL as a separate service in Dokploy
2. Configure persistent volume for data
3. Set strong password for postgres user

#### Option C: External Server
- Use existing PostgreSQL instance
- Ensure it's accessible from Dokploy containers
- Configure firewall rules if needed

## Dokploy Deployment

### Step 1: Create Project in Dokploy

1. Login to Dokploy at `http://194.31.53.215:3000`
2. Navigate to **Organization: UGM**
3. Click **Create New Project**
4. Select **Git** deployment type
5. Connect your Git repository (Dokploy-2026-01-23-gc931k)

### Step 2: Configure Build Settings

Dokploy should auto-detect the Dockerfile. If not, configure manually:

- **Build Type**: Docker
- **Dockerfile Path**: `./Dockerfile`
- **Context Path**: `/`

Or use build commands:
- **Build Command**: `bun run build`
- **Start Command**: `node server.js`
- **Base Image**: `oven/bun:1`

### Step 3: Set Environment Variables

Add these environment variables in Dokploy:

```bash
# Required - Database
DATABASE_URL=postgresql://postgres:your-password@postgres-service:5432/openjkn

# Required - Authentication
BETTER_AUTH_URL=https://open-jkn.technosmart.id
BETTER_AUTH_SECRET=<your-generated-secret>
NEXT_PUBLIC_BETTER_AUTH_URL=https://open-jkn.technosmart.id
NEXT_PUBLIC_APP_URL=https://open-jkn.technosmart.id

# Optional - Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional - Email Service
RESEND_API_KEY=re-your-api-key-here
```

### Step 4: Configure Persistent Volumes

Create a volume for uploaded files:

- **Path**: `/app/uploads`
- **Type**: Persistent Volume
- **Size**: At least 1GB (depending on expected file uploads)

### Step 5: Configure Domain

1. In Dokploy, go to **Domains** section
2. Add custom domain: `open-jkn.technosmart.id`
3. Enable SSL (Let's Encrypt)
4. Enable HTTPS redirect

### Step 6: Deploy

1. Click **Deploy** in Dokploy
2. Monitor the build logs
3. Database migrations will run automatically via the entrypoint script
4. Application will start on port 3000

## Post-Deployment

### Verify Deployment

1. **Check application** is accessible at `https://open-jkn.technosmart.id`
2. **Test authentication** by logging in
3. **Verify dashboard** loads with data
4. **Test file upload** in `/pendaftaran/baru`
5. **Check database** records are being created

### Monitor Logs

```bash
# In Dokploy dashboard, view real-time logs
# Or SSH into the server and check Docker logs:
docker logs -f <container-name>
```

### Database Backups

For self-hosted PostgreSQL, set up automated backups:

```bash
# Add to cron (daily at 2 AM)
0 2 * * * pg_dump -U postgres openjkn | gzip > /backups/openjkn_$(date +\%Y\%m\%d).sql.gz
```

For managed databases, use their backup features.

## Troubleshooting

### Build Fails

**Problem**: Docker build fails with errors

**Solutions**:
- Check Dockerfile syntax
- Verify standalone output is enabled in `next.config.ts`
- Ensure all dependencies are in `package.json`
- Check build logs in Dokploy for specific errors

### Database Connection Errors

**Problem**: Application can't connect to database

**Solutions**:
- Verify DATABASE_URL format: `postgresql://user:password@host:port/database`
- Check database is running and accessible
- Ensure firewall allows connections from Dokploy
- Test connection manually:
  ```bash
  psql "$DATABASE_URL"
  ```

### Migration Failures

**Problem**: Database migrations fail on startup

**Solutions**:
- Check migration files in `lib/db/migrations/`
- Verify database user has CREATE TABLE permissions
- Try running migrations manually:
  ```bash
  docker exec -it <container-name> bun run db:migrate
  ```
- Or use push as fallback:
  ```bash
  docker exec -it <container-name> bun run db:push
  ```

### File Upload Issues

**Problem**: Uploaded files not persisting

**Solutions**:
- Verify `/app/uploads` volume is mounted
- Check volume has write permissions
- Ensure sufficient disk space
- Check container logs for upload errors

### Application Not Starting

**Problem**: Container exits immediately

**Solutions**:
- Check all required environment variables are set
- Verify port 3000 is not in use
- Check logs: `docker logs <container-name>`
- Ensure database migrations completed

### SSL Certificate Issues

**Problem**: HTTPS not working

**Solutions**:
- Verify domain DNS is pointing to correct IP
- Check port 80 and 443 are accessible
- Re-request SSL certificate in Dokploy
- Wait a few minutes for DNS propagation

## Maintenance

### Update Application

1. Push changes to Git repository
2. Dokploy will auto-deploy on push (if configured)
3. Or manually trigger deployment in Dokploy dashboard

### Database Migrations

When schema changes are made:

1. Migration files are generated by developers
2. On deployment, entrypoint script runs migrations automatically
3. If manual migration is needed:
   ```bash
   docker exec -it <container-name> bun run db:migrate
   ```

### Backup & Restore

**Backup**:
```bash
# Database
pg_dump "$DATABASE_URL" > backup.sql

# Uploads
tar -czf uploads-backup.tar.gz /app/uploads
```

**Restore**:
```bash
# Database
pssql "$DATABASE_URL" < backup.sql

# Uploads
tar -xzf uploads-backup.tar.gz -C /app/
```

## Security Checklist

- [ ] Strong BETTER_AUTH_SECRET (32+ characters)
- [ ] Database password is strong
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Firewall rules configured
- [ ] Database not accessible from public internet
- [ ] Regular backups configured
- [ ] Error logging enabled
- [ ] Unused ports closed
- [ ] Environment variables not committed to Git

## Performance Optimization

1. **Enable caching** in Dokploy for faster builds
2. **Configure CDN** for static assets
3. **Optimize database** with proper indexes
4. **Monitor resources** (CPU, memory, disk)
5. **Set up monitoring** (e.g., Sentry, UptimeRobot)

## Support

For issues specific to:
- **Dokploy**: Check [Dokploy Documentation](https://dokploy.com/docs)
- **Next.js**: Check [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- **Docker**: Check [Docker Documentation](https://docs.docker.com/)

## Additional Resources

- [Next.js Docker Example](https://github.com/vercel/next.js/tree/canary/examples/with-docker)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
