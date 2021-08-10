const transferService = require('../../../../services/transfer');

async function create(request) {
  const payload = request.body;
  const idempotencyKey = request.header('x-idempotency-key');

  // TODO: add layer to transform controller payload to service payload ?
  const createdTransfer = await transferService.create({
    sourceAccountId: payload.source_account_id,
    targetAccountId: payload.target_account_id,
    transferAmount: payload.amount,
  }, idempotencyKey);

  return {
    statusCode: 201,
    responsePayload: createdTransfer,
  };
}

module.exports = {
  create,
};
