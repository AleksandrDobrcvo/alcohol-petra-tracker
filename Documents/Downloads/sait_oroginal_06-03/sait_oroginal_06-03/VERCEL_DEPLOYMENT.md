# Vercel Deployment Guide

This guide explains how to deploy your Alcohol Petra Tracker app to Vercel.

## Prerequisites

1. Push your code to a GitHub repository
2. Install the Vercel CLI: `npm install -g vercel`
3. Have a PostgreSQL database ready (recommended: [Neon.tech](https://neon.tech))

## Step-by-Step Deployment

### 1. Prepare Your Database
- Sign up at [Neon.tech](https://neon.tech) (free tier available)
- Create a new project and copy the PostgreSQL connection string

### 2. Log In to Vercel
Run the following command and follow the browser instructions:
```bash
vercel login
```

### 3. Link Your Project (Optional)
To connect your local project to Vercel:
```bash
vercel link
```

### 4. Manual Deployment Process

#### Option A: Via Vercel Dashboard (Recommended for first time)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Before deploying, add the following Environment Variables:

**Required Environment Variables:**
- `DATABASE_URL` - Your PostgreSQL connection string from Neon.tech
- `NEXTAUTH_URL` - Initially set to `https://your-project-name.vercel.app` (replace with your actual project name from Vercel)
- `NEXTAUTH_SECRET` - Generate a secret at [randomkeygen.com](https://randomkeygen.com/) (Code 256-bit)
- `DISCORD_CLIENT_ID` - From your Discord Developer Portal
- `DISCORD_CLIENT_SECRET` - From your Discord Developer Portal

**Optional Environment Variables:**
- `OWNER_DISCORD_ID` - Your Discord user ID (to become owner/admin)

5. Click "Deploy Project"

#### Option B: Via CLI
```bash
npm run vercel-deploy
```

### 5. Post-Deployment Steps

1. **Update NEXTAUTH_URL:**
   - After the first successful deployment, Vercel will give you a URL like `https://alcohol-petra-tracker.vercel.app`
   - Go to Vercel dashboard → your project → Settings → Environment Variables
   - Update `NEXTAUTH_URL` to match your actual Vercel URL
   - Trigger a new deployment/rebuild

2. **Configure Discord OAuth:**
   - Go to your Discord Developer Portal
   - Navigate to your application → OAuth2 → Redirects
   - Add your callback URL: `https://your-project-name.vercel.app/api/auth/callback/discord`

3. **Run Database Migration:**
   - After deployment, you may need to run your database migrations
   - You can do this by accessing your deployed site and using admin functions or by running Prisma commands in your local environment with the production database URL

### 6. Verification
- Visit your Vercel URL
- Test signing in with Discord
- Verify that the application works correctly

## Troubleshooting

### Common Issues:

1. **Database Connection Issues:**
   - Ensure your `DATABASE_URL` is correct
   - Make sure the database is accessible from external connections
   - Check that your database plan allows external connections

2. **Authentication Issues:**
   - Verify that `NEXTAUTH_SECRET` is set and consistent
   - Confirm that `NEXTAUTH_URL` matches your actual deployment URL
   - Ensure Discord OAuth redirect URLs are configured correctly

3. **Environment Variables:**
   - Make sure all required environment variables are set
   - Remember that environment variables are case-sensitive

## Redeployment

To redeploy after making changes:
```bash
vercel --prod
```

Or push changes to your GitHub repository to trigger automatic deployment if connected.

## Notes

- Vercel provides a free tier with generous limits for personal projects
- The first deployment might take a few minutes as it builds all dependencies
- For database migrations, you might need to run them separately depending on your setup