#!/bin/bash
# Script to help with Vercel deployment

echo "Preparing for Vercel deployment..."

# Check if logged in to Vercel
if ! vercel whoami > /dev/null 2>&1; then
    echo "You need to log in to Vercel first."
    echo "Please run: vercel login"
    echo "Then follow the instructions in your browser."
    exit 1
fi

echo "Logged in to Vercel successfully!"

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment completed!"
echo "Remember to:"
echo "1. Set environment variables in Vercel dashboard if not already set"
echo "2. Update NEXTAUTH_URL after first deployment with the actual Vercel URL"
echo "3. Re-deploy after updating NEXTAUTH_URL"
echo "4. Add the callback URL to Discord Developer Portal"