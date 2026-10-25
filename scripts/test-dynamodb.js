// ==============================================================================
// AWS DynamoDB Integration Verification Script
// P2P Student Micro-Lending Network
// ==============================================================================

const fs = require('fs');
const path = require('path');

// Manually load .env.local if present
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const region = process.env.AWS_REGION || 'us-east-1';
const tableName = process.env.DYNAMODB_TABLE_NAME || 'p2p_disputes_audit';

console.log('\n======================================================');
console.log('⚡ AWS DYNAMODB INTEGRATION TEST');
console.log('======================================================');
console.log(`Region:     ${region}`);
console.log(`Table Name: ${tableName}`);
console.log(`AWS Key ID: ${process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.substring(0, 6) + '...' : '(Not set in .env.local)'}`);
console.log('======================================================\n');

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.log('ℹ️  AWS Credentials not detected in .env.local.');
  console.log('   The application is running in Graceful Fallback Mode.');
  console.log('   To connect to live AWS DynamoDB, add:');
  console.log('     AWS_ACCESS_KEY_ID=your_key');
  console.log('     AWS_SECRET_ACCESS_KEY=your_secret');
  console.log('     AWS_REGION=us-east-1');
  console.log('   into your .env.local file.\n');
  process.exit(0);
}

const rawClient = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(rawClient);

async function ensureTableExists() {
  try {
    await rawClient.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`✅ Table "${tableName}" already exists in ${region}.`);
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') {
      console.log(`⚠️  Table "${tableName}" not found. Creating table automatically...`);
      await rawClient.send(new CreateTableCommand({
        TableName: tableName,
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' }
        ],
        BillingMode: 'PAY_PER_REQUEST',
      }));
      console.log(`⏳ Table creation requested. Waiting 5s for activation...`);
      await new Promise(r => setTimeout(r, 5000));
      console.log(`✅ Table "${tableName}" created successfully.`);
    } else {
      throw err;
    }
  }
}

async function run() {
  try {
    await ensureTableExists();

    const testId = `TEST_${Date.now()}`;
    console.log(`📝 Writing test record with id: ${testId}...`);

    await docClient.send(new PutCommand({
      TableName: tableName,
      Item: {
        id: testId,
        category: 'Dispute Audit Test',
        reason: 'Automated DynamoDB integration verification',
        reported_by: 'test@vitstudent.ac.in',
        reported_user: 'target@vitstudent.ac.in',
        timestamp: new Date().toISOString(),
      },
    }));
    console.log('✅ Write (PutCommand) successful!');

    console.log('🔍 Reading record back (GetCommand)...');
    const res = await docClient.send(new GetCommand({
      TableName: tableName,
      Key: { id: testId },
    }));

    if (res.Item && res.Item.id === testId) {
      console.log('✅ Read verified! Record fetched:', JSON.stringify(res.Item, null, 2));
      console.log('\n🎉 AWS DynamoDB is fully connected and working perfectly!\n');
    } else {
      console.error('❌ Failed to retrieve the written record.');
    }
  } catch (err) {
    console.error('❌ DynamoDB Test Error:', err.message);
  }
}

run();
