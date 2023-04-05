import "reflect-metadata";

import request from 'supertest';
import app from '../../../src/server';
import urlService from '../../../src/services/url.service';
import { Url } from '../../../src/interfaces/url.interface';
import { UrlModel } from '../../../src/models/url.model';


describe('Redirect to origin url, API: /:code', () => {
  const endpoint = '/';
  const url = 'www.baidu.com';
  let urlModel: Url;

  beforeAll(async () => {
    urlModel = await urlService.createByOption(url, {});
  });

  afterAll(async () => {
    await UrlModel.deleteOne({ uid: urlModel.uid });
  });

  describe(`[GET] ${endpoint}:code`, () => {
    it('get origin url success', async () => {
      await request(app.getServer())
        .get(`${endpoint}${urlModel.code}`)
        .expect(302);
    });

    it('get origin url success second', async () => {
      await request(app.getServer())
        .get(`${endpoint}${urlModel.code}`)
        .expect(302);
    });

    it('get origin url failed code not existed', async () => {
      await request(app.getServer())
        .get(`${endpoint}1a1d`)
        .expect(404);
    });

    it('get origin url failed code wrong', async () => {
      await request(app.getServer())
        .get(`${endpoint}2!1321`)
        .expect(400);
    });

    it('get origin url failed code length > 8', async () => {
      await request(app.getServer())
        .get(`${endpoint}1232111321`)
        .expect(400);
    });

  });
  
});
