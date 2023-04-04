import request from 'supertest';
import app from '../../../src/server';
import urlService from '../../../src/services/url.service';
import { Url } from '../../../src/interfaces/url.interface';
import { User } from '../../../src/interfaces/user.interface';
import { UserModel } from '../../../src/models/user.model';
import { UrlModel } from '../../../src/models/url.model';
import { generateToken } from '../../../src/utils/jwt';
import config from '../../../src/config';
import { v4 as uuidV4 } from 'uuid';

describe('URL create short url, API: /url', () => {
  const endpoint = '/url';
  const url = 'www.baidu.com/url';
  let urlModel: Url;
  let userModel: User;
  let token: string;

  beforeAll(async () => {
    urlModel = await urlService.createByOption(url, {});
    userModel = await UserModel.create({
      password: '1212',
      username: '12121',
      uid: uuidV4()
    });
    token = await generateToken({ uid: userModel.uid }, 10000, config.get('secretKey'));
  });

  afterAll(async () => {
    await UrlModel.deleteOne({ uid: urlModel.uid });
    await UserModel.deleteOne({ uid: userModel.uid });
  });

  describe(`[POST] ${endpoint}`, () => {

    it('authentication required', async () => {
      await request(app.getServer())
        .post(endpoint)
        .expect(404);

      await request(app.getServer())
        .post(endpoint)
        .set('Authorization', `Bearer wrong-token`)
        .send({
          url: url
        })
        .expect(401);
    });

    it('create short url use wrong url', async () => {
      await request(app.getServer())
        .post(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .send({
          url: 'baidu.com/<script>alert("hello")</script>'
        }).expect(400);
    });

    it('create short url use same url', async () => {
      const { body } = await request(app.getServer())
        .post(endpoint)
        .set('Authorization', `Bearer ${token}`)
        .send({
          url: url
        }).expect(200);
      expect(body).toHaveProperty('shortUrl');

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
