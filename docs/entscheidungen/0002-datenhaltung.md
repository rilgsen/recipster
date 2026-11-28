# 0002 Datenhaltung

Stand 28.11.2026. Von Claude festgelegt, von Rasmus nicht einzeln bestätigt.

## Festlegung

- Mitgelieferte Rezepte und der Zutatenkatalog liegen als JSON in `data/` und werden in die App gebündelt. Sie werden zur Laufzeit nie verändert.
- Alles, was der Nutzer erzeugt (Plan, Einkaufsliste, Vorrat, Rezeptstatus, Einstellungen, importierte Rezepte), ist ein einziges Zustandsobjekt mit Versionsnummer. Es wird als JSON über `@react-native-async-storage/async-storage` auf dem Gerät gespeichert.
- Alle Änderungen laufen über reine Funktionen in `src/lib/zustand.ts`. Sie sind ohne Gerät testbar.
- Die Einkaufsliste wird bei jeder Anzeige aus dem Plan berechnet. Gespeichert werden nur Haken und Einträge von Hand. So kann eine Planänderung sie nicht zerstören (S4-2).
- Ein App-Update ersetzt nur die gebündelten Daten. Der Zustand verweist über Kennungen darauf und bleibt unberührt (S8-2). Verweist ein Planeintrag auf ein Rezept, das es nicht mehr gibt, bleibt er als Notiz mit dem alten Titel erhalten.

## Warum nicht SQLite

Die Spec spricht von Tabellen. Für die erwartete Datenmenge (einige hundert Einträge) reicht ein Zustandsobjekt, es läuft in Expo Go und in der Web-Vorschau gleich und braucht keine Migrationen je Tabelle.

Hauptnachteil: Der Zustand wird immer ganz geladen und geschrieben. Ab einigen tausend eigenen Rezepten oder mit Synchronisierung zwischen Geräten wird ein Wechsel auf `expo-sqlite` nötig. Die Speicherung steckt deshalb hinter `src/store/speicher.ts`.

## Nachtrag nach der Prüfung durch Gemini (28.11.2026)

- Die Prüfung ging von einer gemeinsamen SQLite-Datenbank für mitgelieferte und eigene Daten aus und verlangte dafür einen Seed-Lauf bei jedem Update. Den braucht es hier nicht, weil mitgelieferte Daten Dateien sind und nie in den Nutzerdaten liegen.
- Jede Änderung am Aufbau des Zustands erhöht `version` und bringt einen Umwandlungsschritt in `ausGespeichertem` mit eigenem Test mit. Vor der ersten Veröffentlichung bleibt es bei Version 1, weil es noch keine gespeicherten Daten bei Nutzern gibt.
- Ein Haken auf der Einkaufsliste speichert die abgehakte Menge statt nur „ja“ (Regel E4).
- Zeitstempel und Löschmarken für einen späteren Abgleich zwischen Geräten werden nicht vorab eingebaut. Sie kommen mit dem Schemaschritt, der den Abgleich einführt.
