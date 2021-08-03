const logger = require('../../lib/logger')('SQS_TRANSPORTER');
const processors = require('./processors');

const eventProcessorMap = new Map([
  [
    'transfer_creation',
    processors.transferProcessors.create,
  ],
]);

async function processEvent({ Body: body }) {
  const event = JSON.parse(body);
  const { name } = event;

  if (!name) {
    return;
  }

  try {
    const processor = eventProcessorMap.get(name);

    if (!processor) {
      throw new Error('There is no processor for this event');
    }

    await processor(event);
  } catch (error) {
    logger.error({
      message: 'Failed to process SQS event',
      event_name: name,
      error_message: error.message,
      error_stack: error.stack,
    });

    throw error;
  }
}

module.exports = {
  processEvent,
};
