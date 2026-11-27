import appConfig from '../../app.json';
import { APP_NAME, WORDMARK } from '@/constants/brand';

describe('App-Name (S1-2)', () => {
  it('kommt aus app.json', () => {
    expect(APP_NAME).toBe(appConfig.expo.name);
    expect(APP_NAME).toBe('Recipster');
  });

  it('ergibt den klein geschriebenen Schriftzug', () => {
    expect(WORDMARK).toBe('recipster');
  });
});
