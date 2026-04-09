# Stage 1: Dependencies
FROM oven/bun:1 AS base
WORKDIR /app

# Stage 2: Builder
FROM base AS builder
# Install git and python for AI features
RUN apt-get update && apt-get install -y git python3 python3-pip python3-venv && rm -rf /var/lib/apt/lists/*

# Build arguments for environment variables
ARG DATABASE_URL
ARG BETTER_AUTH_URL
ARG BETTER_AUTH_SECRET
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ARG NEXT_PUBLIC_APP_URL
ARG RESEND_API_KEY
ARG OPENIMIS_DATABASE_URL

# Set environment variables for build time
ENV DATABASE_URL=${DATABASE_URL}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV NEXT_PUBLIC_BETTER_AUTH_URL=${NEXT_PUBLIC_BETTER_AUTH_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV OPENIMIS_DATABASE_URL=${OPENIMIS_DATABASE_URL}

COPY package.json bun.lock ./
# Skip prepare scripts in Docker (git hooks not needed in production)
RUN bun install --ignore-scripts

COPY . .

# Generate drizzle.config.json for production (drizzle-kit can't use TypeScript config)
RUN node scripts/generate-drizzle-config.js

RUN bun run build

# Stage 3: Runner
FROM base AS runner
ENV NODE_ENV=production

# Install Python for AI features
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && rm -rf /var/lib/apt/lists/*

# Create non-root user with home directory
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs -m nextjs

# Set environment variables for Matplotlib and TensorFlow
ENV MPLCONFIGDIR=/tmp/matplotlib-cache
ENV TF_ENABLE_ONEDNN_OPTS=0
ENV CUDA_VISIBLE_DEVICES=-1

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy node_modules and drizzle config for migrations
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.json ./drizzle.config.json

# Copy migration files and schema
COPY --from=builder /app/lib/db ./lib/db

# Copy AI files for anomaly detection
COPY --from=builder /app/ai ./ai

# Install Python dependencies for AI features
# Use --break-system-packages to work with PEP 668 in Python 3.13+
RUN pip3 install --break-system-packages --no-cache-dir -r /app/ai/requirements.txt

# Create necessary directories and set permissions
RUN mkdir -p /tmp/matplotlib-cache && chown -R nextjs:nodejs /tmp/matplotlib-cache && \
    mkdir -p /app/ai/anomaly_detection/saved_models && chown -R nextjs:nodejs /app/ai/anomaly_detection/saved_models && \
    mkdir -p /app/ai/outputs_enrollment && chown -R nextjs:nodejs /app/ai/outputs_enrollment && \
    mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads && \
    mkdir -p /tmp/openjkn-ai && chown -R nextjs:nodejs /tmp/openjkn-ai && \
    chown nextjs:nodejs /app/drizzle.config.json && \
    chmod 664 /app/drizzle.config.json

# Copy migration script
COPY --chmod=755 scripts/docker-entrypoint.sh /app/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Set entrypoint for database migrations
ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["node", "server.js"]
