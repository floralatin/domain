import { UrlModel } from '.../../../src/models/url.model';
import mongoService from '../../../src/services/mongo.service';

describe('DB: UrlModel', () => {

  beforeAll(async () => {
    await mongoService.connect();
  });

  afterAll(async () => {
    await mongoService.disconnect();
  });

  afterEach(async () => {
    await UrlModel.deleteMany({});
  });

  it('should create a new URL document', async () => {
    const newUrl = new UrlModel({
      uid: '1',
      code: 'abc123',
      url: 'https://example.com',
      meta: {
        foo: 'bar',
      },
      userUid: '121212',
      expiredTime: new Date(),
      createTime: new Date(),
      updateTime: new Date(),
      available: true,
    });

    const savedUrl = await newUrl.save();

    expect(savedUrl.uid).toBe('1');
    expect(savedUrl.code).toBe('abc123');
    expect(savedUrl.url).toBe('https://example.com');
    expect(savedUrl.meta).toMatchObject({ foo: 'bar' });
    expect(savedUrl.expiredTime).toEqual(expect.any(Date));
    expect(savedUrl.createTime).toEqual(expect.any(Date));
    expect(savedUrl.updateTime).toEqual(expect.any(Date));
    expect(savedUrl.available).toBe(true);
  });

});
