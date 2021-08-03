const { Kafka } = require('kafkajs');
const config = require('./config')[process.env.NODE_ENV];

const kafkaClient = new Kafka(config);

module.exports = kafkaClient;
