# OculusCyber Knowledge Base - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Current Implementation](#current-implementation)
3. [Architecture & Data Flow](#architecture--data-flow)
4. [Deployment Guide](#deployment-guide)
5. [Troubleshooting](#troubleshooting)

---

## Project Overview

### 🎯 Goal
Build a public cybersecurity knowledge base portal using AWS Amplify Gen 2 with:
- **Public homepage** showing categories from existing DynamoDB tables ✅
- **Protected admin section** (/oc-admin) with Cognito authentication ✅
- **Dynamic routing** for categories, subcategories, and articles ✅
- **Modern dark-themed UI** using Chakra UI ✅

### 🔗 Repository
- **Git**: `https://github.com/thebronco/oculus_amplify.git`
- **Branch**: `main`
- **Framework**: Next.js 14 (App Router) + AWS Amplify Gen 2

---

## Current Implementation

### ✅ What's Built

#### Phase 1: Homepage (Complete)

#### Frontend
- **Homepage** (`app/page.tsx`)
  - Displays root-level categories from DynamoDB
  - Filters: `parentId === 'root'` AND `isVisible !== false`
  - Sorts by `order` field (ascending)
  - Responsive 3-column grid (1 col mobile, 2 tablet, 3 desktop)
  - Fixed card sizes (140px for categories, 200px for tutorial cards)
  - Text truncation with ellipsis for long content
  
- **Navigation** (`components/Navbar.tsx`)
  - Sticky navbar with branding
  - Links to home and admin portal
  - Responsive mobile menu

- **Dark Theme** (`app/theme.ts`)
  - Background: `#161d26`
  - Brand blue: `#5294CF`
  - Card-based layout with hover effects

#### Backend
- **DynamoDB Integration** (`lib/dynamodb.ts`)
  - Direct queries to existing tables using AWS SDK
  - Functions: `getCategories()`, `getArticles()`, etc.
  - Type-safe TypeScript interfaces

- **IAM Permissions** (`amplify/backend.ts`)
  - Unauthenticated users can read from DynamoDB tables
  - Read permissions: `dynamodb:GetItem`, `dynamodb:Query`, `dynamodb:Scan`

### 📦 Dependencies Installed
```json
{
  "@chakra-ui/react": "^2.10.9",
  "@chakra-ui/icons": "^2.2.4",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "framer-motion": "^10.18.0",
  "react-icons": "^4.12.0",
  "@aws-sdk/client-dynamodb": "latest",
  "@aws-sdk/lib-dynamodb": "latest"
}
```

### 📊 Existing DynamoDB Tables

#### Categories Table: `oc-dynamodb-categories-amplify`
```typescript
{
  id: string              // Primary Key
  name: string            // Category name
  slug: string            // URL-friendly name
  description?: string    // Optional description
  icon?: string           // Emoji icon (e.g., "🔒")
  color?: string          // Icon background color (hex)
  parentId: string        // "root" for top-level, or parent category ID
  order?: number          // Sort order (0, 1, 2...)
  isVisible?: boolean     // Public visibility (default: true)
  createdAt?: string      // ISO timestamp
  updatedAt?: string      // ISO timestamp
}
```

**Category Hierarchy**:
- Top-level: `parentId = 'root'`
- Subcategories: `parentId = <parent-category-id>`
- Supports infinite nesting

#### Articles Table: `oc-dynamodb-articles-amplify`
```typescript
{
  id: string              // Primary Key
  title: string           // Article title
  slug: string            // URL-friendly name
  content: string         // Article content (Lexical JSON format)
  categoryId: string      // Parent category ID
  status: string          // "published" or "draft"
  author: string          // Author name
  attachments?: string    // JSON string of file attachments
  createdAt?: string      // ISO timestamp
  updatedAt?: string      // ISO timestamp
}
```

#### Users Table: `oc-dynamodb-users-amplify`
For future admin authentication.

---

## Architecture & Data Flow

### Data Flow Diagram
```
Homepage (app/page.tsx)
    ↓
getCategories() in lib/dynamodb.ts
    ↓
AWS SDK DynamoDB Client
    ↓
Scan: oc-dynamodb-categories-amplify
    ↓
Filter: parentId === 'root' AND isVisible !== false
    ↓
Sort: by order field (ascending)
    ↓
Display: Category cards in responsive grid
```

### Key Files Structure
```
oculus_amplify/
├── amplify/
│   ├── backend.ts              # IAM permissions for DynamoDB
│   ├── data/resource.ts        # Amplify Data schema (not used currently)
│   └── auth/resource.ts        # Amplify Auth configuration
├── app/
│   ├── page.tsx                # Homepage with categories
│   ├── layout.tsx              # Root layout with providers
│   ├── providers.tsx           # Chakra UI provider
│   ├── theme.ts                # Dark theme configuration
│   └── app.css                 # Global styles
├── components/
│   └── Navbar.tsx              # Navigation component
├── lib/
│   └── dynamodb.ts             # DynamoDB utilities & queries
├── amplify_outputs.json        # Amplify configuration (auto-generated)
└── package.json                # Dependencies
```

### Homepage Layout
```
┌─────────────────────────────────────────────────────────┐
│                   Navbar (Sticky)                        │
├─────────────────────────────────────────────────────────┤
│  Main Content (70%)          │  Sidebar (30%)           │
│  ┌──────────────────────────┐│  ┌──────────────────────┐│
│  │ [Category Cards Grid]    ││  │ Getting Started      ││
│  │ 📁 AWS Security          ││  │ - Quick Links        ││
│  │ 📁 Application Security  ││  │ - Setup Guides       ││
│  │ 📁 Ransomware            ││  │ - Resources          ││
│  └──────────────────────────┘│  └──────────────────────┘│
│  ┌──────────────────────────┐│                          │
│  │ [Tutorial Cards - 4 col] ││                          │
│  │ 🎯 ✅ 📊 🔍             ││                          │
│  └──────────────────────────┘│                          │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Guide

### 🚀 Current Status
- Sandbox: Running locally
- Changes ready to deploy
- Backend: IAM permissions configured
- Frontend: Homepage complete

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

---

## 🔐 Phase 3: Admin Authentication (NEW!)

### ✅ What's Implemented

**Cognito Authentication** (Amplify Gen 2 Best Practice):
- ✅ Email/password login via Amplify Authenticator
- ✅ Single admin access: `capitalcookdc@gmail.com`
- ✅ Protected routes with AuthGuard component
- ✅ Email-based access control

**Admin Portal Pages**:
- ✅ `/oc-admin/login` - Login page with Amplify Authenticator
- ✅ `/oc-admin/dashboard` - Stats dashboard (categories, articles, published/drafts)
- ✅ `/oc-admin/categories` - Category management (placeholder)
- ✅ `/oc-admin/articles` - Article management (placeholder)
- ✅ `/oc-admin/users` - User management (placeholder)
- ✅ `/oc-admin/settings` - Settings (placeholder)

**Components**:
- ✅ `components/admin/AuthGuard.tsx` - Route protection
- ✅ `components/admin/AdminLayout.tsx` - Sidebar navigation

### 🔑 Create Admin User

#### Option 1: AWS Console (Recommended)

1. **Navigate to Cognito**:
   - Go to [AWS Console](https://console.aws.amazon.com/cognito/)
   - Region: **us-east-1**
   - Click **User Pools**

2. **Find Your User Pool**:
   - Pool ID: `us-east-1_FwbPX8bIn` (from `amplify_outputs.json`)
   - Click on the pool

3. **Create User**:
   - Click **Users** tab → **Create user**
   - **Email**: `capitalcookdc@gmail.com`
   - **Email verified**: ☑️ **Check this box**
   - **Password**: Choose one:
     - "Send email invitation" (Recommended)
     - Or set password: `Admin@2024!`
   - Click **Create user**

4. **Verify Email Status**:
   - Click on user → Confirm **Email verified** = true

#### Option 2: AWS CLI

```bash
USER_POOL_ID="us-east-1_FwbPX8bIn"

# Create user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username capitalcookdc@gmail.com \
  --user-attributes \
    Name=email,Value=capitalcookdc@gmail.com \
    Name=email_verified,Value=true \
  --message-action SUPPRESS \
  --region us-east-1

# Set password
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username capitalcookdc@gmail.com \
  --password "Admin@2024!" \
  --permanent \
  --region us-east-1
```

### 🧪 Test Admin Login

1. **Start Dev Server**: `npm run dev`
2. **Navigate**: `http://localhost:3000/oc-admin/login`
3. **Sign In**:
   - Email: `capitalcookdc@gmail.com`
   - Password: (from Cognito)
4. **Success**: Redirected to dashboard

### 🛡️ Security Features

- ✅ Only `capitalcookdc@gmail.com` can access `/oc-admin/*`
- ✅ Other users see "Access Denied"
- ✅ Automatic redirect to login if not authenticated
- ✅ Session management via Cognito
- ✅ Sign out functionality

### 📊 DynamoDB Users Table

**Current Status**: Not used (authentication via Cognito only)

**Recommendation**: You can **delete** `oc-dynamodb-users-amplify` table since:
- Authentication handled by Cognito
- Access control is email-based
- No additional user data needed currently

**Future Use** (if kept):
- User roles/permissions
- Activity logs
- User preferences

### 🚀 Next Phase: Full Admin Features

Coming soon:
- [ ] Category Management (CRUD operations)
- [ ] Article Editor with Lexical
- [ ] File uploads for attachments
- [ ] User management interface
- [ ] Settings panel

For detailed setup instructions, see: `ADMIN_SETUP_INSTRUCTIONS.md`

