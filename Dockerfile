# Stage 1: Dependencies
FROM oven/bun:1 AS base
WORKDIR /app

# Stage 2: Builder
FROM base AS builder
# Install git for lefthook (but we'll skip prepare scripts in Docker)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Build arguments for environment variables
ARG DATABASE_URL
ARG BETTER_AUTH_URL
ARG BETTER_AUTH_SECRET
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ARG NEXT_PUBLIC_APP_URL
ARG RESEND_API_KEY

# Set environment variables for build time
ENV DATABASE_URL=${DATABASE_URL}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV NEXT_PUBLIC_BETTER_AUTH_URL=${NEXT_PUBLIC_BETTER_AUTH_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV RESEND_API_KEY=${RESEND_API_KEY}

COPY package.json bun.lock ./
# Skip prepare scripts in Docker (git hooks not needed in production)
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .
RUN bun run build

# Stage 3: Runner
FROM base AS runner
ENV NODE_ENV=production

# Create non-root user
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy node_modules for drizzle-kit (needed for migrations)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

# Copy migration script
COPY --chmod=755 scripts/docker-entrypoint.sh /app/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Set entrypoint for database migrations
ENTRYPOINT ["/app/docker-entrypoint.sh"]

CMD ["node", "server.js"]
