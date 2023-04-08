import "reflect-metadata";

import request from 'supertest';
import app from '../../../src/server';
import redisService from '../../../src/services/redis.service';
import mongoService from '../../../src/services/mongo.service';
import config from '../../../src/config';
import { v4 as uuidV4 } from 'uuid';
import { UrlModel } from '../../../src/models/url.model';
import { User } from '../../../src/interfaces/user.interface';
import { UserModel } from '../../../src/models/user.model';
import { generateToken } from '../../../src/utils/jwt';

describe('URL create short url, API: /url', () => {
  const endpoint = '/url';
  const url = 'www.baidu.com/url';
  let userModel: User;
  let token: string;
  let redisClient: any;

  beforeAll(async () => {
    redisClient = redisService.getClient();
    await redisClient.flushDb('SYNC' as any);
    userModel = await UserModel.create({
      password: '1212',
      username: '12121',
      salt: '1212',
      uid: uuidV4()
    });
    token = await generateToken({ uid: userModel.uid }, 10000, config.get('secretKey'));
  });

  afterAll(async () => {
    await redisClient.flushDb('SYNC' as any);
    await UrlModel.deleteMany({});
    await UserModel.deleteMany({});
    await redisService.disconnect();
    await mongoService.disconnect();
  });

  describe(`[POST] ${endpoint}`, () => {

    it('should failed authentication required', async () => {
      await request(app.getServer())
        .post(endpoint)
        .expect(404);

      await request(app.getServer())
        .post(endpoint)
        .set('Authorization', `Bearer wrong-token`)
        .expect(401);
    });

    it('should successfully create short url use wrong url', async () => {
      await request(app.getServer())
        .post(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .send({
          url: 'baidu.com/<script>alert("hello")</script>'
        }).expect(400);
    });

    it('should successfully create short url use same url', async () => {
      const { body } = await request(app.getServer())
        .post(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .send({
          url: url
        }).expect(200);
      expect(body).toHaveProperty('url');

      const res2 = await request(app.getServer())
        .post(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .send({
          url: url
        }).expect(200);
      expect(res2.body).toMatchObject(body);
    });

  });
});
