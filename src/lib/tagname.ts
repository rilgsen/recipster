import { tageZwischen, wochentag, type Tag } from './datum';

/** „Heute“, „Morgen“ oder der Wochentag. */
export function tagName(tag: Tag, heute: Tag): string {
  const abstand = tageZwischen(heute, tag);
  if (abstand === 0) {
    return 'Heute';
  }
  if (abstand === 1) {
    return 'Morgen';
  }
  return wochentag(tag);
}
