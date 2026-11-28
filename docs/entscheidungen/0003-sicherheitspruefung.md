# 0003 Sicherheitsprüfung in der Pipeline

Stand 28.11.2026. Von Claude festgelegt nach der Prüfung durch Codex, von Rasmus nicht einzeln bestätigt.

## Was läuft bei jedem Pull Request

- `npm audit --audit-level=high`: schlägt ab Stufe high fehl.
- Gitleaks: schlägt bei jedem Fund fehl.
- CodeQL für JavaScript und TypeScript als Sicherheitsscan des eigenen Codes.
- Alle Actions sind auf einen Commit festgelegt, die Version steht als Kommentar daneben. Checkout speichert keine Zugangsdaten.

## Korrektur des bisherigen Berichts

Kommentar und Text von Pull Request 1 nannten drei Meldungen der Stufe moderate zu minimatch. Richtig ist: `npm audit` meldet 22 betroffene Pakete der Stufe moderate. Sie gehen auf zwei Advisories zurück:

- glob, GHSA-3g3m-2fjr-6pw4, betroffen sind die Versionen 9.0.0 bis 14.0.1
- minimatch, GHSA-g3hv-75wg-m249, betroffen sind die Versionen 7.0.0 bis unter 11.0.1

Beide kommen ausschließlich über `expo`, `jest` und `jest-expo` herein.

## Befristete Ausnahme

Die 22 Meldungen bleiben bis zum nächsten Update des Expo SDK offen, längstens bis 31.01.2027. Dann wird neu geprüft.

- Grund: `npm audit` bietet als Korrektur nur einen Rückschritt auf alte Hauptversionen an (expo 52, jest 29). Das würde die App brechen.
- Einschätzung des Risikos: glob und minimatch laufen hier nur in Werkzeugen beim Bauen und Testen und verarbeiten nur Pfade aus diesem Repository. In der ausgelieferten App stecken sie nicht. Diese Einschätzung ist eine Eigenprüfung.
- Was die Ausnahme nicht deckt: jede neue Meldung ab Stufe high. Die bricht die Pipeline weiter ab.
