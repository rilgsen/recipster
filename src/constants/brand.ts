import appConfig from '../../app.json';

/**
 * Der App-Name steht nur in app.json. Alles andere leitet sich hier ab,
 * damit ein Namenswechsel eine einzige Zeile betrifft.
 */
export const APP_NAME: string = appConfig.expo.name;

/** Schriftzug im Logo, immer klein geschrieben. */
export const WORDMARK: string = APP_NAME.toLowerCase();
