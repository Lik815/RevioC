#!/bin/sh

echo "=== Revio API Starting ==="
echo "NODE_ENV=$NODE_ENV"
echo "PORT=$PORT"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo yes || echo NO)"

echo "Running prisma db push..."
npx prisma db push --schema prisma/schema.production.prisma --skip-generate || {
  echo "WARNING: prisma db push failed, starting server anyway..."
}

echo "Starting node server..."
exec node dist/server.js
