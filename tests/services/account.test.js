const { create } = require('../../src/services/account');
const {
  postgres,
  elasticsearch,
  redis,
  kafka,
} = require('../../src/data-sources');

jest.useFakeTimers();

describe('Account Service', () => {
  beforeAll(async () => {
    await Promise.all([
      postgres.connect(),
      elasticsearch.connect(),
      redis.connect(),
      kafka.producer.connect(),
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      postgres.disconnect(),
      elasticsearch.disconnect(),
      redis.disconnect(),
      kafka.producer.disconnect(),
    ]);
  });

  describe('create function', () => {
    describe('When passing a valid payload', () => {
      test('should create an account successfully', async () => {
        const payload = {
          balance: 1200,
          holderName: 'Darth Vader',
          holderDocumentNumber: '123456789',
        };

        const result = await create(payload);

        expect(result).toMatchObject({
          id: expect.any(String),
          balance: 1200,
          holderName: 'Darth Vader',
          holderDocumentNumber: '123456789',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
    });
  });
});
