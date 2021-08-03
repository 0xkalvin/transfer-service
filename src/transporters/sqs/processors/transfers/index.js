const transferService = require('../../../../services/transfer');
const logger = require('../../../../lib/logger')('TRANSFER_SQS_PROCESSOR');

async function create(event) {
  const { payload } = event;

  const createdTransfer = await transferService.create({
    sourceAccountId: payload.source_account_id,
    targetAccountId: payload.target_account_id,
    transferAmount: payload.amount,
  });

  logger.info({
    message: 'Created transfer successfully',
    transfer_id: createdTransfer.id,
  });
}

module.exports = {
  create,
};
