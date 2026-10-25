import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { logToDynamoDB } from '@/lib/dynamodb';

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      reported_user_id,
      reason,
      category,
      details,
      reported_user_name,
    } = body;

    const targetUserId = reported_user_id || body.reportedUserId || body.targetUserId;
    const reportReason = reason || body.description || details;

    if (!targetUserId || !reportReason) {
      return NextResponse.json({ error: 'Target user ID and reason are required' }, { status: 400 });
    }

    const parsedTargetId = parseInt(targetUserId, 10);
    if (parsedTargetId === user.user_id) {
      return NextResponse.json({ error: 'You cannot report yourself' }, { status: 400 });
    }

    // 1. Fetch reported user's name & email from database if not already provided
    let reportedUserName = reported_user_name || body.reportedUser || `User #${parsedTargetId}`;
    let reportedUserEmail = '';
    try {
      const targetRes = await query('SELECT user_id, name, email FROM users WHERE user_id = $1', [parsedTargetId]);
      if (targetRes.rows.length > 0) {
        reportedUserName = targetRes.rows[0].name;
        reportedUserEmail = targetRes.rows[0].email;
      }
    } catch (dbErr) {
      console.warn('Could not query target user details:', dbErr.message);
    }

    const reportedUserDisplay = reportedUserEmail
      ? `${reportedUserName} (${reportedUserEmail})`
      : reportedUserName;

    const reporterEmailDisplay = user.name
      ? `${user.name} (${user.email})`
      : (user.email || body.reporterEmail || 'Anonymous Student');

    const reportCategory = category || body.type || 'Dispute Report';
    const reportDetails = details || body.description || reportReason;

    // 2. Insert into the local database (preserving existing DB structure & moderation records)
    const dbReason = category ? `[${reportCategory}] ${reportReason}` : reportReason;
    const repRes = await query(
      `INSERT INTO reports (reported_by_id, reported_user_id, reason, status, created_date)
       VALUES ($1, $2, $3, 'pending', CURRENT_DATE) RETURNING *`,
      [user.user_id, parsedTargetId, dbReason.trim()]
    );

    // 3. Map project field names to what the AWS Python Lambda function expects
    const lambdaPayload = {
      reporterEmail: reporterEmailDisplay,
      reportedUser: reportedUserDisplay,
      category: reportCategory,
      reason: reportReason,
      details: reportDetails,
    };

    // 4. Trigger the standalone AWS Lambda microservice via API Gateway
    const awsApiGatewayUrl =
      process.env.AWS_API_GATEWAY_URL ||
      process.env.AWS_REPORT_WEBHOOK_URL ||
      'https://YOUR_API_GATEWAY_URL/ProcessCampusDispute';

    if (awsApiGatewayUrl && !awsApiGatewayUrl.includes('YOUR_API_GATEWAY_URL')) {
      fetch(awsApiGatewayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lambdaPayload),
      }).catch((err) => console.error('AWS SNS Alert Error:', err));
    } else {
      console.log('[AWS SNS Alert] Prepared Lambda payload:', lambdaPayload);
      console.warn('[AWS SNS Alert] Set AWS_API_GATEWAY_URL in .env.local to dispatch live AWS notifications.');
    }

    // 5. Store dispute audit record in AWS DynamoDB
    logToDynamoDB({
      report_id: repRes.rows[0]?.report_id || Date.now(),
      reported_by: reporterEmailDisplay,
      reported_user: reportedUserDisplay,
      category: reportCategory,
      reason: reportReason,
    }).catch((err) => console.warn('[DynamoDB] Background write skipped:', err.message));

    return NextResponse.json({
      success: true,
      message: 'Report submitted & admin alerted.',
      report: repRes.rows[0],
    });
  } catch (error) {
    console.error('Report submission error:', error);
    return NextResponse.json({ error: 'Failed to submit report: ' + error.message }, { status: 500 });
  }
}
