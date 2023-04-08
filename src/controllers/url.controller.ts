import { Request, Response, NextFunction } from "express";
import Container, { Service } from "typedi";

import { ApplicationError } from "../helpers/application.err";
import { isCode, isUrl } from "../utils/validator";

import redisService from "../services/redis.service";
import urlService from "../services/url.service";
import statisticsService from "../services/statistics.service";
import { urlDecode, urlEncode } from "../utils/transfer";
import { Statistics } from "../interfaces/statistics.interface";
import { Url } from "../interfaces/url.interface";

@Service()
export class UrlController {
  private redisPrefix = 'url';

  private getCacheUrlKey(key: string): string {
    return `${this.redisPrefix}:origin:${key}`;
  }

  private getCacheCodeKey(key: string): string {
    return `${this.redisPrefix}:code:${key}`;
  }

  private getShortUrl(code: string): string {
    return `http://127.0.0.1:3000/${code}`;
  }

  private getStatistic(req: Request, urlUid: string): Statistics{
    return {
      urlUid: urlUid,
      ip: req.ip,
      refer: req.header('referer') || '',
      userAgent: req.header('User-Agent') || '',
      language: req.header('Accept-language') || '',
      accept: req.header('Accept') || ''
    } as Statistics;
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const url: string = req.body.url;
      if (!url || !isUrl(url)) {
        throw new ApplicationError(400, "Invalid URL");
      }
      const userUid = (req as any).user.uid;
      
      const safeUrl = urlEncode(url);
      const urlRedisKey = this.getCacheUrlKey(`${userUid}:${safeUrl}`);
      const cacheCode: string | null = await redisService.get(urlRedisKey);
      if(cacheCode) {
        res.json({ url: this.getShortUrl(cacheCode) });
        return;
      }

      const existed = await urlService.findByOption(safeUrl, userUid);
      if (existed) {
        await redisService.setEx(urlRedisKey, existed.code);
        res.json({ url: this.getShortUrl(existed.code) });
        return;
      }

      const create = await urlService.createByOption(safeUrl, userUid);
      // 放到布隆过滤器中
      // await redisService.bloom.setEx(codeRedisKey, JSON.stringify( {
      //   uid: dbUrl.uid,
      //   code: dbUrl.code,
      //   url: dbUrl.url
      // }));
      await redisService.setEx(urlRedisKey, create.code);

      res.json({ url: this.getShortUrl(create.code) });
    } catch (error) {
      next(error);
    }
  }

  public async redirect(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.params.code;
      if (!code || !isCode(code)) {
        throw new ApplicationError(400, "Invalid Code");
      }
      // 布隆过滤器
      // const exists = await redisService.bloom.get(codeRedisKey);
      // if (!exists) {
      // throw new ApplicationError(404, "URL not existed");
      // }
      
      const codeRedisKey = this.getCacheCodeKey(code);
      const cacheUrl: string | null = await redisService.get(codeRedisKey);
      if (cacheUrl) {
        const originUrl: Url = JSON.parse(cacheUrl);
        
        const statistic = this.getStatistic(req, originUrl.uid);
        setImmediate(async ()=> {
          await statisticsService.createByOption(statistic);
        });

        res.redirect(302, originUrl.url);
        return;
      }

      const dbUrl = await urlService.findByCode(code);
      if (!dbUrl) {
        throw new ApplicationError(404, "URL not existed");
      }

      const decodeUrl = urlDecode(dbUrl.url);
      await redisService.setEx(codeRedisKey, JSON.stringify( {
        uid: dbUrl.uid,
        code: dbUrl.code,
        url: decodeUrl
      }));
      const statistic = this.getStatistic(req, dbUrl.uid);
      setImmediate(async ()=> {
        await statisticsService.createByOption(statistic);
      });
      res.redirect(302, decodeUrl);
    } catch (error) {
      next(error);
    }
  }

}

const urlController = Container.get(UrlController);
export default urlController;
