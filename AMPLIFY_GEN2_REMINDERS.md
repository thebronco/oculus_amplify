# Amplify Gen 2 Project Reminders

## 🚨 CRITICAL ARCHITECTURE CONSTRAINTS

### ❌ DO NOT DO:
- Create DynamoDB tables in `amplify/backend.ts` using CDK constructs
- Use Amplify Data models for actual data storage
- Create tables outside of Amplify (manual AWS CLI)

### ✅ CORRECT APPROACH:
- Use **existing DynamoDB tables** directly via AWS SDK
- Access tables through IAM policies in `amplify/backend.ts`
- Only use Amplify Data for minimal placeholder model (required by Gen 2)

## 📋 Current Table Architecture:
- **Categories**: `oc-dynamodb-categories-amplify` (existing)
- **Articles**: `oc-dynamodb-articles-amplify` (existing)  
- **Users**: `oc-dynamodb-users-amplify` (existing)
- **Vulnerabilities**: `oc-dynamodb-vulnerabilities-amplify` (existing)

## 🔧 Implementation Pattern:
1. **Data Access**: Use AWS SDK directly (`@aws-sdk/client-dynamodb`)
2. **IAM Policies**: Define in `amplify/backend.ts` for table access
3. **Schema**: Minimal placeholder model only (required by Amplify Gen 2)
4. **No CDK Table Creation**: Tables exist outside Amplify

## 🎯 Key Files:
- `amplify/data/resource.ts` - Minimal schema with Placeholder model
- `amplify/backend.ts` - IAM policies for existing tables
- `lib/api.ts` - AWS SDK functions for data access
- `scripts/import-vulnerabilities.ts` - Direct DynamoDB access

## ⚠️ Remember:
This project uses **existing DynamoDB tables via AWS SDK**, NOT Amplify Data models!
