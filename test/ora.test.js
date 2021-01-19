import { Ora } from "../lib/common/ora";

describe('test ora', () => {
    let ora = new Ora(true);
    let oraShutup = new Ora(false);
  
    test('test ora info', () => {
      expect(ora.info('test')).toBeUndefined();
    });

    test('test ora info', () => {
        expect(ora.warn('test')).toBeUndefined();
    });

    test('test ora info', () => {
        expect(ora.succeed('test')).toBeUndefined();
    });

    test('test ora info', () => {
        expect(oraShutup.info('test')).toBeUndefined();
      });
  
      test('test ora info', () => {
          expect(oraShutup.warn('test')).toBeUndefined();
      });
  
      test('test ora info', () => {
          expect(oraShutup.succeed('test')).toBeUndefined();
      });
  });