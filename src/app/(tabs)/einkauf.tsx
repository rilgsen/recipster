import { Bereich } from '@/components/bereich';
import { de } from '@/i18n/de';

export default function Einkauf() {
  return <Bereich titel={de.einkauf.titel} hinweis={de.einkauf.leer} />;
}
