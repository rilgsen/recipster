import { endzeit, formatiereRest, istAbgelaufen, naechsterTimer, restSekunden } from '@/lib/timer';
import { ausGespeichertem, reduziere, STARTZUSTAND } from '@/lib/zustand';

describe('Kochtimer (S5-2)', () => {
  const start = 1_800_000_000_000;

  it('speichert die Endzeit und rechnet die Restzeit daraus', () => {
    const ende = endzeit(start, 1200);
    expect(ende).toBe(start + 1_200_000);
    expect(restSekunden(ende, start)).toBe(1200);
    expect(restSekunden(ende, start + 500)).toBe(1200);
    expect(restSekunden(ende, start + 1000)).toBe(1199);
  });

  it('stimmt auch, wenn die App lange im Hintergrund war', () => {
    const ende = endzeit(start, 600);
    expect(restSekunden(ende, start + 590_000)).toBe(10);
    expect(restSekunden(ende, start + 3_600_000)).toBe(0);
    expect(istAbgelaufen(ende, start + 600_000)).toBe(true);
    expect(istAbgelaufen(ende, start + 599_999)).toBe(false);
  });

  it('zeigt Minuten und Stunden lesbar an', () => {
    expect(formatiereRest(245)).toBe('4:05');
    expect(formatiereRest(0)).toBe('0:00');
    expect(formatiereRest(3723)).toBe('1:02:03');
  });

  it('übersteht Speichern und Laden', () => {
    const timer = { rezeptId: 'a', schritt: 2, endeMs: endzeit(start, 60), mitteilungId: 'm1' };
    const z = reduziere(STARTZUSTAND, { typ: 'timerStart', timer });
    const geladen = ausGespeichertem(JSON.parse(JSON.stringify(z)));
    expect(geladen.timer).toEqual([timer]);
    expect(reduziere(geladen, { typ: 'timerStopp', rezeptId: 'a', schritt: 2 }).timer).toEqual([]);
    expect(ausGespeichertem({ timer: [{ rezeptId: 'a' }] }).timer).toEqual([]);
    expect(ausGespeichertem({ timer: { rezeptId: 'a', schritt: 1, endeMs: 5 } }).timer).toEqual([]);
  });

  it('lässt mehrere Timer gleichzeitig laufen, höchstens einen je Schritt (K2, S5-3)', () => {
    let z = reduziere(STARTZUSTAND, { typ: 'timerStart', timer: { rezeptId: 'a', schritt: 2, endeMs: 100 } });
    z = reduziere(z, { typ: 'timerStart', timer: { rezeptId: 'a', schritt: 3, endeMs: 200 } });
    z = reduziere(z, { typ: 'timerStart', timer: { rezeptId: 'b', schritt: 2, endeMs: 300 } });
    expect(z.timer).toHaveLength(3);
    z = reduziere(z, { typ: 'timerStart', timer: { rezeptId: 'a', schritt: 2, endeMs: 999 } });
    expect(z.timer).toHaveLength(3);
    expect(z.timer.find((t) => t.rezeptId === 'a' && t.schritt === 2)?.endeMs).toBe(999);
    z = reduziere(z, { typ: 'timerStopp', rezeptId: 'a', schritt: 3 });
    expect(z.timer.map((t) => `${t.rezeptId}${t.schritt}`).sort()).toEqual(['a2', 'b2']);
    expect(naechsterTimer(z.timer)?.rezeptId).toBe('b');
  });

  it('merkt sich, dass der Hinweis zur Stummschaltung gezeigt wurde (K3)', () => {
    const z = reduziere(STARTZUSTAND, { typ: 'stummHinweisGesehen' });
    expect(ausGespeichertem(JSON.parse(JSON.stringify(z))).gesehen).toEqual({ stummHinweis: true });
    expect(ausGespeichertem({}).gesehen).toEqual({});
  });
});
