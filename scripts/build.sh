#!/bin/bash

# Generate Prisma client
npx prisma generate

# Run database migrations (if needed)
npx prisma migrate deploy || echo "No migrations to run"

# Build the Next.js app
npm run build
