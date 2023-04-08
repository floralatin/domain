
import mongoService from '../../../src/services/mongo.service';
import { StatisticsModel } from '.../../../src/models/statistics.model';
import { Statistics } from "../../../src/interfaces/statistics.interface";

describe('UrlModel', () => {
  beforeAll(async () => {
    await mongoService.connect();
    await StatisticsModel.deleteMany({});
  });

  afterAll(async () => {
    await StatisticsModel.deleteMany({});
    await mongoService.disconnect();
  });

  it("should create and save a new statistic successfully", async () => {
    const newStatistic: Statistics = new StatisticsModel({
      urlUid: "abc123",
      ip: "127.0.0.1",
      refer: "http://localhost:3000/",
      userAgent: "Mozilla/5.0",
      language: "en-US",
      accept: "text/html",
    });

    const savedStatistic = await newStatistic.save();
    expect(savedStatistic._id).toBeDefined();
    expect(savedStatistic.urlUid).toBe(newStatistic.urlUid);
    expect(savedStatistic.ip).toBe(newStatistic.ip);
    expect(savedStatistic.refer).toBe(newStatistic.refer);
    expect(savedStatistic.userAgent).toBe(newStatistic.userAgent);
    expect(savedStatistic.language).toBe(newStatistic.language);
    expect(savedStatistic.accept).toBe(newStatistic.accept);
    expect(savedStatistic.createTime).toBeDefined();
    expect(savedStatistic.available).toBe(true);
  });

  it("should fail to save a statistic with missing required fields", async () => {
    const newStatistic: Statistics = new StatisticsModel({
      ip: "127.0.0.1",
      refer: "http://localhost:3000/",
      userAgent: "Mozilla/5.0",
      language: "en-US",
      accept: "text/html",
    });

    await expect(newStatistic.save()).rejects.toThrow();
  });
});
