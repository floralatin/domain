import "reflect-metadata";
import { UserModel } from '../../../src/models/user.model';
import mongoService from '../../../src/services/mongo.service';
import { User } from '../../../src/interfaces/user.interface';

describe('DB: UserModel', () => {
  let user: User;

  beforeAll(async () => {
    await mongoService.connect();
  });
  
  afterAll(async () => {
    await mongoService.disconnect();
  });

  beforeEach(async () => {
    if (user) {
      await UserModel.deleteOne({uid: user.uid });
    }
  });

  describe('create', () => {
    it('should create a new user', async () => {

      const userData = {
        uid: '123456',
        username: 'testuser',
        password: 'password123',
        meta: {},
        createTime: new Date(),
        updateTime: new Date(),
        available: true,
      } as User;

      user = await UserModel.create(userData);
      expect(user).toMatchObject(userData);

    });

    it('should fail if username is not unique', async () => {
      const userData = {
        uid: '111111',
        username: 'existinguser',
        password: 'password123',
        meta: {},
        createTime: new Date(),
        updateTime: new Date(),
        available: true,
      } as User;
      user = await UserModel.create(userData);

      const userData2 = {
        uid: '222222',
        username: 'existinguser',
        password: 'password456',
        meta: {},
        createTime: new Date(),
        updateTime: new Date(),
        available: true,
      } as User;
      await expect(UserModel.create(userData2)).rejects.toThrowError();
    });

    it('should fail if uid is missing', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        meta: {},
        createTime: new Date(),
        updateTime: new Date(),
        available: true,
      } as User;
      await expect(UserModel.create(userData)).rejects.toThrowError();
    });
  });
  
});
