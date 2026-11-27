import { Bereich } from '@/components/bereich';
import { de } from '@/i18n/de';

export default function Woche() {
  return <Bereich titel={de.woche.titel} hinweis={de.woche.leer} />;
}
