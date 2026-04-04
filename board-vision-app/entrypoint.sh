#!/bin/sh
echo "Starting Board Vision Backend..."

# Construct JDBC URL from individual PG* vars (avoids Render's broken DATABASE_URL)
JDBC_URL="jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require"

echo "Database host: ${PGHOST:-not set}"
echo "Database port: ${PGPORT:-not set}"
echo "Database name: ${PGDATABASE:-not set}"
echo "Spring profile: ${SPRING_PROFILES_ACTIVE:-default}"
echo "Using JDBC URL: ${JDBC_URL}"

# Pass as Java system properties (-D flags have highest priority in Spring Boot)
# This completely bypasses Spring's DATABASE_URL auto-detection
exec java \
  -Dspring.datasource.url="$JDBC_URL" \
  -Dspring.datasource.username="$PGUSER" \
  -Dspring.datasource.password="$PGPASSWORD" \
  -jar app.jar "$@"
