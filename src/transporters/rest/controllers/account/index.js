const accountService = require('../../../../services/account');

async function create(request) {
  const payload = request.body;

  const createdAccount = await accountService.create(payload);

  return {
    statusCode: 201,
    responsePayload: createdAccount,
  };
}

async function show(request) {
  const accountId = request.params.id;
  const account = await accountService.show(accountId);

  return {
    statusCode: 200,
    responsePayload: account,
  };
}

async function listTransfers(request) {
  const accountId = request.params.id;
  const transfers = await accountService.listAccountTransfers(accountId);

  return {
    statusCode: 200,
    responsePayload: transfers,
  };
}

module.exports = {
  create,
  listTransfers,
  show,
};
