import Container, { Service } from "typedi";
import { UrlModel } from "../models/url.model";
import { Url } from "../interfaces/url.interface";
import { bigintToBase62 } from "../utils/transfer";
import { Snowflake } from '../utils/snowflake';
import { v4 as uuidV4 } from 'uuid';
import { UserModel } from '../models/user.model';

@Service()
export class UrlService {
  private snowflake: Snowflake; 

  constructor() {
    this.snowflake = new Snowflake(12n, 6n);
  }

  private getCode(snowflakeId: bigint): string {
    const code = bigintToBase62(snowflakeId);
    return code.substring(code.length - 8);
  }

  public async findByUrl(url: string): Promise<Url | null> {
    return await UrlModel.findOne({ url: {$eq: url } });
  }


  public async findByCode(code: string): Promise<Url | null> {
    return await UrlModel.findOne({ code: {$eq: code } });
  }

  public async createByOption(url: string, meta: object): Promise<Url> {
    const codeData = { url: url, meta } as Url;

    const snowflakeId = this.snowflake.nextId();
    codeData.code = this.getCode(snowflakeId);
    codeData.uid = uuidV4();
    
    return await UrlModel.create({ ...codeData });
  }

  public async deleteByCode(code: string) {
    await UserModel.deleteOne({ code: {$eq: code}});
  }

}
const urlService = Container.get(UrlService);
export default urlService;