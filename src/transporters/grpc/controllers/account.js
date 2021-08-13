const accountService = require('../../../services/account');

async function Create({ request }) {
  const createdAccount = await accountService.create(request);

  return createdAccount;
}

async function Show({ request }) {
  const accountId = request.id;
  const account = await accountService.show(accountId);

  return account;
}

async function ListTransfers({ request }) {
  const accountId = request.account_id;
  const transfers = await accountService.listAccountTransfers(accountId);

  return transfers;
}

module.exports = {
  Create,
  ListTransfers,
  Show,
};
