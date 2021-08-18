const {
  createHook,
  executionAsyncId,
} = require('async_hooks');

const crypto = require('crypto');

const store = new Map();

const asyncHook = createHook({
  init: (asyncId, _, triggerAsyncId) => {
    if (store.has(triggerAsyncId)) {
      store.set(asyncId, store.get(triggerAsyncId));
    }
  },
  destroy: (asyncId) => {
    if (store.has(asyncId)) {
      store.delete(asyncId);
    }
  },
});

const init = () => asyncHook.enable();

const generateTraceId = () => crypto.randomUUID();

const getTraceId = () => store.get(executionAsyncId());

const saveTraceId = (traceId) => {
  store.set(executionAsyncId(), traceId);
};

module.exports = {
  init,
  generateTraceId,
  getTraceId,
  saveTraceId,
};
