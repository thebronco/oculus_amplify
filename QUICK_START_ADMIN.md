# 🚀 Quick Start - Admin Portal

## 🔐 Login Credentials

**Admin Email**: `capitalcookdc@gmail.com`  
**Password**: Create in Cognito (see below)

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Create Admin User in Cognito

```bash
# Option A: AWS CLI (fastest)
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_FwbPX8bIn \
  --username capitalcookdc@gmail.com \
  --user-attributes Name=email,Value=capitalcookdc@gmail.com Name=email_verified,Value=true \
  --message-action SUPPRESS \
  --region us-east-1

aws cognito-idp admin-set-user-password \
  --user-pool-id us-east-1_FwbPX8bIn \
  --username capitalcookdc@gmail.com \
  --password "Admin@2024!" \
  --permanent \
  --region us-east-1
```

**Option B**: AWS Console → Cognito → User Pool `us-east-1_FwbPX8bIn` → Create user

### Step 2: Start Dev Server

```bash
npm run dev
```

### Step 3: Login

Open: `http://localhost:3000/oc-admin/login`

Enter:
- Email: `capitalcookdc@gmail.com`
- Password: `Admin@2024!` (or what you set)

**Success!** You'll be redirected to the dashboard.

---

## 📍 Admin Routes

| Route | Description | Status |
|-------|-------------|--------|
| `/oc-admin/login` | Login page | ✅ Complete |
| `/oc-admin/dashboard` | Stats dashboard | ✅ Complete |
| `/oc-admin/categories` | Category management | 🚧 Placeholder |
| `/oc-admin/articles` | Article editor | 🚧 Placeholder |
| `/oc-admin/users` | User management | 🚧 Placeholder |
| `/oc-admin/settings` | System settings | 🚧 Placeholder |

---

## 🎯 What Works Right Now

### ✅ Authentication
- Email/password login
- Protected routes
- Session management
- Sign out

### ✅ Dashboard
- Live stats from DynamoDB:
  - Total categories
  - Total articles
  - Published count
  - Draft count
- Quick actions
- System info

### ✅ Navigation
- Sidebar menu
- All admin sections accessible
- "View Public Site" link

---

## 🔧 Common Tasks

### Check if user exists:
```bash
aws cognito-idp admin-get-user \
  --user-pool-id us-east-1_FwbPX8bIn \
  --username capitalcookdc@gmail.com \
  --region us-east-1
```

### Reset password:
```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id us-east-1_FwbPX8bIn \
  --username capitalcookdc@gmail.com \
  --password "NewPassword123!" \
  --permanent \
  --region us-east-1
```

### Delete user (if needed):
```bash
aws cognito-idp admin-delete-user \
  --user-pool-id us-east-1_FwbPX8bIn \
  --username capitalcookdc@gmail.com \
  --region us-east-1
```

---

## 🐛 Troubleshooting

### Can't login?
- ✅ Check email is exactly: `capitalcookdc@gmail.com`
- ✅ Verify user exists in Cognito
- ✅ Confirm email is verified in Cognito
- ✅ Clear browser cache and try again

### "Access Denied" after login?
- ✅ Verify email in Cognito matches `capitalcookdc@gmail.com`
- ✅ Check browser console for errors
- ✅ Restart dev server: `npm run dev`

### Stuck on loading spinner?
- ✅ Check `amplify_outputs.json` exists
- ✅ Verify sandbox is running: `npx ampx sandbox`
- ✅ Check browser console for errors

---

## 📚 Full Documentation

- **Detailed Setup**: `ADMIN_SETUP_INSTRUCTIONS.md`
- **Implementation Summary**: `PHASE3_SUMMARY.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`

---

## 🎉 You're All Set!

Your admin portal is ready. Create the Cognito user and login!

**Next steps**: Implement content management features (categories, articles, etc.)

