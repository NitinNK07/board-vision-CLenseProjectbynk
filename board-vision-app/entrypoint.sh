#!/bin/sh
# Add jdbc: prefix to DATABASE_URL if not already present
if [ -n "$DATABASE_URL" ]; then
    export SPRING_DATASOURCE_URL="jdbc:${DATABASE_URL}"
    echo "Using database URL: jdbc:postgresql://..."
fi

# Start the application
exec java -jar app.jar
