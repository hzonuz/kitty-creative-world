#!/bin/sh
set -e

# Apply any pending Prisma migrations before starting the server. This makes
# the container safe to start in a fresh environment, and idempotent on
# subsequent boots.
if [ -n "$DATABASE_URL" ]; then
  echo "→ Applying database migrations…"
  node node_modules/prisma/build/index.js migrate deploy
else
  echo "DATABASE_URL is not set. Skipping prisma migrate deploy."
fi

exec "$@"
