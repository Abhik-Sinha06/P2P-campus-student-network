import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const region = process.env.AWS_REGION || 'us-east-1';

// Initialize low-level client
const rawClient = new DynamoDBClient({
  region,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined, // Uses default AWS credential chain (IAM roles/AWS CLI) if not explicitly passed
});

// Document client for native JS objects
export const docClient = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const AUDIT_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'p2p_disputes_audit';

/**
 * Log an audit record to DynamoDB (Zero-breaking: catches and warns if AWS credentials are not set)
 */
export async function logToDynamoDB(item) {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_PROFILE) {
      console.log('[DynamoDB Mock Log] Saved audit record locally (Set AWS_ACCESS_KEY_ID to write live to AWS):', item);
      return { success: true, mocked: true };
    }

    const command = new PutCommand({
      TableName: AUDIT_TABLE_NAME,
      Item: {
        id: item.id || `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        ...item,
      },
    });

    await docClient.send(command);
    console.log('[DynamoDB] Successfully logged record to', AUDIT_TABLE_NAME);
    return { success: true };
  } catch (error) {
    console.warn('[DynamoDB Warning] Failed to log to DynamoDB:', error.message);
    return { success: false, error: error.message };
  }
}

export { PutCommand, ScanCommand, QueryCommand, GetCommand };
