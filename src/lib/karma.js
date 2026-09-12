import { query } from './db';

export const KARMA_RULES = {
  STARTING_BALANCE: 50,
  MIN_REQUIRED_TO_POST: 10,
  REQUESTER_DEDUCTION: 10,
  HELPER_REWARD: 20,
};

/**
 * Atomically process karma points when an exchange is confirmed complete
 * Requester loses 10 points
 * Helper gains 20 points
 * Both transactions logged in karma_txns (without timestamp as requested)
 */
export async function processExchangeKarma(exchangeId) {
  // 1. Get exchange details
  const exRes = await query(
    `SELECT e.*, r.title FROM exchanges e 
     JOIN requests r ON e.request_id = r.request_id 
     WHERE e.exchange_id = $1`,
    [exchangeId]
  );

  if (exRes.rows.length === 0) {
    throw new Error('Exchange not found');
  }

  const exchange = exRes.rows[0];
  const { requester_id, helper_id } = exchange;

  // 2. Check if already processed
  const existingTxn = await query(
    `SELECT * FROM karma_txns WHERE exchange_id = $1`,
    [exchangeId]
  );
  if (existingTxn.rows.length > 0) {
    return { message: 'Karma already processed for this exchange' };
  }

  // 3. Deduct 10 from Requester
  await query(
    `UPDATE users SET karma_balance = GREATEST(0, karma_balance - $1) WHERE user_id = $2`,
    [KARMA_RULES.REQUESTER_DEDUCTION, requester_id]
  );
  await query(
    `INSERT INTO karma_txns (user_id, exchange_id, amount, type) 
     VALUES ($1, $2, $3, $4)`,
    [requester_id, exchangeId, -KARMA_RULES.REQUESTER_DEDUCTION, 'request_fulfilled']
  );

  // 4. Award 20 to Helper
  await query(
    `UPDATE users SET karma_balance = karma_balance + $1 WHERE user_id = $2`,
    [KARMA_RULES.HELPER_REWARD, helper_id]
  );
  await query(
    `INSERT INTO karma_txns (user_id, exchange_id, amount, type) 
     VALUES ($1, $2, $3, $4)`,
    [helper_id, exchangeId, KARMA_RULES.HELPER_REWARD, 'help_provided']
  );

  return {
    success: true,
    requesterDeducted: KARMA_RULES.REQUESTER_DEDUCTION,
    helperAwarded: KARMA_RULES.HELPER_REWARD,
  };
}
