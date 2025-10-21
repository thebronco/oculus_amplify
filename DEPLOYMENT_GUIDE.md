# Deployment Guide - Push to AWS Amplify

## 🚀 Current Status
- Git repository: `https://github.com/thebronco/oculus_amplify.git`
- Branch: `main`
- Sandbox: Running locally
- Changes ready to deploy

---

## 📋 Option 1: Deploy via Git Push (Recommended)

### Step 1: Stage All Changes
```bash
git add .
```

This will stage:
- Modified files: `amplify/backend.ts`, `amplify/data/resource.ts`, `app/page.tsx`, etc.
- New files: `lib/dynamodb.ts`, `components/Navbar.tsx`, `app/providers.tsx`, etc.

### Step 2: Commit Changes
```bash
git commit -m "feat: implement homepage with existing DynamoDB tables integration

- Added Chakra UI for dark-themed design
- Created homepage with category grid from existing tables
- Added IAM permissions for DynamoDB access
- Implemented direct AWS SDK queries to existing tables
- Added Navbar and responsive layout
- Fixed tile sizes and text truncation"
```

### Step 3: Push to GitHub
```bash
git push origin main
```

### Step 4: Connect to Amplify Hosting (If Not Already Connected)

**If you haven't connected your repo to Amplify Hosting yet:**

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. Select **GitHub** as the source
4. Authorize AWS Amplify to access your GitHub account
5. Select repository: `thebronco/oculus_amplify`
6. Select branch: `main`
7. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
   - Base directory: (leave empty)
8. Click **"Save and deploy"**

**If already connected:**
- Your changes will automatically deploy when you push to `main`
- Monitor deployment at: Amplify Console → Your App → Deployments

---

## 📋 Option 2: Manual Amplify CLI Deploy

### Step 1: Install Amplify CLI (if not installed)
```bash
npm install -g @aws-amplify/cli
```

### Step 2: Configure Amplify
```bash
amplify configure
```

### Step 3: Initialize Amplify in Project (if not done)
```bash
amplify init
```

### Step 4: Deploy Backend
```bash
amplify push
```

### Step 5: Publish Frontend
```bash
amplify publish
```

---

## 📋 Option 3: Keep Using Sandbox (Development)

Your sandbox is already running and will auto-deploy backend changes.

**For frontend only:**
```bash
npm run build
```

Then deploy the `.next` folder to your hosting service.

---

## ⚠️ Important Notes Before Deploying

### 1. Environment Variables
Make sure these are set in Amplify Console → Environment variables:
- `AWS_REGION=us-east-1`
- Any other secrets/API keys

### 2. Build Settings
Your `amplify.yml` should look like:
```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm ci --cache .npm --prefer-offline
        - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - .next/cache/**/*
      - .npm/**/*
      - node_modules/**/*
```

### 3. IAM Permissions
Your deployment will include the IAM permissions we added in `amplify/backend.ts`:
- DynamoDB read access to existing tables
- This will be applied automatically during deployment

### 4. Existing DynamoDB Tables
Make sure your existing tables are in the **same AWS account and region** as your Amplify deployment:
- `oc-dynamodb-categories-amplify`
- `oc-dynamodb-articles-amplify`
- `oc-dynamodb-users-amplify`

---

## 🎯 Quick Deploy Commands

### Full Deployment (Commit + Push)
```bash
# Stage all changes
git add .

# Commit with message
git commit -m "feat: homepage with DynamoDB integration"

# Push to trigger Amplify deployment
git push origin main
```

### Check Deployment Status
- Go to: AWS Amplify Console → Your App
- Or visit your app URL (provided by Amplify)

---

## 🔍 Verify Deployment

### 1. Check Backend
- Go to Amplify Console → Backend environments
- Verify the backend is deployed with Category/Article models

### 2. Check Frontend
- Visit your Amplify-provided URL (e.g., `https://main.xxxxx.amplifyapp.com`)
- Homepage should display categories from your DynamoDB table
- Check browser console for any errors

### 3. Check IAM Permissions
- Go to IAM Console → Roles
- Find your Amplify unauthenticated role
- Verify it has DynamoDB read permissions to your tables

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Amplify Console
- Verify all dependencies are in `package.json`
- Check for linting errors: `npm run lint`

### Categories Not Loading
- Check IAM permissions on unauthenticated role
- Verify table names match exactly in `lib/dynamodb.ts`
- Check browser console for errors
- Verify your DynamoDB tables exist and have data

### Sandbox Changes Not Reflecting
- Sandbox changes are local only
- Must commit and push to deploy to Amplify Hosting

---

## 📊 Deployment Checklist

Before pushing:
- [ ] All code changes committed
- [ ] No linting errors (`npm run lint`)
- [ ] Tested locally (`npm run dev`)
- [ ] Verified DynamoDB table access
- [ ] Updated documentation files if needed
- [ ] Checked amplify.yml build settings

After pushing:
- [ ] Monitor deployment in Amplify Console
- [ ] Test deployed site URL
- [ ] Verify categories load correctly
- [ ] Check all links and navigation work
- [ ] Test on mobile/tablet/desktop

---

## 🎉 Your Deployment URL

Once deployed, your site will be available at:
- **Production**: `https://main.[your-app-id].amplifyapp.com`
- **Custom domain** (if configured): Your custom domain

You can find the exact URL in:
- Amplify Console → Your App → Domain management

