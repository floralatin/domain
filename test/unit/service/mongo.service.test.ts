import "reflect-metadata";
import mongoService from '../../../src/services/mongo.service';

describe('Service: mongoService', () => {

  jest.mock('../../../src/utils/logger', () => ({
    logger: {
      info: jest.fn(),
      error: jest.fn(),
    },
  }));

  beforeEach(async () => {
    // Disconnect from the mock MongoDB database
    await mongoService.disconnect();
  });

  afterAll(async () => {
    await mongoService.disconnect();
  });

  describe('connect()', () => {
    it('should connect to the MongoDB database', async () => {
      await mongoService.connect();
      expect(mongoService.ready).toBe(true);
    });
  });

  describe('disconnect()', () => {
    it('should disconnect from the MongoDB database', async () => {
      await mongoService.connect();

      expect(mongoService.ready).toBe(true);

      await mongoService.disconnect();

      expect(mongoService.ready).toBe(false);
    });
  });

});
