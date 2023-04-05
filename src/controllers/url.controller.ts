import { Request, Response, NextFunction } from "express";
import Container, { Inject, Service } from "typedi";

import { ApplicationError } from "../helpers/application.err";
import { isCode, isUrl } from "../utils/validator";

import { RedisService } from "../services/redis.service";
import { UrlService } from "../services/url.service";
import { urlDecode, urlEncode } from "../utils/transfer";

@Service()
export class UrlController {

  @Inject()
  private urlService: UrlService = Container.get(UrlService);
  @Inject()
  private redisService: RedisService = Container.get(RedisService);
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

      const safeUrl = urlEncode(url);
      const urlRedisKey = this.getRedisUrlKey(safeUrl);
      const code: string | null = await this.redisService.get(urlRedisKey);
      if(code) {
        res.json({ url: this.getShortUrl(code) });
        return;
      }

      const existed = await this.urlService.findByUrl(safeUrl);
      if (existed) {
        await this.redisService.setEx(urlRedisKey, existed.code);
        res.json({ url: this.getShortUrl(existed.code) });
        return;
      }

      const create = await this.urlService.createByOption(safeUrl, {});
      await this.redisService.setEx(urlRedisKey, create.code);

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
      const originUrl: string | null = await this.redisService.get(codeRedisKey);
      if (originUrl) {
        res.redirect(302, originUrl);
        return;
      }

      const urlInstance = await this.urlService.findByCode(code);
      if (!urlInstance) {
        throw new ApplicationError(404, "URL not existed");
      }

      const decodeUrl = urlDecode(urlInstance.url);
      await this.redisService.setEx(codeRedisKey, decodeUrl);
      res.redirect(302, decodeUrl);
    } catch (error) {
      next(error);
    }
  }

}
