#!/bin/sh
echo "Starting application..."
echo "Database host: $PGHOST"
echo "Database port: $PGPORT"
echo "Database name: $PGDATABASE"

# Start the application
exec java -jar app.jar "$@"
