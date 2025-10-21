import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== OculusCyber Knowledge Base Schema =====================================
This schema defines the data models for the cybersecurity knowledge base.
- Categories: Hierarchical structure with parentId for nesting
- Articles: Knowledge base content linked to categories
- Users: Managed by Cognito Auth
=========================================================================*/

const schema = a.schema({
  Category: a
    .model({
      name: a.string().required(),
      slug: a.string().required(),
      description: a.string(),
      icon: a.string(), // Emoji icon
      color: a.string(), // Background color for icon
      parentId: a.string().required(), // 'root' for top-level, or parent category ID
      order: a.integer().default(0), // Sort order
      isVisible: a.boolean().default(true), // Public visibility toggle
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.authenticated().to(['read', 'create', 'update', 'delete'])
    ]),

  Article: a
    .model({
      title: a.string().required(),
      slug: a.string().required(),
      content: a.string().required(), // Lexical JSON format
      categoryId: a.string().required(),
      status: a.string().required(), // 'published' or 'draft'
      author: a.string().required(),
      attachments: a.string(), // JSON array of file attachments
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.authenticated().to(['read', 'create', 'update', 'delete'])
    ]),
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
