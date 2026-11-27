# Recipster

iPhone-App für Rezepte, Wochenplan, Einkaufsliste und Kochen. Die Rezepte bedienen vier Schwerpunkte: Fitness, Keto, Fisch und Familie. Die erste Version läuft ohne Konto und ohne Server, alle Daten liegen auf dem Gerät.

Stand: Grundgerüst im Aufbau. Die Spec in `docs/spec.md` ist ein Entwurf und noch nicht freigegeben.

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `docs/spec.md` | Spec der ersten Version mit Datenmodell, Regeln und Abnahmekriterien |
| `docs/konzept.md` | Konzeptstand mit Umfang, Design und offenen Punkten |
| `data/rezepte/` | Eigene Rezepte als JSON, bisher 33 Stück |
| `data/zutatenkatalog-entwurf.json` | Zutatenkatalog mit festen Kennungen, Entwurf |
| `AGENTS.md` | Arbeitsregeln für KI-Agenten in diesem Repository |

## Technik

React Native mit Expo und TypeScript. Entwickelt wird unter Windows, getestet auf dem iPhone über Expo Go, später über TestFlight.

## Rechte

Alle Rechte vorbehalten. Rezepte, Texte und Figuren sind eigene Inhalte und nicht zur Weiterverwendung freigegeben.
