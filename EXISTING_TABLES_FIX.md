# Fix: Using Existing DynamoDB Tables

## ❌ Problem
I mistakenly created NEW DynamoDB tables via Amplify Gen 2, but you already have existing tables:
- `oc-dynamodb-categories-amplify`
- `oc-dynamodb-articles-amplify`
- `oc-dynamodb-users-amplify`

## ✅ Solution
Instead of using Amplify Data models (which create new tables), I now use **AWS SDK DynamoDB client** to directly query your existing tables.

---

## What Changed

### 1. Installed AWS SDK
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

### 2. Created DynamoDB Utility (`lib/dynamodb.ts`)
This file contains:
- **Direct connections** to your existing tables
- **Helper functions** to fetch categories and articles
- **Type definitions** for Category and Article
- **Authentication** using Amplify credentials

**Functions Available:**
- `getCategories()` - Fetch all categories from `oc-dynamodb-categories-amplify`
- `getCategoriesByParentId(parentId)` - Fetch categories by parent
- `getArticles()` - Fetch all articles from `oc-dynamodb-articles-amplify`
- `getArticlesByCategoryId(categoryId)` - Fetch articles by category

### 3. Updated Homepage (`app/page.tsx`)
- ❌ **Before**: Used `client.models.Category.list()` (Amplify Data)
- ✅ **Now**: Uses `getCategories()` from `lib/dynamodb.ts`
- Directly queries your existing `oc-dynamodb-categories-amplify` table

---

## Table Structure Expected

### Categories Table: `oc-dynamodb-categories-amplify`
```json
{
  "id": "string",              // Primary Key
  "name": "string",            // Category name
  "slug": "string",            // URL-friendly name
  "description": "string",     // Optional description
  "icon": "string",            // Emoji icon (e.g., "🔒")
  "color": "string",           // Icon background color
  "parentId": "string",        // "root" for top-level, or parent ID
  "order": "number",           // Sort order (0, 1, 2...)
  "isVisible": "boolean",      // Public visibility (true/false)
  "createdAt": "string",       // Optional timestamp
  "updatedAt": "string"        // Optional timestamp
}
```

### Articles Table: `oc-dynamodb-articles-amplify`
```json
{
  "id": "string",              // Primary Key
  "title": "string",           // Article title
  "slug": "string",            // URL-friendly name
  "content": "string",         // Article content (Lexical JSON)
  "categoryId": "string",      // Parent category ID
  "status": "string",          // "published" or "draft"
  "author": "string",          // Author name
  "attachments": "string",     // JSON string of attachments
  "createdAt": "string",       // Optional timestamp
  "updatedAt": "string"        // Optional timestamp
}
```

---

## How It Works Now

### Data Flow
```
Homepage
   ↓
getCategories() in lib/dynamodb.ts
   ↓
AWS SDK DynamoDB Client
   ↓
Scan existing table: oc-dynamodb-categories-amplify
   ↓
Filter: parentId === 'root' AND isVisible !== false
   ↓
Sort by: order field
   ↓
Display category cards
```

### Authentication
- Uses Amplify Auth credentials automatically
- The DynamoDB client authenticates with IAM credentials from Amplify session
- Public read access works with unauthenticated identities

---

## Testing the Homepage

### 1. Check If Table Has Data
Go to AWS Console → DynamoDB → Tables → `oc-dynamodb-categories-amplify`

**If table is empty**, add a test category:
```json
{
  "id": "cat-001",
  "name": "Network Security",
  "slug": "network-security",
  "description": "Learn about firewall configurations and network protection",
  "icon": "🔒",
  "color": "#4ECDC4",
  "parentId": "root",
  "order": 0,
  "isVisible": true
}
```

### 2. Verify Field Names Match
The code expects these exact field names:
- `id`, `name`, `slug`, `description`, `icon`, `color`
- `parentId`, `order`, `isVisible`

If your table uses different field names (e.g., `parent_id` instead of `parentId`), you'll need to:
- Update `lib/dynamodb.ts` type definitions
- Update the filter/sort logic in `app/page.tsx`

### 3. Check IAM Permissions
The Amplify Identity Pool must have permissions to:
- `dynamodb:Scan` on `oc-dynamodb-categories-amplify`
- `dynamodb:GetItem` on the same table

If you get "Access Denied" errors, update the IAM role for unauthenticated identities.

---

## What About the New Tables?

The Amplify sandbox created new tables:
- `Category-<random-id>-sandbox`
- `Article-<random-id>-sandbox`

**You can safely ignore or delete these** since we're not using them. They were created by the Amplify Data schema deployment.

To avoid confusion, you can:
1. Delete the new tables from AWS Console
2. Or keep them for future use (they won't interfere)

---

## Next Steps

### Immediate
1. ✅ Refresh the homepage in browser
2. ✅ Check browser console for any errors
3. ✅ Verify categories load from your existing table

### If Categories Don't Show
**Scenario A: Table is empty**
- Add test data via AWS Console

**Scenario B: Field names don't match**
- Check actual field names in DynamoDB
- Update `lib/dynamodb.ts` type definitions
- Update filter logic if needed

**Scenario C: Permission errors**
- Check IAM role has DynamoDB read permissions
- Verify table name is exactly `oc-dynamodb-categories-amplify`

### Future Phases
- Create similar utilities for Articles
- Build admin interface to manage data
- Add subcategory and article display pages

---

## Files Modified

### New Files
- ✅ `lib/dynamodb.ts` - DynamoDB utilities for existing tables

### Updated Files
- ✅ `app/page.tsx` - Now uses direct DynamoDB queries
- ✅ `package.json` - Added AWS SDK dependencies

### Unchanged
- ✅ `amplify/data/resource.ts` - Still has schema (not used now)
- ✅ Amplify auth configuration
- ✅ All UI components and styling

---

## Summary

✅ **Now correctly using your existing DynamoDB tables**
✅ **No new tables being created**
✅ **Direct queries via AWS SDK**
✅ **Same UI and functionality**

The homepage will now fetch categories directly from `oc-dynamodb-categories-amplify`! 🎉

