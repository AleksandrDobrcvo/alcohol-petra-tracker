# PowerShell script to help with Vercel deployment

Write-Host "Preparing for Vercel deployment..." -ForegroundColor Green

# Check if logged in to Vercel
try {
    $loginStatus = vercel whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
    Write-Host "Logged in to Vercel successfully!" -ForegroundColor Green
} catch {
    Write-Host "You need to log in to Vercel first." -ForegroundColor Red
    Write-Host "Please run: vercel login" -ForegroundColor Yellow
    Write-Host "Then follow the instructions in your browser." -ForegroundColor Yellow
    exit 1
}

# Deploy to Vercel
Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
vercel --prod

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "Remember to:" -ForegroundColor Yellow
Write-Host "1. Set environment variables in Vercel dashboard if not already set" -ForegroundColor Yellow
Write-Host "2. Update NEXTAUTH_URL after first deployment with the actual Vercel URL" -ForegroundColor Yellow
Write-Host "3. Re-deploy after updating NEXTAUTH_URL" -ForegroundColor Yellow
Write-Host "4. Add the callback URL to Discord Developer Portal" -ForegroundColor Yellow