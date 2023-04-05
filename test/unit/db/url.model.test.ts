import "reflect-metadata";
import { Url } from '../../../src/interfaces/url.interface';
import { UrlModel } from '../../../src/models/url.model';
import { MongoService } from '../../../src/services/mongo.service';
import { v4 as uuidV4 } from 'uuid';
import { Container } from 'typedi';

describe('Url UrlModel', () => {
  const url = 'www.baidu.com'; 
  let urlModel: Url;
  let mongoService: MongoService;

  beforeAll(()=> {
    mongoService = Container.get(MongoService);
  });
  it('UrlModel create and delete', async () => {
    const code = '2131231';
    urlModel = await UrlModel.create({
      uid: uuidV4(),
      code: '2131231',
      url: url,
    });
    expect(urlModel.code).toEqual(code);

    const result = await UrlModel.deleteOne({
      uid: urlModel.uid
    });
    expect(result).toMatchObject({ acknowledged: true, deletedCount: 1 });
  });

});