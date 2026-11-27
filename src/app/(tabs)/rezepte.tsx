import { Bereich } from '@/components/bereich';
import { de } from '@/i18n/de';

export default function Rezepte() {
  return <Bereich titel={de.rezepte.titel} hinweis={de.rezepte.leer} />;
}
