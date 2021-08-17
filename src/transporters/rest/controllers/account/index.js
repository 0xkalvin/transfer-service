const accountService = require('../../../../services/account');
const { objectToSnakeCase } = require('../../../../lib/object-to-snakecase');

async function create(request) {
  const payload = request.body;

  const createdAccount = await accountService.create({
    balance: payload.balance,
    holderName: payload.holder_name,
    holderDocumentNumber: payload.holder_document_number,
  });

  return {
    statusCode: 201,
    responsePayload: objectToSnakeCase(createdAccount),
  };
}

async function show(request) {
  const accountId = request.params.id;
  const account = await accountService.show(accountId);

  return {
    statusCode: 200,
    responsePayload: objectToSnakeCase(account),
  };
}

async function listTransfers(request) {
  const accountId = request.params.id;
  const transfers = await accountService.listAccountTransfers(accountId);

  return {
    statusCode: 200,
    responsePayload: transfers.map(objectToSnakeCase),
  };
}

module.exports = {
  create,
  listTransfers,
  show,
};
