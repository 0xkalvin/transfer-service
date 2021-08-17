const elasticsearch = require('./elasticsearch');
const kafka = require('./kafka');
const postgres = require('./postgres');
const redis = require('./redis');
const sqs = require('./sqs');

module.exports = {
  elasticsearch,
  kafka,
  postgres,
  redis,
  sqs,
};
