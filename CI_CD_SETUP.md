# CI/CD Pipeline Setup Guide

This guide will help you set up a complete CI/CD pipeline for your web service that automatically runs tests, builds the project, and deploys to Vercel.

## What the Pipeline Does

1. **Automatically triggers** on every push to `main` or `master` branch
2. **Runs tests** using Jest to ensure code quality
3. **Builds the project** and prepares it for deployment
4. **Deploys to Vercel** automatically when tests pass

## Prerequisites

1. Your code must be pushed to a GitHub repository
2. You need a Vercel account (free tier available)

## Step 1: Set Up Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect your Node.js project
5. Deploy the project once manually to get the project ID

## Step 2: Get Vercel Credentials

After your first deployment, you'll need these values from Vercel:

1. **Vercel Token**: 
   - Go to Vercel Dashboard → Settings → Tokens
   - Create a new token with a descriptive name
   - Copy the token value

2. **Organization ID**:
   - Go to Vercel Dashboard → Settings → General
   - Copy the "Team ID" (this is your org ID)

3. **Project ID**:
   - Go to your project in Vercel Dashboard
   - Go to Settings → General
   - Copy the "Project ID"

## Step 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add these repository secrets:

   - `VERCEL_TOKEN`: Your Vercel token from Step 2
   - `VERCEL_ORG_ID`: Your organization ID from Step 2
   - `VERCEL_PROJECT_ID`: Your project ID from Step 2

## Step 4: Test the Pipeline

1. Make a small change to your code
2. Commit and push to the `main` branch
3. Go to your GitHub repository → "Actions" tab
4. You should see the CI/CD pipeline running

## Pipeline Workflow Details

### Test Job
- Runs on Ubuntu with Node.js 18.x and 20.x
- Installs dependencies with `npm ci`
- Runs your Jest tests with `npm test`
- Builds the project for deployment

### Deploy Job
- Only runs after tests pass
- Only deploys from `main` or `master` branch
- Deploys to Vercel production environment
- Uses the Vercel Action for seamless deployment

## Troubleshooting

### Tests Fail
- Check the test output in the Actions tab
- Ensure all dependencies are in `package.json`
- Verify your test files are in the `tests/` directory

### Deployment Fails
- Verify all Vercel secrets are correctly set
- Check that your `vercel.json` is properly configured
- Ensure your project builds successfully locally

### Build Issues
- Make sure all required files are included in the build
- Check that `package.json` has all necessary dependencies
- Verify the project structure matches what Vercel expects

## Manual Testing

To test the pipeline manually:

```bash
# Run tests locally first
npm test

# If tests pass, commit and push
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

## Monitoring

- **GitHub Actions**: Check the "Actions" tab in your repository
- **Vercel Deployments**: Check your Vercel dashboard for deployment status
- **Live URL**: Your deployed app will be available at your Vercel URL

## Next Steps

Once the pipeline is working:

1. Set up branch protection rules on GitHub
2. Add more comprehensive tests
3. Consider adding code coverage reporting
4. Set up monitoring and alerting for your deployed application

## Files Created

- `.github/workflows/ci-cd.yml`: The main CI/CD workflow
- `CI_CD_SETUP.md`: This setup guide

Your CI/CD pipeline is now ready! Every time you push code to the main branch, it will automatically test, build, and deploy your web service. 