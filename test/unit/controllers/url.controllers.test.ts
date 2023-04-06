import "reflect-metadata";

import urlController from "../../../src/controllers/url.controller";
import urlServiceInstance, { UrlService } from "../../../src/services/url.service";
import redisServiceInstance, { RedisService } from "../../../src/services/redis.service";
import { ApplicationError } from "../../../src/helpers/application.err";
import { urlEncode } from "../../../src/utils/transfer";

describe("Controllers: UrlController", () => {
  const urlService =  urlServiceInstance as jest.Mocked<UrlService>;
  const redisService = redisServiceInstance as jest.Mocked<RedisService>;

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    redisService.disconnect();
  });

  describe("create method", () => {
    it("should return short url if original url already exists", async () => {
      const url = "https://www.google.com";
      const code = "abc123";
      const req: any = { body: { url } };
      const res: any = { json: jest.fn() };
      const next: any = jest.fn();

      jest.spyOn(redisService, "get").mockResolvedValue(code);

      await urlController.create(req, res, next);

      const safeUlr = urlEncode(url);
      expect(redisService.get).toBeCalledWith(`url:origin:${safeUlr}`);
      expect(res.json).toBeCalledWith({ url: `http://127.0.0.1:3000/${code}` });
    });

    it("should return short url if original url does not exist", async () => {
      const url = "https://www.google.com";
      const code = "abc123";
      const req: any = { body: { url } };
      const res: any = { json: jest.fn() };
      const next: any = jest.fn();

      jest.spyOn(urlService, "findByUrl").mockResolvedValue(null);
      jest.spyOn(urlService, "createByOption").mockResolvedValue({ code } as any);
      jest.spyOn(redisService, "setEx").mockResolvedValue("OK");

      await urlController.create(req, res, next);
      const safeUlr = urlEncode(url);

      expect(urlService.findByUrl).toBeCalledWith(safeUlr);
      expect(urlService.createByOption).toBeCalledWith(safeUlr, {});
      expect(redisService.setEx).toBeCalledWith(`url:origin:${safeUlr}`, code);
      expect(res.json).toBeCalledWith({ url: `http://127.0.0.1:3000/${code}` });
    });

    it("should throw error if url is not provided", async () => {
      const req: any = { body: {} };
      const res: any = { json: jest.fn() };
      const next: any = jest.fn();

      await urlController.create(req, res, next);

      expect(next).toBeCalledWith(new ApplicationError(400, "Invalid URL"));
    });

    it("should throw error if url is invalid", async () => {
      const req: any = { body: { url: 'Invalid URL' } };
      const res: any = { json: jest.fn() };
      const next: any = jest.fn();
      await urlController.create(req, res, next);

      expect(next).toBeCalledWith(new ApplicationError(400, "Invalid URL"));
    });
  });

  describe("redirect", () => {
    it("should redirect to original url if code exists in Redis cache", async () => {
      const req: any = { params: { code: "abc123" } };
      const res: any = { redirect: jest.fn() };
      const next: any = jest.fn();
      const mockOriginUrl = "http://example.com";
      jest.spyOn(redisService, "get").mockResolvedValue(mockOriginUrl);

      await urlController.redirect(req, res, next);

      expect(redisService.get).toHaveBeenCalledWith("url:code:abc123");
      expect(res.redirect).toHaveBeenCalledWith(302, mockOriginUrl);
      expect(next).not.toHaveBeenCalled();
    });

    it("should redirect to original url if code exists in database", async () => {
      const req: any = { params: { code: "abc123" } };
      const res: any = { redirect: jest.fn() };
      const next: any = jest.fn();
      const mockOriginUrl = "http://example.com";
      jest.spyOn(redisService, "get").mockResolvedValue(null);
      jest.spyOn(urlService, "findByCode").mockResolvedValue({ url: mockOriginUrl } as any);

      await urlController.redirect(req, res, next);

      expect(redisService.get).toHaveBeenCalledWith("url:code:abc123");
      expect(urlService.findByCode).toHaveBeenCalledWith("abc123");
      expect(res.redirect).toHaveBeenCalledWith(302, mockOriginUrl);
      expect(next).not.toHaveBeenCalled();
    });

    it("should throw ApplicationError with 404 status code if code does not exist", async () => {
      const req: any = { params: { code: "abc123" } };
      const res: any = { redirect: jest.fn() };
      const next: any = jest.fn();
      jest.spyOn(redisService, "get").mockResolvedValue(null);
      jest.spyOn(urlService, "findByCode").mockResolvedValue(null);

      await urlController.redirect(req, res, next);

      expect(redisService.get).toHaveBeenCalledWith("url:code:abc123");
      expect(urlService.findByCode).toHaveBeenCalledWith("abc123");
      expect(next).toHaveBeenCalledWith(new ApplicationError(404, "URL not existed"));
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it("should throw ApplicationError with 400 status code if code is invalid", async () => {
      const req: any = { params: { code: "invalid_code" } };
      const res: any = { redirect: jest.fn() };
      const next: any = jest.fn();

      await urlController.redirect(req, res, next);

      expect(redisService.get).not.toHaveBeenCalled();
      expect(urlService.findByCode).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(new ApplicationError(400, "Invalid Code"));
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

});
