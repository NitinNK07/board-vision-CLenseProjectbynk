#!/bin/sh
echo "Starting application with database URL fix..."
echo "DATABASE_URL is set: $(echo $DATABASE_URL | cut -c1-20)..."

# Use Java system property to override spring.datasource.url
# This adds jdbc: prefix to Render's postgresql:// URL
exec java -Dspring.datasource.url="jdbc:${DATABASE_URL}" -jar app.jar "$@"
