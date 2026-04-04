#!/bin/sh
echo "Starting Board Vision Backend..."

# Fix Render's DATABASE_URL format for JDBC
# Render provides: postgresql://user:pass@host/db
# JDBC needs:      jdbc:postgresql://host:port/db
if [ -n "$DATABASE_URL" ]; then
  # Convert postgresql:// to jdbc:postgresql:// and add SSL
  export SPRING_DATASOURCE_URL="jdbc:${DATABASE_URL}?sslmode=require"
  echo "Converted DATABASE_URL to JDBC format"
fi

# Use individual PG vars for username/password (avoids special character issues)
if [ -n "$PGUSER" ]; then
  export SPRING_DATASOURCE_USERNAME="$PGUSER"
fi
if [ -n "$PGPASSWORD" ]; then
  export SPRING_DATASOURCE_PASSWORD="$PGPASSWORD"
fi

echo "Database host: ${PGHOST:-not set}"
echo "Database port: ${PGPORT:-not set}"
echo "Database name: ${PGDATABASE:-not set}"
echo "Spring profile: ${SPRING_PROFILES_ACTIVE:-default}"

# Start the application
exec java -jar app.jar "$@"
