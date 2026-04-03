#!/bin/sh

echo "=== Revio API Starting ==="
echo "NODE_ENV=$NODE_ENV"
echo "PORT=$PORT"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo yes || echo NO)"
echo "PWD=$(pwd)"

if [ -f "dist/src/server.js" ]; then
  echo "Entrypoint found: dist/src/server.js"
else
  echo "ERROR: dist/src/server.js not found"
  echo "Contents of dist:"
  ls -R dist 2>/dev/null || echo "dist directory missing"
  exit 1
fi

echo "Running prisma db push..."
npx prisma db push --schema prisma/schema.production.prisma --skip-generate || {
  echo "WARNING: prisma db push failed, starting server anyway..."
}

echo "Starting node server..."
exec node dist/src/server.js
