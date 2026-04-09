#!/bin/bash
set -e

echo "Starting docker-entrypoint.sh..."
echo "Running database migrations..."

# Extract database connection details from DATABASE_URL
DB_URL="$DATABASE_URL"

if [ -z "$DB_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Try to run migrations (they might fail if DB is not ready yet)
# The || true ensures we continue even if migrations fail on first attempt
echo "Attempting to run db:migrate..."
if bun run db:migrate; then
  echo "Migrations completed successfully"
else
  echo "Migration failed with exit code $?. Trying db:push as fallback..."
  if bun run db:push; then
    echo "Database push completed successfully"
  else
    echo "Warning: Database migrations failed. The application will start, but may not work correctly."
    echo "Please check your database connection and migration files."
    # We don't exit here to allow app to start and potentially debug via UI or logs
  fi
fi

# Start the application
echo "Starting application..."
exec "$@"
