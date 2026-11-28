/** Datumsangaben als Text JJJJ-MM-TT in Ortszeit. So bleibt ein Tag ein Tag, egal in welcher Zeitzone. */
export type Tag = string;

function zwei(zahl: number): string {
  return zahl < 10 ? `0${zahl}` : String(zahl);
}

export function alsTag(datum: Date): Tag {
  return `${datum.getFullYear()}-${zwei(datum.getMonth() + 1)}-${zwei(datum.getDate())}`;
}

export function alsDatum(tag: Tag): Date {
  const [jahr, monat, tagImMonat] = tag.split('-').map(Number);
  return new Date(jahr, monat - 1, tagImMonat, 12, 0, 0, 0);
}

export function plusTage(tag: Tag, tage: number): Tag {
  const datum = alsDatum(tag);
  datum.setDate(datum.getDate() + tage);
  return alsTag(datum);
}

/** Ganze Tage von a bis b. Positiv, wenn b später liegt. */
export function tageZwischen(a: Tag, b: Tag): number {
  return Math.round((alsDatum(b).getTime() - alsDatum(a).getTime()) / 86400000);
}

export function tageAb(start: Tag, anzahl: number): Tag[] {
  return Array.from({ length: anzahl }, (_, index) => plusTage(start, index));
}

const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONATE = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];

export function wochentag(tag: Tag): string {
  return WOCHENTAGE[alsDatum(tag).getDay()];
}

export function kurzesDatum(tag: Tag): string {
  const datum = alsDatum(tag);
  return `${datum.getDate()}. ${MONATE[datum.getMonth()]}`;
}
