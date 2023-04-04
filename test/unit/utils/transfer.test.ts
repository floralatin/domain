import { bigintToBase62, urlEncode, urlDecode } from '../../../src/utils/transfer';

describe('Utils jwt', () => {
  const url = 'https://www.baidu.com';
  const encodeUrl = 'https%3A%2F%2Fwww.baidu.com';
  const bigNumber = 111111100000000n;
  const base62 = 'vyaJSgN2';
    
  it('jwt bigintToBase62', async () => {
    const result = bigintToBase62(bigNumber);
    expect(result).toEqual(base62);
  });
  
  it('jwt urlEncode', async () => {
    const result = urlEncode(url);
    expect(result).toEqual(encodeUrl);
  });

  it('jwt urlDecode', async () => {
    const result = urlDecode(encodeUrl);
    expect(result).toEqual(url);
  });
});