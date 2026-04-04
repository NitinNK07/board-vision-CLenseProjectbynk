#!/bin/sh
echo "Starting application with database URL fix..."
echo "DATABASE_URL is set: $(echo $DATABASE_URL | cut -c1-20)..."

# Remove any spaces from DATABASE_URL (Render sometimes adds them)
CLEAN_URL=$(echo "$DATABASE_URL" | tr -d ' ')

# Use Java system property to override spring.datasource.url with jdbc: prefix
exec java -Dspring.datasource.url="jdbc:${CLEAN_URL}" -jar app.jar "$@"
