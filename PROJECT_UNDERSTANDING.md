# Project Understanding Document
## OculusCyber Knowledge Base - Amplify Gen 2 Implementation

---

## 🎯 PROJECT GOAL
Build a public cybersecurity knowledge base portal using AWS Amplify Gen 2 with:
- Public home page showing categories/subcategories from DynamoDB
- Protected admin section (/oc-admin) requiring authentication
- Dynamic routing for categories, subcategories, and articles
- Modern dark-themed UI using Chakra UI

---

## 📊 CURRENT STATE ANALYSIS

### Backend (Amplify Gen 2)
**Location**: `amplify/backend.ts`, `amplify/data/resource.ts`

**Status**: ✅ Basic setup exists but needs expansion
- Currently has a simple "Todo" model as a placeholder
- Uses API Key authentication (public access)
- Need to add: Category, Article, and User models
- Need to configure proper auth rules (public read, authenticated write)

**Existing DynamoDB Tables** (mentioned by user):
1. `oc-dynamodb-articles-amplify` - Contains articles
2. `oc-dynamodb-categories-amplify` - Contains categories with hierarchy
3. `oc-dynamodb-users-amplify` - Contains user data

### Frontend Structure
**Current**: Simple Todo app demo (`app/page.tsx`)
**Target**: Knowledge base portal with category navigation

**Dependencies Installed**:
- Next.js 14 (App Router)
- AWS Amplify v6
- Amplify UI React
- React 18

**Missing Dependencies** (from reference):
- Chakra UI (`@chakra-ui/react`, `@emotion/react`, `@emotion/styled`, `framer-motion`)
- Chakra Icons
- React Icons (`react-icons`)
- Lexical Editor (for article content rendering)

---

## 🎨 REFERENCE UI STRUCTURE ANALYSIS

### Theme & Design System
**File**: `referencefolderforui/theme.ts`

**Color Palette**:
- Background Primary: `#161d26` (dark blue-gray)
- Background Secondary: `#1A2332`
- Card Background: `#37475A`
- Primary Brand: `#5294CF` (blue)
- Text: `#D5DBDB` (light gray)
- Border: `#4A5F7A`

**Design Pattern**: Dark mode, card-based layout with hover effects

### Homepage Layout
**File**: `referencefolderforui/page.tsx`

**Structure**:
```
┌─────────────────────────────────────────────────────────┐
│                      Navbar                              │
├─────────────────────────────────────────────────────────┤
│  Main Content (70%)          │  Sidebar (30%)           │
│  ┌──────────────────────────┐│  ┌──────────────────────┐│
│  │ Top-Level Categories     ││  │ Getting Started      ││
│  │ (3-column grid)          ││  │ - Quick Links        ││
│  │ - Filtered by:           ││  │ - Setup Guides       ││
│  │   parentId = 'root'      ││  │ - Resources          ││
│  │   isVisible = true       ││  └──────────────────────┘│
│  │ - Sorted by: order field ││                          │
│  └──────────────────────────┘│                          │
│  ┌──────────────────────────┐│                          │
│  │ Static Tutorial Cards    ││                          │
│  │ (4-column grid)          ││                          │
│  │ - Hands-on Tutorials     ││                          │
│  │ - Security Best Practices││                          │
│  │ - Compliance Center      ││                          │
│  │ - Threat Intelligence    ││                          │
│  └──────────────────────────┘│                          │
└─────────────────────────────────────────────────────────┘
```

