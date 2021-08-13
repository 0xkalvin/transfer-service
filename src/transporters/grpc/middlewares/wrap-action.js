const grpc = require('@grpc/grpc-js');

const logger = require('../../../lib/logger')('WRAP_ACTION');
const { BusinessError } = require('../../../lib/business-errors');

const businessErrorsToGRPCErrorsMap = new Map([
  ['CONFLICT_ERROR', grpc.status.ALREADY_EXISTS],
  ['LOGIC_INFRACTION', grpc.status.FAILED_PRECONDITION],
]);

function getGRPCStatusCode(error) {
  if (error instanceof BusinessError) {
    const grpcStatus = businessErrorsToGRPCErrorsMap.get(error.type);

    return grpcStatus;
  }

  return grpc.status.INTERNAL;
}

function wrapAction(action) {
  return async function wrap(call, callback) {
    const startTime = Date.now();

    try {
      const result = await action(call);

      callback(null, result);

      logger.info({
        message: 'Request ended',
        latency: Date.now() - startTime,
        path: call.call.handler.path,
        type: call.call.handler.type,
      });
    } catch (error) {
      const grpcStatusCode = getGRPCStatusCode(error);

      callback({
        message: error.message,
        code: grpcStatusCode,
      }, null);

      logger.error({
        message: 'Request failed',
        latency: Date.now() - startTime,
        path: call.call.handler.path,
        type: call.call.handler.type,
        code: grpcStatusCode,
        error_message: error.message,
        error_stack: error.stack,
      });
    }
  };
}

module.exports = wrapAction;
