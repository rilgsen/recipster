import muster from '../../data/rezepte/rezepte-muster.json';
import paket1 from '../../data/rezepte/rezepte-paket-1.json';
import katalogDatei from '../../data/zutatenkatalog.json';
import {
  inBasiseinheit,
  REZEPTEINHEITEN,
  type Rezepteinheit,
  type Rezeptzutat,
  type Zutat,
} from '@/lib/katalog';

const zutaten = katalogDatei.zutaten as Zutat[];
const katalog = new Map(zutaten.map((z) => [z.id, z]));
const rezepte = [...muster.rezepte, ...paket1.rezepte];

describe('Zutatenkatalog', () => {
  it('hat eindeutige Kennungen in Kleinbuchstaben', () => {
    expect(katalog.size).toBe(zutaten.length);
    for (const z of zutaten) {
      expect(z.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it.each(zutaten)('$id ist vollständig gepflegt', (z) => {
    expect(z.name.length).toBeGreaterThan(0);
    expect(z.abteilung.length).toBeGreaterThan(0);
    expect(['g', 'ml', 'Stück']).toContain(z.basis_einheit);
    expect(typeof z.immer_im_haus).toBe('boolean');
    expect(z.haltbarkeit_tage === null || z.haltbarkeit_tage > 0).toBe(true);
    for (const [einheit, faktor] of Object.entries(z.umrechnung)) {
      expect(['EL', 'TL', 'Stück']).toContain(einheit);
      expect(einheit).not.toBe(z.basis_einheit);
      expect(faktor).toBeGreaterThan(0);
    }
    if (z.stueck_name) {
      expect(z.basis_einheit).toBe('Stück');
    }
  });
});

describe('Rezepte passen zum Katalog', () => {
  it('haben eindeutige Kennungen', () => {
    expect(new Set(rezepte.map((r) => r.id)).size).toBe(rezepte.length);
  });

  it.each(rezepte)('$id nutzt nur bekannte Zutaten und umrechenbare Mengen', (rezept) => {
    expect(rezept.zutaten.length).toBeGreaterThan(0);
    for (const zeile of rezept.zutaten as Rezeptzutat[]) {
      const zutat = katalog.get(zeile.zutat_id);
      expect(zutat).toBeDefined();
      expect(REZEPTEINHEITEN).toContain(zeile.einheit);
      expect(zeile.menge).toBeGreaterThan(0);
      expect(() => inBasiseinheit(zutat!, zeile.menge, zeile.einheit)).not.toThrow();
    }
  });
});

describe('Umrechnung in die Basiseinheit', () => {
  const butter = katalog.get('butter')!;
  const haehnchen = katalog.get('haehnchenbrustfilet')!;
  const ei = katalog.get('ei')!;

  it('lässt die Basiseinheit unverändert', () => {
    expect(inBasiseinheit(butter, 30, 'g')).toEqual({ menge: 30, einheit: 'g' });
    expect(inBasiseinheit(ei, 3, 'Stück')).toEqual({ menge: 3, einheit: 'Stück' });
  });

  it('rechnet Esslöffel und Stück in Gramm um', () => {
    expect(inBasiseinheit(butter, 2, 'EL')).toEqual({ menge: 2 * butter.umrechnung.EL!, einheit: 'g' });
    expect(inBasiseinheit(haehnchen, 2, 'Stück')).toEqual({ menge: 360, einheit: 'g' });
  });

  it('rechnet eine Prise nie um', () => {
    expect(inBasiseinheit(katalog.get('salz')!, 1, 'Prise')).toBeNull();
  });

  it('meldet fehlende Umrechnungen', () => {
    expect(() => inBasiseinheit(ei, 1, 'EL' as Rezepteinheit)).toThrow(/Keine Umrechnung/);
  });
});
