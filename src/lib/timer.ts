/** Der Timer rechnet immer von der Endzeit zurück. So stimmt er auch nach Sperren oder App-Wechsel. */

export function endzeit(jetztMs: number, sekunden: number): number {
  return jetztMs + Math.max(0, Math.round(sekunden)) * 1000;
}

/** Restzeit in ganzen Sekunden, nie negativ. */
export function restSekunden(endeMs: number, jetztMs: number): number {
  return Math.max(0, Math.ceil((endeMs - jetztMs) / 1000));
}

export function istAbgelaufen(endeMs: number, jetztMs: number): boolean {
  return jetztMs >= endeMs;
}

/** Anzeige als 4:05 oder 1:02:03. */
export function formatiereRest(sekunden: number): string {
  const s = Math.max(0, Math.floor(sekunden));
  const stunden = Math.floor(s / 3600);
  const minuten = Math.floor((s % 3600) / 60);
  const rest = s % 60;
  const zwei = (zahl: number) => (zahl < 10 ? `0${zahl}` : String(zahl));
  return stunden > 0 ? `${stunden}:${zwei(minuten)}:${zwei(rest)}` : `${minuten}:${zwei(rest)}`;
}

/** Der Timer, der als nächster endet. */
export function naechsterTimer<T extends { endeMs: number }>(timer: readonly T[]): T | undefined {
  return [...timer].sort((a, b) => a.endeMs - b.endeMs)[0];
}
