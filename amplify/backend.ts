import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { Policy, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
});

// Add permissions for unauthenticated users to read existing DynamoDB tables
const { unauthenticatedUserIamRole } = backend.auth.resources;

const dynamoDBReadPolicy = new Policy(backend.auth.resources.authenticatedUserIamRole.stack, 'ExistingDynamoDBReadPolicy', {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'dynamodb:GetItem',
        'dynamodb:Query',
        'dynamodb:Scan',
      ],
      resources: [
        'arn:aws:dynamodb:us-east-1:*:table/oc-dynamodb-categories-amplify',
        'arn:aws:dynamodb:us-east-1:*:table/oc-dynamodb-articles-amplify',
        'arn:aws:dynamodb:us-east-1:*:table/oc-dynamodb-users-amplify',
      ],
    })
  ],
});

unauthenticatedUserIamRole.attachInlinePolicy(dynamoDBReadPolicy);
