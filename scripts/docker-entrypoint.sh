#!/bin/bash
set -e

echo "Starting docker-entrypoint.sh..."

# Skip migrations at container startup - they will run when seed button is clicked
echo "Skipping database migrations at startup."
echo "Migrations will run via 'Seed Sample Data' button on login page."

# Start the application
echo "Starting application..."
exec "$@"
