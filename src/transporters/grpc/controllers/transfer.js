const transferService = require('../../../services/transfer');

async function Create({ request }) {
  const createdTransfer = await transferService.create({
    sourceAccountId: request.source_account_id,
    targetAccountId: request.target_account_id,
    transferAmount: request.amount,
  });

  return createdTransfer;
}

module.exports = {
  Create,
};
