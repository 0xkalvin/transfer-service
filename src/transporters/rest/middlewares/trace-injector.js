const tracer = require('../../../lib/tracer');

function traceInjector(request, _, next) {
  const traceId = request.header('x-trace-id') || tracer.generateTraceId();

  tracer.saveTraceId(traceId);

  next();
}

module.exports = traceInjector;
