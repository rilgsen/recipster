import {
  begrenzePersonen,
  formatiereMenge,
  formatiereZahl,
  mengeImRezept,
  portionsfaktor,
  rundeFuerAnzeige,
  skaliereMenge,
  zutatName,
} from '@/lib/mengen';
import { alsKarte, MITGELIEFERTE_ZUTATEN } from '@/lib/rezepte';

const katalog = alsKarte(MITGELIEFERTE_ZUTATEN);
const ei = katalog.get('ei')!;
const knoblauch = katalog.get('knoblauch')!;
const butter = katalog.get('butter')!;
const haehnchen = katalog.get('haehnchenbrustfilet')!;

describe('Personen und Faktor (S2-3)', () => {
  it('erlaubt 1 bis 12 Personen', () => {
    expect(begrenzePersonen(0)).toBe(1);
    expect(begrenzePersonen(13)).toBe(12);
    expect(begrenzePersonen(4)).toBe(4);
    expect(begrenzePersonen(Number.NaN)).toBe(1);
  });

  it('teilt die Personenzahl durch die Portionen des Rezepts', () => {
    expect(portionsfaktor(4, 2)).toBe(2);
    expect(portionsfaktor(1, 2)).toBe(0.5);
    expect(portionsfaktor(3, 2)).toBe(1.5);
  });
});

describe('Mengen umrechnen (S2-3)', () => {
  it('rechnet Gramm linear um', () => {
    expect(skaliereMenge(300, 'g', 1.5)).toBe(450);
  });

  it('rundet Stück auf ganze Stück auf', () => {
    expect(skaliereMenge(3, 'Stück', 1.5)).toBe(5);
    expect(skaliereMenge(3, 'Stück', 0.5)).toBe(2);
    expect(skaliereMenge(1, 'Stück', 0.5)).toBe(1);
    expect(skaliereMenge(2, 'Stück', 2)).toBe(4);
  });

  it('rundet teilbare Stück auf halbe auf (M3)', () => {
    expect(skaliereMenge(1, 'Stück', 0.25, 'halb')).toBe(0.5);
    expect(skaliereMenge(1, 'Stück', 0.5, 'halb')).toBe(0.5);
    expect(skaliereMenge(1, 'Stück', 0.75, 'halb')).toBe(1);
    expect(skaliereMenge(1, 'Stück', 1.5, 'halb')).toBe(1.5);
    expect(skaliereMenge(1, 'Stück', 0.25, 'ganz')).toBe(1);
  });

  it('nimmt die Rundung aus dem Katalog: Ei ganz, Zwiebel halb', () => {
    const zwiebel = MITGELIEFERTE_ZUTATEN.find((z) => z.id === 'zwiebel')!;
    const eiZutat = MITGELIEFERTE_ZUTATEN.find((z) => z.id === 'ei')!;
    expect(mengeImRezept(zwiebel, { zutat_id: 'zwiebel', menge: 1, einheit: 'Stück' }, 0.25)).toBe(0.5);
    expect(mengeImRezept(eiZutat, { zutat_id: 'ei', menge: 1, einheit: 'Stück' }, 0.25)).toBe(1);
    expect(formatiereMenge(zwiebel, 0.5, 'Stück')).toBe('½');
    expect(formatiereMenge(zwiebel, 1.5, 'Stück')).toBe('1 ½');
  });

  it('gibt jeder Stück-Zutat im Katalog eine Rundung', () => {
    const ohne = MITGELIEFERTE_ZUTATEN.filter((z) => z.basis_einheit === 'Stück' && !z.rundung);
    expect(ohne.map((z) => z.id)).toEqual([]);
  });

  it('fällt nicht auf Rundungsfehler herein', () => {
    expect(skaliereMenge(3, 'Stück', 1 / 3)).toBe(1);
    expect(skaliereMenge(0.1 + 0.2, 'Stück', 10)).toBe(3);
  });

  it('lässt eine Prise unverändert', () => {
    expect(skaliereMenge(1, 'Prise', 6)).toBe(1);
  });
});

describe('Anzeige', () => {
  it('rundet sinnvoll', () => {
    expect(rundeFuerAnzeige(133.33, 'g')).toBe(133);
    expect(rundeFuerAnzeige(1.3, 'EL')).toBe(1.5);
    expect(rundeFuerAnzeige(7.55, 'g')).toBe(7.6);
  });

  it('schreibt halbe Mengen als Bruch', () => {
    expect(formatiereZahl(0.5)).toBe('½');
    expect(formatiereZahl(1.5)).toBe('1 ½');
    expect(formatiereZahl(7.6)).toBe('7,6');
  });

  it('nennt Stück beim Namen', () => {
    expect(formatiereMenge(knoblauch, 2, 'Stück')).toBe('2 Zehen');
    expect(formatiereMenge(knoblauch, 1, 'Stück')).toBe('1 Zehe');
    expect(formatiereMenge(ei, 3, 'Stück')).toBe('3');
    expect(formatiereMenge(haehnchen, 2, 'Stück')).toBe('2 Stück');
    expect(formatiereMenge(butter, 30, 'g')).toBe('30 g');
    expect(formatiereMenge(butter, 1, 'Prise')).toBe('1 Prise');
  });

  it('wählt Einzahl oder Mehrzahl', () => {
    expect(zutatName(ei, 1, 'Stück')).toBe('Ei');
    expect(zutatName(ei, 3, 'Stück')).toBe('Eier');
    expect(zutatName(knoblauch, 3, 'Stück')).toBe('Knoblauch');
  });
});
