import { isCode, isUrl } from '../../../src/utils/validator';

describe('utils: validator', ()=> {

  describe('isUrl', () => {
    it('should return true for a valid URL', () => {
      expect(isUrl('https://www.example.com')).toBe(true);
    });
  
    it('should return false for an invalid URL', () => {
      expect(isUrl('not_a_url')).toBe(false);
    });
  
    it('should return false for an empty string', () => {
      expect(isUrl('')).toBe(false);
    });
  });
  
  describe('isCode', () => {
    it('should return true for a valid code', () => {
      expect(isCode('AbCd1234')).toBe(true);
    });
  
    it('should return false for a code longer than 8 characters', () => {
      expect(isCode('123456789')).toBe(false);
    });
  
    it('should return false for a code containing special characters', () => {
      expect(isCode('1234!@#$')).toBe(false);
    });
  
    it('should return false for an empty string', () => {
      expect(isCode('')).toBe(false);
    });
  });
  
});

