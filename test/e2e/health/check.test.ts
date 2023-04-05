import "reflect-metadata";

import request from 'supertest';
import app from '../../../src/server';

describe('Health check', () => {
  const endpoint = '/ping';

  describe(`[GET] ${endpoint}`, () => {

    it('ping is true', async () => {
      const { body } = await request(app.getServer())
        .get(endpoint)
        .expect(200);
      expect(body).toEqual('pong');
    });
   
  });
});
