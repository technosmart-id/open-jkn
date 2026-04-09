#!/bin/bash
set -e

echo "Starting docker-entrypoint.sh..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  echo "Please set DATABASE_URL in your environment or Dokploy configuration."
  exit 1
fi

# Extract host from DATABASE_URL for checking
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
echo "DATABASE_URL is configured (host: $DB_HOST)"

# Wait for database to be ready
echo "Waiting for database to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if pg_isready -h "$DB_HOST" -t 2 > /dev/null 2>&1; then
    echo "✓ Database is ready!"
    break
  fi

  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "Waiting for database... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "✗ Database connection timeout after $MAX_RETRIES attempts"
  echo "Please check:"
  echo "  1. DATABASE_URL is correct: $DATABASE_URL"
  echo "  2. Database service is running"
  echo "  3. App and database are on the same Docker network"
  # Don't exit - let the app start and show proper error
fi

echo "Running database migrations..."

# Try to run migrations
echo "Attempting to run db:migrate..."
if bun run db:migrate 2>&1; then
  echo "✓ Migrations completed successfully"
else
  MIGRATE_EXIT=$?
  echo "Migration failed with exit code $MIGRATE_EXIT. Trying db:push as fallback..."
  if bun run db:push 2>&1; then
    echo "✓ Database push completed successfully"
  else
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║ ⚠️  DATABASE CONNECTION FAILED                              ║"
    echo "╠═══════════════════════════════════════════════════════════════╣"
    echo "║                                                              ║"
    echo "║ The application could not connect to the database.          ║"
    echo "║                                                              ║"
    echo "║ Your DATABASE_URL: $DATABASE_URL"
    echo "║                                                              ║"
    echo "║ Troubleshooting:                                            ║"
    echo "║   1. Verify DATABASE_URL is correct                         ║"
    echo "║   2. Check if database is running                           ║"
    echo "║   3. Ensure app and database are on same Docker network     ║"
    echo "║                                                              ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "The application will start, but will not function correctly."
    echo ""
  fi
fi

# Start the application
echo "Starting application..."
exec "$@"
