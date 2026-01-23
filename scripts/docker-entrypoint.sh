#!/bin/bash
set -e

echo "Running database migrations..."

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_URL="$DATABASE_URL"

if [ -z "$DB_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Try to run migrations (they might fail if DB is not ready yet)
# The || true ensures we continue even if migrations fail on first attempt
if bun run db:migrate; then
  echo "Migrations completed successfully"
else
  echo "Migration failed, trying db:push as fallback..."
  if bun run db:push; then
    echo "Database push completed successfully"
  else
    echo "Warning: Database migrations failed. The application will start, but may not work correctly."
    echo "Please check your database connection and migration files."
  fi
fi

# Start the application
echo "Starting application..."
exec "$@"
