# Recipster

iPhone-App für Rezepte, Wochenplan, Einkaufsliste und Kochen. Die Rezepte bedienen vier Schwerpunkte: Fitness, Keto, Fisch und Familie. Die erste Version läuft ohne Konto und ohne Server, alle Daten liegen auf dem Gerät.

Stand: Grundgerüst mit vier Bereichen und Einstellungen, noch ohne Funktionen. Die Spec in `docs/spec.md` ist ein Entwurf und noch nicht freigegeben.

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `docs/spec.md` | Spec der ersten Version mit Datenmodell, Regeln und Abnahmekriterien |
| `docs/konzept.md` | Konzeptstand mit Umfang, Design und offenen Punkten |
| `data/rezepte/` | Eigene Rezepte als JSON, bisher 33 Stück |
| `data/zutatenkatalog.json` | Zutatenkatalog mit festen Kennungen, Basiseinheit und Umrechnung |
| `docs/entscheidungen/` | Architekturentscheidungen |
| `src/` | App-Code |
| `AGENTS.md` | Arbeitsregeln für KI-Agenten in diesem Repository |

## Technik

React Native mit Expo und TypeScript. Entwickelt wird unter Windows, getestet auf dem iPhone über Expo Go, später über TestFlight.

## Starten

```bash
npm ci
npx expo start
```

Danach den QR-Code mit der iPhone-Kamera scannen. Auf dem iPhone muss die App Expo Go installiert sein, und PC und iPhone müssen im selben WLAN sein.

Prüfen vor jedem Pull Request: `npm run check`.

## Rechte

Alle Rechte vorbehalten. Rezepte, Texte und Figuren sind eigene Inhalte und nicht zur Weiterverwendung freigegeben.
