const {
  SQSClient,
} = require('@aws-sdk/client-sqs');

const config = require('./config');

const sqs = new SQSClient(config.defaultSettings);

module.exports = sqs;
