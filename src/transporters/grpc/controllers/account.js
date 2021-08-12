const accountService = require('../../../services/account');

async function Create({ request }, callback) {
  try {
    const createdAccount = await accountService.create(request);

    return callback(null, createdAccount);
  } catch (error) {
    return callback(error, null);
  }
}

async function Show({ request }, callback) {
  try {
    const accountId = request.id;
    const account = await accountService.show(accountId);

    return callback(null, account);
  } catch (error) {
    return callback(error, null);
  }
}

async function ListTransfers({ request }, callback) {
  try {
    const accountId = request.account_id;
    const transfers = await accountService.listAccountTransfers(accountId);

    return callback(null, transfers);
  } catch (error) {
    return callback(error, null);
  }
}

module.exports = {
  Create,
  ListTransfers,
  Show,
};
