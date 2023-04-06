import "reflect-metadata";

import request from 'supertest';
import app from '../../../src/server';
import mongoService from "../../../src/services/mongo.service";
import redisService from "../../../src/services/redis.service";

describe('Health check', () => {
  const endpoint = '/ping';

  afterAll(async () => {
    await mongoService.disconnect();
    await redisService.disconnect();
  });

  describe(`[GET] ${endpoint}`, () => {

    it('ping is true', async () => {
      const { body } = await request(app.getServer())
        .get(endpoint)
        .expect(200);
      expect(body).toEqual('pong');
    });
   
  });
});
