const elasticsearch = require('./elasticsearch');
const kafka = require('./kafka');
const postgres = require('./postgres');
const redis = require('./redis');

module.exports = {
  elasticsearch,
  kafka,
  postgres,
  redis,
};
