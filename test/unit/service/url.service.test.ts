import "reflect-metadata";
import { MongoService } from '../../../src/services/mongo.service';
import { UrlService } from '../../../src/services/url.service';

import { Url } from '../../../src/interfaces/url.interface';
import { UrlModel } from "../../../src/models/url.model";
import { Container } from 'typedi';

describe('service urlService', () => {
  const url = 'www.baidu.com/unit'; 
  let urlInstance: Url;
  let mongoService: MongoService;
  let urlService: UrlService;


  beforeAll(async()=> {
    mongoService = Container.get(MongoService);
    urlService = Container.get(UrlService);
  });

  afterAll(async () => {
    await UrlModel.deleteOne({ uid: urlInstance.uid });
  });
    
  it('urlService createByOption', async () => {
    urlInstance = await urlService.createByOption(url, {});
    expect(urlInstance.url).toEqual(url);
  });

  it('urlService findByCode', async () => {
    const result = await urlService.findByCode(urlInstance.code);

    expect(result).toBeDefined();
    if (result) {
      expect(result.uid).toEqual(urlInstance.uid);
    }
        
  });

  it('urlService findByUrl', async () => {
    const result = await urlService.findByUrl(urlInstance.url);

    expect(result).toBeDefined();
    if (result) {
      expect(result.uid).toEqual(urlInstance.uid);
    }
        
  });

  it('urlService findById', async () => {
    const result = await urlService.findByUid(urlInstance.uid);

    expect(result).toBeDefined();
    if (result) {
      expect(result.uid).toEqual(urlInstance.uid);
    }
  });

});