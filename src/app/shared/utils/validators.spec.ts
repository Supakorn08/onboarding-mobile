import { isValidEmail, isValidJuristicId } from './validators';
describe('validators', () => {
  it('email: valid', () => expect(isValidEmail('a@b.com')).toBe(true));
  it('email: invalid', () => expect(isValidEmail('abc@gmail.c')).toBe(false));
  it('juristicId: exactly 13 digits', () => expect(isValidJuristicId('0105563000012')).toBe(true));
  it('juristicId: 11 digits invalid', () => expect(isValidJuristicId('01234567891')).toBe(false));
  it('juristicId: non-numeric invalid', () => expect(isValidJuristicId('010556300001x')).toBe(false));
  it('juristicId: all zeros passes (length-only, NO checksum)', () => expect(isValidJuristicId('0000000000000')).toBe(true));
});
