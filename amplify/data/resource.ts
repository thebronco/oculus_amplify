import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== OculusCyber Knowledge Base Schema =====================================
NOTE: This project uses EXISTING DynamoDB tables directly via AWS SDK.
We do NOT create tables via Amplify Data models.
- Categories: oc-dynamodb-categories-amplify (existing table)
- Articles: oc-dynamodb-articles-amplify (existing table)
- Users: oc-dynamodb-users-amplify (existing table)
Access is managed via IAM policies in amplify/backend.ts
=========================================================================*/

// Empty schema - we use existing DynamoDB tables directly
const schema = a.schema({});

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
