#!/bin/bash

echo "🚀 Building Clan Tracker Docker image..."

# Build the image
docker build -t clan-tracker .

if [ $? -eq 0 ]; then
    echo "✅ Image built successfully!"
    echo ""
    echo "🔧 To run the container:"
    echo "docker run -p 3000:3000 clan-tracker"
    echo ""
    echo "⚠️  Don't forget to set environment variables:"
    echo "docker run -p 3000:3000 \\"
    echo "  -e DATABASE_URL='file:./prod.db' \\"
    echo "  -e NEXTAUTH_SECRET='your-32-char-secret' \\"
    echo "  -e NEXTAUTH_URL='http://localhost:3000' \\"
    echo "  clan-tracker"
else
    echo "❌ Build failed!"
fi