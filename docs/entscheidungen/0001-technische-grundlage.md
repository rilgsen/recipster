# 0001 Technische Grundlage

Stand 27.11.2026. Status: von Claude vorgeschlagen, von Rasmus noch nicht ausdrücklich bestätigt, soweit unten nicht anders vermerkt.

## Entschieden von Rasmus

- React Native mit Expo, weil unter Windows ohne Mac entwickelt wird. Test auf dem iPhone über Expo Go, später TestFlight.
- Keine Konten, kein Server, Daten nur auf dem Gerät.
- App-Name Recipster, Standardfigur Kürbis mit Petrolblau `#1F5C70` und Kürbisorange `#D2691E`.

## Festlegungen im Grundgerüst (S1)

| Thema | Festlegung | Hauptnachteil |
| --- | --- | --- |
| Expo-Version | SDK 58 mit Expo Router, Routen unter `src/app/` | Jede SDK-Version ändert Schnittstellen, Upgrades brauchen Zeit. |
| Navigation | Vier Tabs über `Tabs` aus `expo-router`, Einstellungen als Modal darüber | Die Leiste ist in JavaScript gebaut und sieht nicht exakt wie die native iOS-Leiste aus. Dafür lässt sich der Kopf mit Logo und Menü frei gestalten. |
| App-Name | Steht nur in `app.json`, `src/constants/brand.ts` leitet den Schriftzug ab | Ein Bundle-Name im Store wird später zusätzlich in `app.json` gepflegt. |
| Texte | Alle sichtbaren Texte in `src/i18n/de.ts` | Etwas mehr Schreibarbeit je Bildschirm. |
| Farben | `src/constants/theme.ts`, eine Kochwelt je Figur, Kontraste per Test abgesichert | Nur helles Design, kein Dunkelmodus in der ersten Version. |
| Symbole | SF Symbols über `expo-symbols` | Nur auf iOS echt, in der Web-Vorschau stehen Ersatzzeichen. |

## Offen

- S0-1: Lauf auf dem iPhone über Expo Go ist noch nicht geprüft. Bisher geprüft sind iOS-Bundle und Web-Vorschau.
- S0-2: Ob lokale Mitteilungen und Icon-Wechsel in Expo Go laufen oder einen eigenen Build brauchen.
- Datenhaltung (voraussichtlich `expo-sqlite`) wird vor Bauschritt 2 entschieden.
- Bundle-Kennung für iOS, sobald das Apple-Entwicklerkonto steht.
