const {
  SQS_ENDPOINT,
  SQS_REGION,
} = process.env;

module.exports = {
  defaultSettings: {
    endpoint: SQS_ENDPOINT,
    region: SQS_REGION,
  },
};
