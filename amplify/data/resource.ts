import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== OculusCyber Knowledge Base Schema =====================================
NOTE: This project uses EXISTING DynamoDB tables directly via AWS SDK.
We do NOT create tables via Amplify Data models.
- Categories: oc-dynamodb-categories-amplify (existing table)
- Articles: oc-dynamodb-articles-amplify (existing table)
- Users: oc-dynamodb-users-amplify (existing table)
- Vulnerabilities: oc-dynamodb-vulnerabilities-amplify (existing table)
Access is managed via IAM policies in amplify/backend.ts

This schema contains a minimal placeholder model required by Amplify Gen 2.
The actual data is stored in existing DynamoDB tables accessed via AWS SDK.
=========================================================================*/

const schema = a.schema({
  // Minimal placeholder model required by Amplify Gen 2
  // This project uses existing DynamoDB tables directly via AWS SDK
  // All data access is handled through IAM policies in amplify/backend.ts
  Placeholder: a
    .model({
      id: a.id().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
