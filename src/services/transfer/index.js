const accountRepository = require('../../repositories/account');
const transferRepository = require('../../repositories/transfer');
const logger = require('../../lib/logger')('TRANSFER_SERVICE');

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
      throw new Error('Transfer already created with same idempotency key');
    }

    transferRepository.saveIdempotency(
      sourceAccountId,
      idempotencyKey,
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
    throw new Error('Source account does not exist');
  }

  if (!targetAccount) {
    throw new Error('Target account does not exist');
  }

  if (transferAmount > sourceAccount.balance) {
    throw new Error('Insufficient balance for source account');
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
    throw new Error('Transfer does not exist');
  }

  if (!sourceAccount) {
    throw new Error('Source Account does not exist');
  }

  if (!targetAccount) {
    throw new Error('Target account does not exist');
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
