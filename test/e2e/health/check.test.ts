import "reflect-metadata";

import request from 'supertest';
import app from '../../../src/server';

describe('Health check', () => {
  const endpoint = '/ping';

  describe(`[GET] ${endpoint}`, () => {

    it('ping is true', async () => {
      const result = await request(app.getServer())
        .get(endpoint)
        .expect(200);
      console.log('ping',result);
      expect(result).toEqual(true);
    });
   
  });
});
