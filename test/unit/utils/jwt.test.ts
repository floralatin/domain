import { generateToken, verifyToken } from '../../../src/utils/jwt';
import config from '../../../src/config';


describe('Utils jwt', () => {
  const payload = {
    uid: '1212',
    username: '123',
  };
  let token: string; 
    
  it('jwt generateToken', async () => {
    token = await generateToken(payload, 1000,config.get('secretKey'));
  });
  
  it('jwt verifyToken', async () => {
    const data = await verifyToken(token, config.get('secretKey'));
    expect(data).toMatchObject(payload);
  });
});