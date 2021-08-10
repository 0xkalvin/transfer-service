const accountRepository = require('../../repositories/account');
const transferRepository = require('../../repositories/transfer');
const logger = require('../../lib/logger')('TRANSFER_SERVICE');
const { BusinessError } = require('../../lib/business-errors');

async function create(payload, idempotencyKey = null) {
  const {
    sourceAccountId,
    targetAccountId,
    transferAmount,
  } = payload;

  if (idempotencyKey) {
    const alreadyExists = await transferRepository.checkIdempotency(
      sourceAccountId,
      idempotencyKey,
    );

    if (alreadyExists) {
      throw new BusinessError(
        'Transfer already created with same idempotency key', 'CONFLICT_ERROR',
      );
    }

    const expiresInSeconds = 60 * 60 * 24;

    transferRepository.saveIdempotency(
      sourceAccountId,
      idempotencyKey,
      expiresInSeconds,
    );
  }

  const [sourceAccount, targetAccount] = await Promise.all([
    accountRepository.findById(sourceAccountId, {
      attributes: ['id', 'balance'],
    }),
    accountRepository.findById(targetAccountId, {
      attributes: ['id'],
    })]);

  if (!sourceAccount) {
    throw new BusinessError('Source account does not exist', 'LOGIC_INFRACTION');
  }

  if (!targetAccount) {
    throw new BusinessError('Target account does not exist', 'LOGIC_INFRACTION');
  }

  if (transferAmount > sourceAccount.balance) {
    throw new BusinessError('Insufficient balance for source account', 'LOGIC_INFRACTION');
  }

  const createdTransfer = await transferRepository.create({
    source_account_id: sourceAccountId,
    target_account_id: targetAccountId,
    amount: transferAmount,
  });

  transferRepository.enqueue({
    transferId: createdTransfer.id,
    sourceAccountId,
    targetAccountId,
  });

  transferRepository.index(createdTransfer);

  return createdTransfer;
}

async function process(payload) {
  const {
    sourceAccountId,
    targetAccountId,
    transferId,
  } = payload;

  const [
    transfer,
    sourceAccount,
    targetAccount,
  ] = await Promise.all([
    transferRepository.findById(transferId, {
      attributes: ['id', 'status', 'amount'],
    }),
    accountRepository.findById(sourceAccountId, {
      attributes: ['id', 'balance'],
    }),
    accountRepository.findById(targetAccountId, {
      attributes: ['id', 'balance'],
    }),
  ]);

  if (!transfer) {
    throw new BusinessError('Transfer does not exist', 'LOGIC_INFRACTION');
  }

  if (!sourceAccount) {
    throw new BusinessError('Source account does not exist', 'LOGIC_INFRACTION');
  }

  if (!targetAccount) {
    throw new BusinessError('Target account does not exist', 'LOGIC_INFRACTION');
  }

  const sourceAccountNewBalance = Number(sourceAccount.balance) - Number(transfer.amount);
  const targetAccountNewBalance = Number(targetAccount.balance) + Number(transfer.amount);

  // TODO: wrap these updates in a transaction
  await transferRepository.update({
    id: transferId,
  }, {
    status: 'settled',
  });

  await accountRepository.update({
    id: sourceAccountId,
  }, {
    balance: sourceAccountNewBalance,
  });

  await accountRepository.update({
    id: targetAccountId,
  }, {
    balance: targetAccountNewBalance,
  });

  logger.info({
    message: 'Tranfer successfully settled',
    transfer_id: transferId,
    source_account_id: sourceAccountId,
    target_account_id: targetAccountId,
    amount: transfer.amount,
  });
}

module.exports = {
  create,
  process,
};
