const accountRepository = require('../../repositories/account');
const transferRepository = require('../../repositories/transfer');
const { BaseError } = require('../../lib/errors');
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

  logger.debug({
    message: 'Transfer created successfully',
    transfer_id: createdTransfer.id,
    source_account_id: sourceAccountId,
    target_account_id: targetAccountId,
    idempotency_key: idempotencyKey,
  });

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

  if (transferAmount > sourceAccountBalance) {
    throw new BaseError('Insufficient balance for source account', 'LOGIC_INFRACTION');
  }

  const [
    updatedTransfer,
    updatedSourceAccount,
    updatedTargetAccount,
  ] = await transferRepository.settle({
    transferId,
    sourceAccountId,
    targetAccountId,
    amount: transferAmount,
  });

  accountRepository.indexUpdate(updatedSourceAccount);
  accountRepository.indexUpdate(updatedTargetAccount);
  transferRepository.indexUpdate(updatedTransfer);

  logger.debug({
    message: 'Transfer processed successfully',
    transfer_id: transferId,
    source_account_id: sourceAccountId,
    target_account_id: targetAccountId,
  });
}

module.exports = {
  create,
  process,
};
