# CI/CD Pipeline Test Script for Windows
# This script helps verify that your project is ready for CI/CD

Write-Host "Testing CI/CD Pipeline Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Make sure you're in the project root." -ForegroundColor Red
    exit 1
}

Write-Host "Found package.json" -ForegroundColor Green

# Check if tests exist
if (-not (Test-Path "tests")) {
    Write-Host "Error: tests directory not found." -ForegroundColor Red
    exit 1
}

Write-Host "Found tests directory" -ForegroundColor Green

# Check if vercel.json exists
if (-not (Test-Path "vercel.json")) {
    Write-Host "Error: vercel.json not found." -ForegroundColor Red
    exit 1
}

Write-Host "Found vercel.json" -ForegroundColor Green

# Check if GitHub Actions workflow exists
if (-not (Test-Path ".github/workflows/ci-cd.yml")) {
    Write-Host "Error: GitHub Actions workflow not found." -ForegroundColor Red
    exit 1
}

Write-Host "Found GitHub Actions workflow" -ForegroundColor Green

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies." -ForegroundColor Red
    exit 1
}

Write-Host "Dependencies installed successfully" -ForegroundColor Green

# Run tests
Write-Host "Running tests..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Tests failed." -ForegroundColor Red
    exit 1
}

Write-Host "All tests passed!" -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Warning: Git repository not initialized." -ForegroundColor Yellow
    Write-Host "   Run: git init" -ForegroundColor Cyan
    Write-Host "   Run: git add ." -ForegroundColor Cyan
    Write-Host "   Run: git commit -m 'Initial commit'" -ForegroundColor Cyan
    Write-Host "   Run: git remote add origin your-github-repo-url" -ForegroundColor Cyan
    Write-Host "   Run: git push -u origin main" -ForegroundColor Cyan
} else {
    Write-Host "Git repository found" -ForegroundColor Green
    
    # Check if remote is set
    try {
        $remoteUrl = git remote get-url origin 2>$null
        if ($remoteUrl) {
            Write-Host "Git remote origin is configured" -ForegroundColor Green
        } else {
            Write-Host "Warning: Git remote origin not configured." -ForegroundColor Yellow
            Write-Host "   Run: git remote add origin your-github-repo-url" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "Warning: Git remote origin not configured." -ForegroundColor Yellow
        Write-Host "   Run: git remote add origin your-github-repo-url" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "Pipeline setup verification complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Follow the instructions in CI_CD_SETUP.md" -ForegroundColor Cyan
Write-Host "2. Set up Vercel and get your credentials" -ForegroundColor Cyan
Write-Host "3. Configure GitHub secrets" -ForegroundColor Cyan
Write-Host "4. Push your code to trigger the pipeline" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test the pipeline:" -ForegroundColor Yellow
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m 'Test CI/CD pipeline'" -ForegroundColor Cyan
Write-Host "   git push origin main" -ForegroundColor Cyan 