**Key Features**:
1. Fetches categories from `getCategories()` API
2. Filters: `parentId === 'root'` AND `isVisible !== false`
3. Sorts by `order` field (ascending)
4. Each category card shows:
   - Icon (emoji) with colored background
   - Category name (blue #5294CF)
   - Description text
   - Hover effects (lift + border glow)

### Dynamic Routing Pattern
**File**: `referencefolderforui/[...slug]/page.tsx`

**Catch-all Route**: Handles all category/subcategory/article paths

**Logic Flow**:
1. Parse slug array from URL
2. Walk through slugs to build category path
3. Check if last slug is an article or category
4. If article: Render article content with breadcrumbs
5. If category: Show subcategories + articles in that category

**URL Examples**:
- `/network-security` → Category page
- `/network-security/firewall-security` → Subcategory page
- `/network-security/firewall-security/iptables-guide` → Article page

### Admin Section
**File**: `referencefolderforui/oc-admin/dashboard/page.tsx`

**Protected Routes**: All `/oc-admin/*` routes wrapped in `<AuthGuard>`
**Features**: Dashboard, category management, article management, user management

---

## 📋 DATA MODEL REQUIREMENTS

### Category Model
```typescript
{
  id: string;              // Unique identifier
  name: string;            // Display name (e.g., "Network Security")
  slug: string;            // URL-friendly (e.g., "network-security")
  description: string;     // Short description
  icon: string;            // Emoji icon (e.g., "🔒")
  color: string;           // Background color for icon box
  parentId: string;        // 'root' for top-level, or parent category ID
  order: number;           // Sort order (lower = first)
  isVisible: boolean;      // Public visibility toggle
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

**Hierarchy Rules**:
- Top-level categories: `parentId = 'root'`
- Subcategories: `parentId = <parent-category-id>`
- Infinite nesting supported
- Only `isVisible = true` shown on public site

### Article Model
```typescript
{
  id: string;              // Unique identifier
  title: string;           // Article title
  slug: string;            // URL-friendly
  content: string;         // Lexical JSON format
  categoryId: string;      // Parent category ID
  status: string;          // 'published' | 'draft'
  author: string;          // Author name/email
  attachments?: Array<{   // Optional file attachments
    fileId: string;
    fileName: string;
    fileKey: string;
    fileSize: number;
    uploadedAt: string;
  }>;
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

**Visibility Rules**:
- Only `status = 'published'` shown publicly
- Admin can see all statuses

### User Model (for admin auth)
```typescript
{
  id: string;
  email: string;
  role: string;            // 'admin' | 'editor' | 'viewer'
  // ... other Amplify auth fields
}
```

---

## 🏗️ ARCHITECTURE UNDERSTANDING

### Public vs Protected Routes

**Public Routes** (No auth required):
- `/` - Homepage with top-level categories
- `/{category-slug}` - Category page
- `/{category-slug}/{subcategory-slug}` - Subcategory page
- `/{...slug}/{article-slug}` - Article page

**Protected Routes** (Auth required):
- `/oc-admin/*` - All admin routes
- Dashboard, category management, article management, user management

### Data Flow

```
┌─────────────────┐
│  DynamoDB Table │ (oc-dynamodb-categories-amplify)
│  Categories     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Amplify Data   │ (amplify/data/resource.ts)
│  Schema         │ Define models & auth rules
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Generated      │ (generateClient from 'aws-amplify/data')
│  Client         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend       │ (React components)
│  Components     │ Fetch & display data
└─────────────────┘
```

### Amplify Gen 2 Pattern
1. Define schema in `amplify/data/resource.ts`
2. Use `a.model()` to define data models
3. Set authorization rules (public read, authenticated write)
4. Import models in `amplify/backend.ts`
5. Frontend uses `generateClient<Schema>()` to interact with data

---

## 🎯 IMPLEMENTATION REQUIREMENTS

### Phase 1: Data Schema Setup
**File**: `amplify/data/resource.ts`

**Tasks**:
1. Remove Todo model (placeholder)
2. Add Category model with all fields
3. Add Article model with all fields
4. Configure authorization:
   - Categories: Public read, authenticated write
   - Articles: Public read (where status='published'), authenticated full access
5. Add necessary indexes for queries:
   - Categories by parentId
   - Articles by categoryId
   - Articles by status

### Phase 2: Frontend Dependencies
**File**: `package.json`

**Install**:
```bash
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
npm install @chakra-ui/icons react-icons
npm install lexical @lexical/react
```

### Phase 3: Theme & Providers Setup
**Files**: `app/theme.ts`, `app/providers.tsx`

**Tasks**:
1. Copy theme.ts from reference (dark mode config)
2. Create providers.tsx with ChakraProvider
3. Update app/layout.tsx to use Providers

### Phase 4: Homepage Implementation
**File**: `app/page.tsx`

**Tasks**:
1. Create Navbar component
2. Implement category grid layout (70% main, 30% sidebar)
3. Fetch categories with `client.models.Category.list()`
4. Filter: `parentId = 'root'` AND `isVisible = true`
5. Sort by order field
6. Render category cards with icon, name, description
7. Add static tutorial cards at bottom
8. Add "Getting Started" sidebar

### Phase 5: Dynamic Category/Article Pages
**File**: `app/[...slug]/page.tsx`

**Tasks**:
1. Implement catch-all route handler
2. Parse slug array from params
3. Build category hierarchy path
4. Distinguish between category page and article page
5. Render appropriate content with breadcrumbs
6. Show subcategories + articles on category pages
7. Show full article content on article pages

### Phase 6: Components
**Create**:
- `components/Navbar.tsx` - Site navigation
- `components/Breadcrumbs.tsx` - Path navigation
- `components/CategoryCard.tsx` - Category display card
- `components/ArticleCard.tsx` - Article preview card
- `components/ArticleContent.tsx` - Lexical content renderer

---

## 🔑 KEY INSIGHTS

### 1. Category Hierarchy
- **Infinite nesting**: Categories can be nested at any depth
- **parentId field**: Links child to parent ('root' for top-level)
- **order field**: Controls display order within same level
- **isVisible field**: Toggles public visibility (admin can hide categories)

### 2. URL Structure
- Clean, SEO-friendly URLs using slugs
- Breadcrumbs built from category path
- Catch-all route handles all depth levels

### 3. Content Display Logic
**Category Pages**:
- Show subcategories first (no label, immediate display)
- Show articles below with "Articles" heading
- Both sorted and filtered

**Article Pages**:
- Full content in Lexical JSON format
- Author and date metadata
- Optional file attachments with download links
- Breadcrumbs include full category path + article title

### 4. Authentication Strategy
- Public site: No auth required
- Admin section: Protected with AuthGuard
- Data rules: Public read for published content, auth required for write/draft

### 5. Responsive Design
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns (categories)
- Sidebar collapses on mobile (full width below main content)

---

## 📦 MIGRATION FROM EXISTING TABLES

User mentioned existing DynamoDB tables:
- `oc-dynamodb-articles-amplify`
- `oc-dynamodb-categories-amplify`
- `oc-dynamodb-users-amplify`

**Strategy**:
1. Define Amplify Gen 2 schema to match existing table structure
2. Use existing table names in schema definition
3. Ensure field names and types match exactly
4. Add necessary GSIs (Global Secondary Indexes) for queries

**OR**

1. Let Amplify Gen 2 create new tables
2. Migrate data from old tables to new ones
3. Update table references

**Need to clarify with user which approach to take.**

---

## ✅ WHAT I UNDERSTAND

1. **Project Type**: Cybersecurity knowledge base portal (like AWS documentation site)
2. **Stack**: Next.js 14 + Amplify Gen 2 + DynamoDB + Chakra UI
3. **Architecture**: Public content site + protected admin CMS
4. **Data Structure**: Hierarchical categories with nested subcategories and articles
5. **Routing**: Dynamic catch-all routes for category/article navigation
6. **Design**: Dark theme with blue accent color (#5294CF)
7. **Content Format**: Articles stored as Lexical JSON
8. **Features**: 
   - Category hierarchy with infinite nesting
   - Visibility controls (isVisible field)
   - Status management (published vs draft)
   - File attachments support
   - Breadcrumb navigation
   - Responsive grid layouts

---

## ❓ QUESTIONS TO CLARIFY

### 1. DynamoDB Table Strategy
Should we:
- a) Connect to existing tables (`oc-dynamodb-*-amplify`) **[DEFAULT ASSUMPTION]**
- b) Create new tables and migrate data later

### 2. Lexical Editor Dependency
Do you want to:
- a) Install Lexical editor packages for article content rendering **[DEFAULT ASSUMPTION]**
- b) Use a simpler markdown/HTML approach for now
- c) Display raw JSON for articles initially

