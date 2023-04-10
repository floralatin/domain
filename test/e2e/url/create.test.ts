import "reflect-metadata";

import request from 'supertest';
import app from '../../../src/server';
import config from '../../../src/config';
import { generateToken } from '../../../src/utils/jwt';
import teardown from "../teardown";
import setup from "../setup";

describe('API: /url', () => {
  const endpoint = '/url';

  const url = 'www.baidu.com/redirect';
  let token: string;

  beforeAll(async () => {
    await setup();
    token = await generateToken({ uid: '12121' }, 10000, config.get('secretKey'));
  });

  afterAll(async ()=> {
    await teardown();
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

    it("'should successfully create short url use cookies", async () => {
      const url = 'baidu.com/cookies';
      
      const { body } = await request(app.getServer())
        .post('/url')
        .set('Cookie',  [`Authorization=${token}`])
        .send({
          url: url
        }).expect(200);
      
      expect(body).toHaveProperty('url');
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
