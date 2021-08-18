const { create } = require('../../src/services/transfer');
const {
  postgres,
  elasticsearch,
  redis,
  kafka,
} = require('../../src/data-sources');

jest.useFakeTimers();

describe('Transfer Service', () => {
  beforeAll(async () => {
    await Promise.all([
      postgres.connect(),
      elasticsearch.connect(),
      redis.connect(),
      kafka.producer.connect(),
    ]);
  });

  describe('create function', () => {
    describe('When passing a valid payload', () => {
      let sourceAccountId;
      let targetAccountId;

      beforeAll(async () => {
        const { Account } = postgres.connectionPool.models;

        const result = await Promise.all([
          Account.create({
            balance: 1200,
            holderName: 'Darth Vader',
            holderDocumentNumber: '123456789',
          }),
          Account.create({
            balance: 0,
            holderName: 'Luke Skywalker',
            holderDocumentNumber: '123456788',
          }),
        ]);

        sourceAccountId = result[0].id;
        targetAccountId = result[1].id;
      });

      test('should create an transfer successfully', async () => {
        const result = await create({
          sourceAccountId,
          targetAccountId,
          transferAmount: 1000,
        });

        expect(result).toMatchObject({
          id: expect.any(String),
          amount: 1000,
          status: 'processing',
          sourceAccountId,
          targetAccountId,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
    });
  });
});
