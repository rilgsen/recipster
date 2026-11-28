# Recipster: Konzept

Stand: 27.11.2026. Entwurf von Claude aus den Entscheidungen von Rasmus. Noch nicht als Spec freigegeben.

## 1 Ziel

Recipster ist eine iPhone-App, die Wochenplan, Einkaufsliste, Vorrat und Kochen verbindet. Sie soll im App Store erscheinen. Vorbild für die Funktionen ist die App Choosy, die Rasmus als Premium-Nutzer verwendet. Übernommen werden nur Funktionsideen. Name, Aussehen, Texte, Rezepte und Bilder sind eigene.

Zielgruppe nach Rasmus: fitnessorientierte Esser, Keto, Menschen, die gern Fisch essen (pescetarisch), und Familien.

## 2 Umfang der ersten Version (MVP)

Entschieden am 24.11. und 27.11.2026.

1. **Rezepte:** eigene Rezeptbasis in der App. Filter nach Ernährungsform, Kochzeit, Zutat und Mahlzeit. „Mag ich nicht“ am Rezept, danach wird es nie wieder vorgeschlagen.
2. **Wochenplan:** mehrere Gerichte pro Tag. Vorschläge zum Durchwischen je Tag, passend zu Ernährungsform, Kochzeit und Vorrat, nach einfachen Regeln ohne KI-Dienst. Notiz statt Rezept („Reste“, „Restaurant“). Gerichte verschieben.
3. **Einkaufsliste:** entsteht automatisch aus dem Plan, auch direkt aus einem einzelnen Rezept. Sortiert nach Supermarkt-Abteilung. Eigene Einträge. „Häufig gekauft“.
4. **Vorrat:** vor dem Wocheneinkauf abhaken, was zu Hause ist. Nach dem Kochen werden Zutaten ausgebucht. Hinweis, wenn etwas bald abläuft.
5. **Kochmodus:** Schritt für Schritt, mit Timer und Tipp vom Maskottchen.
6. **Import:** eigenes Rezept per Link von einer Webseite in das private Kochbuch.
7. **Haushalt:** Anzahl der Personen, damit die Portionen stimmen.
8. **Koch-Auswahl:** Beim ersten Start wählt man eine von sechs Kochfiguren (Kürbis, Pilz, Olive, Pflaume, Kartoffel, Avocado). Jede hat drei Farbwelten. Die Auswahl ändert Farben der App und auf Wunsch das App-Icon. Standard und Store-Figur ist der Kürbis mit Petrolblau und Orange. In den Einstellungen jederzeit änderbar.

## 3 Nichtziele der ersten Version

- Kein Konto, keine Anmeldung, keine Synchronisierung zwischen Geräten, kein geteilter Haushalt.
- Keine Händlerzuordnung, keine mehreren Einkaufslisten je Händler, keine Preise, kein Budget.
- Kein Import aus Instagram, TikTok oder per Foto.
- Keine Bewertungen für Gesundheit oder Nachhaltigkeit.
- Keine Anbindung an Bring! und kein Preisvergleich. Beides ist als Stufe 2 vorgesehen.
- Keine Lieferdienste.
- Keine Android-Version.

## 4 Technik

- React Native mit Expo, weil Rasmus einen Windows-PC und keinen Mac hat. Test auf dem iPhone über Expo Go, Builds für TestFlight und Store in der Cloud.
- Alle Daten liegen lokal auf dem Gerät in einer Datenbank. Kein eigener Server in der ersten Version.
- Die Rezeptbasis wird mit der App ausgeliefert.
- Der Link-Import liest strukturierte Rezeptdaten von der Webseite direkt auf dem Gerät.
- Das wechselbare App-Icon ist in Expo noch nicht geprüft.

## 5 Inhalt

- Rezepte schreibt Claude selbst, Ziel 200 bis 300. Stand: 33 Rezepte, 8 Muster und Paket 1 mit 25. Format je Rezept: Schwerpunkt, Ernährungsform, Tags, Mahlzeit, Minuten, Portionen, geschätzte Nährwerte, Zutaten mit Menge, Einheit und Supermarkt-Abteilung, Schritte mit Timer und Tipp.
- Nährwerte sind Schätzwerte von Claude und nicht nachgerechnet.
- Rezeptfotos: geplant ist ein Skript, das je Rezept ein Bild über die Schnittstelle eines Bildgenerators erzeugt. Rasmus stellt dafür einen API-Schlüssel. Anbieter und Preise sind noch nicht geprüft.
- Die sechs Kochfiguren hat Rasmus in Gemini erzeugt. Die Nutzungsbedingungen für kommerzielle Verwendung sind noch nicht geprüft. Posen der Figuren fehlen. Ein Illustrator für die Endfassung ist angedacht.
- Fremde Rezeptseiten werden nicht ausgelesen und nicht in die mitgelieferte Rezeptbasis übernommen.

## 6 Design

- Schriften Fraunces für Überschriften und DM Sans für Text. Heller Cremeton als Hintergrund, Petrolblau für Buttons, Kürbisorange für Logo und Akzente. Rot ist Warnungen vorbehalten.
- Logo: Kochfigur links neben dem Schriftzug „recipster“. Die Schrift des Schriftzugs ist noch nicht entschieden.
- App-Icon: nur die Figur, ohne Schriftzug.
- Bildschirme als Entwurf vorhanden: erster Start mit Koch-Auswahl, Heute, Woche, Rezepte, Rezept, Einkauf, Kochmodus, Menü und Einstellungen.

## 7 Geplante Reihenfolge beim Bauen

1. Grundgerüst mit vier Bereichen und Design.
2. Rezepte und Filter.
3. Wochenplan mit Vorschlägen.
4. Einkaufsliste und Vorrat.
5. Kochmodus.
6. Koch-Auswahl und Einstellungen.
7. Link-Import.

## 8 Offen

- Name: „Recipster“ ist Arbeitstitel (Rasmus, 28.11.2026). Kandidaten für den endgültigen Namen sind „Leckr“ und „Crispee“, die Entscheidung fällt vor dem Store. „Yummi“ entfällt wegen einer eingetragenen Marke.
- Geschäftsmodell: Die App soll kommerziell angeboten werden (Rasmus, 27.11.2026). Abo oder Einmalzahlung ist offen.
- Sprache: nur Deutsch oder auch Englisch.
- Abnahmeweg: nicht festgelegt.
- Repository: noch keines vorhanden, GitHub noch nicht verbunden.
- Apple-Entwicklerkonto: noch nicht vorhanden.
- Datenschutzangaben und rechtliche Texte für den Store: nicht begonnen.
