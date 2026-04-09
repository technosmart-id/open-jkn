#!/bin/bash
set -e

echo "Starting docker-entrypoint.sh..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  echo "Please set DATABASE_URL in your environment or Dokploy configuration."
  exit 1
fi

echo "DATABASE_URL is configured (host: $(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p'))"
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
    echo "║   3. Ensure network allows connection                       ║"
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
