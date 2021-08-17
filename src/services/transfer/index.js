const accountRepository = require('../../repositories/account');
const transferRepository = require('../../repositories/transfer');
const { BaseError } = require('../../lib/errors');

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
      throw new BaseError(
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
    throw new BaseError('Source account does not exist', 'LOGIC_INFRACTION');
  }

  if (!targetAccount) {
    throw new BaseError('Target account does not exist', 'LOGIC_INFRACTION');
  }

  if (transferAmount > sourceAccount.balance) {
    throw new BaseError('Insufficient balance for source account', 'LOGIC_INFRACTION');
  }

  const createdTransfer = await transferRepository.create({
    sourceAccountId,
    targetAccountId,
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
    throw new BaseError('Transfer does not exist', 'LOGIC_INFRACTION');
  }

  if (!sourceAccount) {
    throw new BaseError('Source account does not exist', 'LOGIC_INFRACTION');
  }

  if (!targetAccount) {
    throw new BaseError('Target account does not exist', 'LOGIC_INFRACTION');
  }

  const transferAmount = Number(transfer.amount);
  const sourceAccountBalance = Number(sourceAccount.balance);
  const targetAccountBalance = Number(targetAccount.balance);

  if (transferAmount > sourceAccountBalance) {
    throw new BaseError('Insufficient balance for source account', 'LOGIC_INFRACTION');
  }

  const sourceAccountNewBalance = sourceAccountBalance - transferAmount;
  const targetAccountNewBalance = targetAccountBalance + transferAmount;

  // TODO: wrap these updates in a transaction
  const updatedTransfer = await transferRepository.update({
    id: transferId,
  }, {
    status: 'settled',
  });

  const updatedSourceAccount = await accountRepository.update({
    id: sourceAccountId,
  }, {
    balance: sourceAccountNewBalance,
  });

  const updatedTargetAccount = await accountRepository.update({
    id: targetAccountId,
  }, {
    balance: targetAccountNewBalance,
  });

  accountRepository.indexUpdate(updatedSourceAccount);
  accountRepository.indexUpdate(updatedTargetAccount);
  transferRepository.indexUpdate(updatedTransfer);
}

module.exports = {
  create,
  process,
};
