import "reflect-metadata";

import request from 'supertest';
import app from '../../../src/server';
import mongoService from "../../../src/services/mongo.service";
import redisService from "../../../src/services/redis.service";

describe('Health check', () => {
  const endpoint = '/ping';
  let redisClient: any;

  beforeAll(async() => {
    redisClient = redisService.getClient();
    await redisClient.flushDb('SYNC' as any);
  });   

  afterAll(async () => {
    await redisClient.flushDb('SYNC' as any);
    await mongoService.disconnect();
    await redisService.disconnect();
  });

  describe(`[GET] ${endpoint}`, () => {

    it('should ping is true', async () => {
      const { body } = await request(app.getServer())
        .get(endpoint)
        .expect(200);
      expect(body).toEqual('pong');
    });

    it('should forbidden too many request in the same time', async () => {
      const promises: Promise<any>[] = [];
      for (let i = 0; i < 140; i++) {
        promises.push(request(app.getServer()).get(`${endpoint}`).timeout(10000).then(response => response.body));
      }
      const results = await Promise.all(promises);
      const errorResult = results.find(body => body.status === 429);
      expect(errorResult).toBeUndefined();

    }, 10000);
   
  });
});
