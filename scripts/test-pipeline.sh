#!/bin/bash

# CI/CD Pipeline Test Script
# This script helps verify that your project is ready for CI/CD

echo "🧪 Testing CI/CD Pipeline Setup"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root."
    exit 1
fi

echo "✅ Found package.json"

# Check if tests exist
if [ ! -d "tests" ]; then
    echo "❌ Error: tests directory not found."
    exit 1
fi

echo "✅ Found tests directory"

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found."
    exit 1
fi

echo "✅ Found vercel.json"

# Check if GitHub Actions workflow exists
if [ ! -f ".github/workflows/ci-cd.yml" ]; then
    echo "❌ Error: GitHub Actions workflow not found."
    exit 1
fi

echo "✅ Found GitHub Actions workflow"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies."
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Run tests
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Error: Tests failed."
    exit 1
fi

echo "✅ All tests passed!"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "⚠️  Warning: Git repository not initialized."
    echo "   Run: git init"
    echo "   Run: git add ."
    echo "   Run: git commit -m 'Initial commit'"
    echo "   Run: git remote add origin <your-github-repo-url>"
    echo "   Run: git push -u origin main"
else
    echo "✅ Git repository found"
    
    # Check if remote is set
    if git remote get-url origin > /dev/null 2>&1; then
        echo "✅ Git remote origin is configured"
    else
        echo "⚠️  Warning: Git remote origin not configured."
        echo "   Run: git remote add origin <your-github-repo-url>"
    fi
fi

echo ""
echo "🎉 Pipeline setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Follow the instructions in CI_CD_SETUP.md"
echo "2. Set up Vercel and get your credentials"
echo "3. Configure GitHub secrets"
echo "4. Push your code to trigger the pipeline"
echo ""
echo "To test the pipeline:"
echo "   git add ."
echo "   git commit -m 'Test CI/CD pipeline'"
echo "   git push origin main" 