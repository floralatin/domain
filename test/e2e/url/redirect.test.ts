import "reflect-metadata";

import request from 'supertest';
import app from '../../../src/server';
import urlService from '../../../src/services/url.service';
import { Url } from '../../../src/interfaces/url.interface';
import { UrlModel } from '../../../src/models/url.model';
import mongoService from "../../../src/services/mongo.service";
import redisService from "../../../src/services/redis.service";
import { RATE_LIMIT_MAX_REQUESTS, DAILY_TOTAL_LIMIT_MAX_REQUESTS, RATE_LIMIT_BLACKLIST_EXPIRE } from "../../../src/middlewares/black.middleware";


describe('Redirect to origin url, API: /:code', () => {
  const endpoint = '/';
  const url = 'www.baidu.com';
  let urlModel: Url;
  const user = {
    uid: '12121212121',
  };
  let redisClient: any;

  beforeAll(async () => {
    urlModel = await urlService.createByOption(url, user.uid, {});
    redisClient = redisService.getClient();
    await redisClient.flushDb('SYNC' as any);
  });

  beforeEach(async()=> {
    await redisClient.flushDb('SYNC' as any);
  });

  afterEach(async()=> {
    await redisClient.flushDb('SYNC' as any);
  });

  afterAll(async () => {
    await UrlModel.deleteOne({ uid: urlModel.uid });
    await mongoService.disconnect();
    await redisClient.flushDb('SYNC' as any);
    await redisService.disconnect();
  });

  describe(`[GET] ${endpoint}:code`, () => {
    it('should successfully get origin url success from db', async () => {
      await request(app.getServer())
        .get(`${endpoint}${urlModel.code}`)
        .expect(302);
    });

    it('should successfully get origin url from redis', async () => {
      await request(app.getServer())
        .get(`${endpoint}${urlModel.code}`)
        .expect(302);
    });

    it('should failed the code does not existed', async () => {
      await request(app.getServer())
        .get(`${endpoint}1a1d`)
        .expect(404);
    });

    it('should failed the code is wrong', async () => {
      await request(app.getServer())
        .get(`${endpoint}2!1321`)
        .expect(400);
    });

    it('should failed the code length > 8', async () => {
      await request(app.getServer())
        .get(`${endpoint}1232111321`)
        .expect(400);
    });

    it('should forbidden too many request the same ip in the same time', async () => {
      const promises: Promise<any>[] = [];
      for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS+1; i++) {
        promises.push(request(app.getServer()).get(`${endpoint}${urlModel.code}`).timeout(10000).then(response => response.body));
      }
      const results = await Promise.all(promises);
      const errorResult = results.find(body => body.status === 429);
      expect(errorResult).toBeUndefined();

      const result = await request(app.getServer()).get(`${endpoint}${urlModel.code}`);
      expect(result.body.status).toBe(403);
    });


    it('should forbidden too many request max daily total count', async () => {
      const key = '::ffff:127.0.0.1:undefined';
      await redisClient.set( redisService.getKey(`requests:total:${key}`), DAILY_TOTAL_LIMIT_MAX_REQUESTS, {
        EX: RATE_LIMIT_BLACKLIST_EXPIRE,
        NX: true,
      });
      const result = await request(app.getServer()).get(`${endpoint}${urlModel.code}`);
      expect(result.body.status).toBe(429);
    });

  });
  
});
