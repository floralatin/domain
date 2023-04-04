import { isCode, isUrl } from '../../../src/utils/validator';

describe('Utils validator', () => {

  it('validator isCode failed', async () => {
    const result = isCode('1212121212');
    expect(result).toEqual(false);
  });

  it('validator isCode success', async () => {
    const result = isCode('121212');
    expect(result).toEqual(true);
  });
  
  it('validator isUrl failed', async () => {
    const result = isUrl('www.baidu.com/<script>alert(1212)</script>');
    expect(result).toEqual(false);
  });

  it('validator isUrl success', async () => {
    const result = isUrl('www.baidu.com');
    expect(result).toEqual(true);
  });
});