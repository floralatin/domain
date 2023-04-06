import { auth } from '../../../src/middlewares/auth.middleware';
import { UserModel } from '../../../src/models/user.model';
import redisService from '../../../src/services/redis.service';
import { ApplicationError } from '../../../src/helpers/application.err';
import config from '../../../src/config/index';
import * as jwt from '../../../src/utils/jwt';

describe('Middleware: auth', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      cookies: {
        Authorization: 'Bearer token',
      },
      header: jest.fn(),
    };
    res = {};
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next if environment is development', async () => {
    jest.spyOn(config, 'isDevelopment').mockReturnValue(true);

    await auth(req , res, next);

    expect(config.isDevelopment).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should call next with 404 if authorization is missing', async () => {
    jest.spyOn(config, 'isDevelopment').mockReturnValue(false);
    req.cookies = {};
    jest.spyOn(req, 'header').mockReturnValue(null);

    await auth(req, res, next);

    expect(req.header).toHaveBeenCalledWith('Authorization');
    expect(next).toHaveBeenCalledWith(new ApplicationError(404, 'Authentication token missing'));
  });

  it('should call next with 401 if authorization token is wrong', async () => {
    jest.spyOn(config, 'isDevelopment').mockReturnValue(false);
    jest.spyOn(jwt,'verifyToken').mockResolvedValue('');

    await auth(req, res, next);

    expect(config.isDevelopment).toHaveBeenCalled();
    expect(jwt.verifyToken).toHaveBeenCalledWith('Bearer token', 'secret-key');
    expect(next).toHaveBeenCalledWith(new ApplicationError(401, 'Wrong authentication token'));
  });

  it('should set req.user with user from cache', async () => {
    jest.spyOn(config, 'isDevelopment').mockReturnValue(false);
    jest.spyOn(jwt, 'verifyToken').mockResolvedValue({ uid: 'uid' });
    jest.spyOn(redisService, 'get').mockResolvedValue('{"name": "John Doe"}');

    await auth(req, res, next);

    expect(config.isDevelopment).toHaveBeenCalled();
    expect(jwt.verifyToken).toHaveBeenCalledWith('Bearer token', 'secret-key');
    expect(redisService.get).toHaveBeenCalledWith('auth:uid');
    expect(req.user).toEqual({ name: 'John Doe' });
    expect(next).toHaveBeenCalled();
  });

  it('should set req.user with user from db', async () => {
    jest.spyOn(config, 'isDevelopment').mockReturnValue(false);
    jest.spyOn(jwt, 'verifyToken').mockResolvedValue({ uid: 'uid' });
    jest.spyOn(redisService, 'get').mockResolvedValue(null);
    jest.spyOn(UserModel, 'findOne').mockResolvedValue({ name: 'John Doe' });
    jest.spyOn(redisService, 'setEx').mockResolvedValue(null);

    await auth(req, res, next);

    expect(config.isDevelopment).toHaveBeenCalled();
    expect(jwt.verifyToken).toHaveBeenCalledWith('Bearer token', 'secret-key');
    expect(redisService.get).toHaveBeenCalledWith('auth:uid');
    expect(UserModel.findOne).toHaveBeenCalledWith({ uid: 'uid' });
    expect(redisService.setEx).toHaveBeenCalledWith('auth:uid', '{"name":"John Doe"}');
    expect(req.user).toEqual({ name: 'John Doe' });
    expect(next).toHaveBeenCalled();
  });

});
