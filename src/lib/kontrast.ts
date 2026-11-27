/** Kontrastberechnung nach WCAG 2.x für Farben im Format #RRGGBB. */

function kanal(wert: number): number {
  const c = wert / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function leuchtdichte(hex: string): number {
  const treffer = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!treffer) {
    throw new Error(`Keine Farbe im Format #RRGGBB: ${hex}`);
  }
  const zahl = parseInt(treffer[1], 16);
  const r = (zahl >> 16) & 0xff;
  const g = (zahl >> 8) & 0xff;
  const b = zahl & 0xff;
  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
}

export function kontrast(a: string, b: string): number {
  const la = leuchtdichte(a);
  const lb = leuchtdichte(b);
  const hell = Math.max(la, lb);
  const dunkel = Math.min(la, lb);
  return (hell + 0.05) / (dunkel + 0.05);
}