### 3. Authentication Setup
The `amplify/auth/resource.ts` exists. Should we:
- a) Use existing auth configuration as-is **[DEFAULT ASSUMPTION]**
- b) Review/modify auth settings (password policy, MFA, etc.)

### 4. Implementation Approach
Would you prefer:
- a) Bite-size implementation (phase by phase, test as we go) **[DEFAULT ASSUMPTION]**
- b) Complete setup first, then test everything together

---

## 🎯 RECOMMENDED IMPLEMENTATION PLAN

### Bite-Size Phases

**Phase 1: Schema & Backend** (30 min)
- Update `amplify/data/resource.ts` with Category & Article models
- Configure authorization rules
- Deploy and test schema

**Phase 2: Dependencies & Theme** (15 min)
- Install Chakra UI and dependencies
- Set up theme and providers
- Update root layout

**Phase 3: Homepage - Basic Structure** (30 min)
- Create basic Navbar component
- Implement homepage layout structure
- Style with Chakra UI components

**Phase 4: Homepage - Category Display** (30 min)
- Fetch categories from Amplify
- Filter and sort logic
- Render category cards with proper styling

**Phase 5: Homepage - Sidebar & Tutorial Cards** (20 min)
- Add "Getting Started" sidebar
- Add static tutorial cards
- Responsive layout tweaks

**Phase 6: Dynamic Routing Setup** (45 min)
- Create `[...slug]/page.tsx` catch-all route
- Implement category path parsing
- Distinguish category vs article pages

**Phase 7: Category Pages** (30 min)
- Render subcategories grid
- Render articles list
- Add breadcrumbs

**Phase 8: Article Pages** (45 min)
- Render article content
- Add author/date metadata
- File attachments display
- Lexical content renderer

**Phase 9: Component Refinements** (30 min)
- Extract reusable components
- Polish styles and hover effects
- Mobile responsiveness

**Phase 10: Testing & Fixes** (30 min)
- Test all routes
- Fix any bugs
- Verify data display

**Total Estimated Time**: ~5 hours

---

## 🚀 READY TO PROCEED

Once you approve, we'll start with:
1. Updating the data schema in `amplify/data/resource.ts`
2. Installing necessary dependencies
3. Building the homepage structure step-by-step

Each phase will be reviewed before moving to the next one.

