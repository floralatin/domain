import { Request, Response, NextFunction } from "express";
import Container, { Service } from "typedi";

import { ApplicationError } from "../helpers/application.err";
import { isCode, isUrl } from "../utils/validator";

import redisService from "../services/redis.service";
import urlService from "../services/url.service";
import { urlDecode, urlEncode } from "../utils/transfer";

@Service()
export class UrlController {
  private redisPrefix = 'url';

  private getRedisUrlKey(key: string): string {
    return `${this.redisPrefix}:origin:${key}`;
  }

  private getRedisCodeKey(key: string): string {
    return `${this.redisPrefix}:code:${key}`;
  }

  private getShortUrl(code: string): string {
    return `http://127.0.0.1:3000/${code}`;
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const url: string = req.body.url;
      if (!url || !isUrl(url)) {
        throw new ApplicationError(400, "Invalid URL");
      }
      const userUid = (req as any).user.uid;
      
      const safeUrl = urlEncode(url);
      const urlRedisKey = this.getRedisUrlKey(`${userUid}:${safeUrl}`);
      const code: string | null = await redisService.get(urlRedisKey);
      if(code) {
        res.json({ url: this.getShortUrl(code) });
        return;
      }

      const existed = await urlService.findByOption(safeUrl, userUid);
      if (existed) {
        await redisService.setEx(urlRedisKey, existed.code);
        res.json({ url: this.getShortUrl(existed.code) });
        return;
      }

      const create = await urlService.createByOption(safeUrl, userUid, {});
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
      const codeRedisKey = this.getRedisCodeKey(code);
      const originUrl: string | null = await redisService.get(codeRedisKey);
      if (originUrl) {
        res.redirect(302, originUrl);
        return;
      }

      const urlInstance = await urlService.findByCode(code);
      if (!urlInstance) {
        throw new ApplicationError(404, "URL not existed");
      }

      const decodeUrl = urlDecode(urlInstance.url);
      await redisService.setEx(codeRedisKey, decodeUrl);
      res.redirect(302, decodeUrl);
    } catch (error) {
      next(error);
    }
  }

}

const urlController = Container.get(UrlController);
export default urlController;
