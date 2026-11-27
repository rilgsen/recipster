# AGENTS.md für Recipster

Diese Datei gilt für alle KI-Agenten in diesem Repository. Übergeordnet gilt Rasmus' Entwicklungsstandard für KI-Softwareprojekte aus seinem Ordner `KI-Arbeitskontext` (Einstieg dort: `AGENTS.md`, dann `00_Start_und_Regeln/Bearbeitungsregeln.md`). Bei Widerspruch gewinnt der Standard.

## Zweck

Recipster ist eine iPhone-App für Rezepte, Wochenplan, Einkaufsliste, Vorrat und Kochmodus mit den Schwerpunkten Fitness, Keto, Fisch und Familie. Die erste Version hat kein Konto und keinen Server. Die App soll kommerziell angeboten werden, das Preismodell ist offen.

Maßgeblich ist `docs/spec.md`. Jede Story verweist auf eine Kennung aus Abschnitt 4 der Spec (zum Beispiel S2-3). Was dort als Nichtziel steht, wird nicht gebaut.

## Namen

- App-Name: Recipster. Der Schriftzug wird klein geschrieben: recipster.
- „Choosy“ ist eine fremde App und nur Inspiration. Name, Texte, Bilder und Rezepte daraus werden nie übernommen.
- „Yummi“ und „Yummy“ waren Arbeitstitel und werden nicht mehr verwendet.
- Der App-Name steht im Code an genau einer Stelle (`app.json`, gelesen über `src/constants/brand.ts`).

## Befehle

```bash
npm ci                 # Abhängigkeiten installieren
npx expo start         # Entwicklungsserver, iPhone über Expo Go
npm run lint           # Lint
npm run typecheck      # Typprüfung
npm test               # Unit-Tests
npm run check          # Lint, Typen und Tests zusammen
npx expo install <paket>   # neue Pakete immer so hinzufügen, nie mit npm install
```

## Qualitätstor

Ein Pull Request ist erst fertig, wenn alle Prüfungen in `.github/workflows/pruefung.yml` grün sind: Lint, Typprüfung, Unit-Tests, Build, Abhängigkeitsprüfung und Geheimnisprüfung. Tests werden nie abgeschaltet oder übersprungen, um grün zu werden. Rechenregeln aus Abschnitt 3 der Spec brauchen Unit-Tests.

Jeder Bericht nennt ehrlich, welche Art von Prüfung gelaufen ist: Eigenprüfung, unabhängige Prüfung, ausgeführter BMAD-Workflow oder technische Tests.

## Commit- und Merge-Weg

- Ein Branch je Story, Story-Kennung im Branch-Namen und im Titel des Pull Requests, zum Beispiel `s2-3-portionen-umrechnen`.
- Nie direkt auf `main` pushen. Änderungen laufen über Pull Requests.
- Code von Claude prüft ein anderer Anbieter (Codex), bevor er gemergt wird.
- Merge und jede Veröffentlichung (TestFlight, App Store) brauchen Rasmus' persönliche Freigabe.
- Es gibt immer nur einen schreibenden Agenten je Branch. Höchstens zwei bauende Agenten arbeiten gleichzeitig, und nur an Stories, die sich keine Dateien teilen.

## Ablageorte

| Was | Wo |
| --- | --- |
| Spec und Konzept | `docs/` |
| Architekturentscheidungen | `docs/entscheidungen/`, eine Datei je Entscheidung |
| Rezepte und Zutatenkatalog | `data/` |
| Bildschirme (Routen) | `src/app/` |
| Bausteine, Logik, Konstanten | `src/components/`, `src/lib/`, `src/constants/` |
| Alle sichtbaren Texte | `src/i18n/de.ts`, nie fest im Bildschirm |
| Bilder und Schriften | `assets/` |

## Sicherheit und Daten

- Zugangsdaten, API-Schlüssel und Tokens gehören nie ins Repository, in Übergaben oder in Protokolle.
- Keine Rezepte, Texte oder Fotos von fremden Seiten übernehmen. Der Link-Import speichert nur ins private Kochbuch des Nutzers und immer mit Quellenlink.
- Nährwerte sind bis zur Nachrechnung Schätzwerte und werden in der App so gekennzeichnet.

## Expo: nicht aus dem Gedächtnis arbeiten

Expo ändert mit jeder SDK-Version Schnittstellen. Vor Code, der Expo, EAS oder React Native berührt:

1. Hauptversion von `expo` in `package.json` lesen.
2. Die passende Dokumentation lesen: `https://docs.expo.dev/versions/v<major>.0.0/`, Übersicht unter `https://docs.expo.dev/llms.txt`.
3. Die Ordner `ios/` und `android/` nie von Hand anlegen oder ändern. Natives Verhalten wird in `app.json` und über Config-Plugins eingestellt.
4. Expo Go enthält nur die mitgelieferten nativen Module. Eine Bibliothek mit eigenem nativen Code braucht einen Development Build. Das vorher sagen, nicht hinterher.
