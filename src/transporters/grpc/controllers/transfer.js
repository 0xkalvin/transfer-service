const transferService = require('../../../services/transfer');

async function Create({ request }, callback) {
  try {
    const createdTransfer = await transferService.create({
      sourceAccountId: request.source_account_id,
      targetAccountId: request.target_account_id,
      transferAmount: request.amount,
    });

    return callback(null, createdTransfer);
  } catch (error) {
    return callback(error, null);
  }
}

module.exports = {
  Create,
};
