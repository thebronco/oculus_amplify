# Admin User Setup Instructions

## 🔐 Create Admin Account in Cognito

### Admin Credentials:
- **Email**: capitalcookdc@gmail.com
- **Password**: You'll set this during creation

---

## Option 1: Create Admin User via AWS Console (Recommended)

### Step 1: Navigate to Cognito
1. Go to [AWS Console](https://console.aws.amazon.com/cognito/)
2. Select your region: **us-east-1**
3. Click on **User Pools**

### Step 2: Find Your User Pool
1. Look for the user pool created by Amplify
   - Name format: `amplify-awsamplifygen2-mikki-sandbox-xxxxx-userPool`
   - Or check `amplify_outputs.json` for `user_pool_id`: **us-east-1_FwbPX8bIn**

2. Click on the user pool

### Step 3: Create Admin User
1. Click **"Users"** tab
2. Click **"Create user"** button
3. Fill in the form:
   - **User name**: Leave as email
   - **Email**: `capitalcookdc@gmail.com`
   - **Email verified**: ☑️ **Check this box** (important!)
   - **Temporary password**: Choose one of:
     - "Send an email invitation" (Recommended)
     - "Set a password" - Enter: `Admin@2024!` (you'll change this on first login)
   - **Mark email as verified**: ☑️ **Yes**

4. Click **"Create user"**

### Step 4: Verify Email Status
1. Click on the newly created user
2. Confirm **Email verified** shows **true**
3. If not, click **Actions** → **Resend email**

---

## Option 2: Create Admin User via AWS CLI

```bash
# Set your user pool ID (from amplify_outputs.json)
USER_POOL_ID="us-east-1_FwbPX8bIn"

# Create admin user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username capitalcookdc@gmail.com \
  --user-attributes \
    Name=email,Value=capitalcookdc@gmail.com \
    Name=email_verified,Value=true \
  --message-action SUPPRESS \
  --region us-east-1

# Set permanent password (replace YOUR_PASSWORD with actual password)
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username capitalcookdc@gmail.com \
  --password "Admin@2024!" \
  --permanent \
  --region us-east-1
```

**Note**: Replace `Admin@2024!` with your preferred password. It must meet these requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

---

## 🧪 Test Admin Login

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Navigate to Admin Login
Open browser: `http://localhost:3000/oc-admin/login`

### Step 3: Sign In
1. Click **"Sign in"** tab
2. Enter:
   - **Email**: `capitalcookdc@gmail.com`
   - **Password**: (the password you set)
3. Click **"Sign In"**

### Step 4: First Login (if using temporary password)
If you used AWS console invitation:
1. Check email for temporary password
2. Sign in with temporary password
3. You'll be prompted to create a new password
4. Set your permanent password

### Step 5: Access Dashboard
After successful login, you should be redirected to:
`http://localhost:3000/oc-admin/dashboard`

---

## 🛡️ Security Features Implemented

### Email-Based Access Control
- ✅ Only `capitalcookdc@gmail.com` can access admin portal
- ✅ Other users will see "Access Denied" message
- ✅ Automatic redirect to login if not authenticated

### Protected Routes
All `/oc-admin/*` routes are protected:
- ✅ `/oc-admin/dashboard`
- ✅ `/oc-admin/categories`
- ✅ `/oc-admin/articles`
- ✅ `/oc-admin/users`
- ✅ `/oc-admin/settings`

### AuthGuard Component
- Checks authentication status
- Verifies email matches admin email
- Shows loading spinner during auth check
- Redirects to login if unauthorized

---

## 🔍 Troubleshooting

### "Access Denied" Error
**Problem**: Logged in but see "Access Denied"  
**Solution**: 
- Verify you're using `capitalcookdc@gmail.com` exactly
- Check Cognito user pool has email verified
- Clear browser cache and try again

### "User not confirmed" Error
**Problem**: Can't log in, user not confirmed  
**Solution**:
- Go to Cognito Console
- Find the user
- Click Actions → Confirm user
- Set email as verified

### Email Not Verified
**Problem**: Email verification failed  
**Solution**:
```bash
aws cognito-idp admin-update-user-attributes \
  --user-pool-id us-east-1_FwbPX8bIn \
  --username capitalcookdc@gmail.com \
  --user-attributes Name=email_verified,Value=true \
  --region us-east-1
```

### Can't Access After Login
**Problem**: Redirects back to login  
**Solution**:
- Check browser console for errors
- Verify `amplify_outputs.json` is up to date
- Restart dev server: `npm run dev`

---

## 📊 What's Implemented

### ✅ Phase 3 Complete:

**Authentication**:
- ✅ Cognito integration
- ✅ Email/password login
- ✅ Protected admin routes
- ✅ Email-based access control

**Admin Pages**:
- ✅ Login page with Amplify Authenticator
- ✅ Dashboard with stats
- ✅ Sidebar navigation
- ✅ Placeholder pages (Categories, Articles, Users, Settings)

**Security**:
- ✅ AuthGuard component
- ✅ Automatic redirects
- ✅ Sign out functionality
- ✅ Session management

---

## 🚀 Next Steps

### Phase 3B: Full Admin Features (Coming Soon)
- Category Management (CRUD)
- Article Editor with Lexical
- User Management
- File Uploads
- Settings Panel

### Current Status:
**Admin portal is ready for login!** The full content management features will be added in the next phase.

---

## 📝 Notes About DynamoDB Users Table

**Current Implementation**: Email-based access control via Cognito only

**DynamoDB `oc-dynamodb-users-amplify` table**: Currently **not used**

**Recommendation**: You can **delete the DynamoDB users table** since:
- Authentication is handled by Cognito
- Access control is email-based
- No need for additional user data storage currently

**If you want to keep it for future use**:
- Could store user roles/permissions
- Activity logs
- User preferences
- Requires additional implementation

Let me know if you'd like to implement role-based access using the DynamoDB table!

---

## 🎉 Summary

Your admin portal is now set up with:
1. **Cognito Authentication** (Amplify Gen 2 best practice)
2. **Single Admin Access** (capitalcookdc@gmail.com only)
3. **Protected Routes** (AuthGuard on all admin pages)
4. **Dashboard** (Stats overview)
5. **Navigation** (Sidebar with all admin sections)

**Create the admin user and try logging in!** 🔐

