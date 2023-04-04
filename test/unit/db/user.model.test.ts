import "reflect-metadata";
import { User } from '../../../src/interfaces/user.interface';
import { UserModel } from '../../../src/models/user.model';
import { MongoService } from '../../../src/services/mongo.service';
import { v4 as uuidV4 } from 'uuid';
import { Container } from 'typedi';

describe('User UserModel', () => {
  let userModel: User;
  const mongoService: MongoService = Container.get(MongoService);

  it('UserModel create and delete', async () => {
    const username = '2131231';
    userModel = await UserModel.create({
      uid: uuidV4(),
      password: '121212',
      username: username
    });
    expect(userModel.username).toEqual(username);

    const result = await UserModel.deleteOne({
      uid: userModel.uid
    });
    expect(result).toMatchObject({ acknowledged: true, deletedCount: 1 });
  });

});