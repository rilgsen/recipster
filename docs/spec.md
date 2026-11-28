# Spec: Recipster, erste Version

Stand 28.11.2026, Fassung 2. Von Rasmus am 28.11.2026 zum Bau freigegeben („bau die volle Version“). Fassung 2 arbeitet die unabhängige Prüfung durch Gemini vom 28.11.2026 ein. Die Bewertung jedes Befunds steht in `docs/pruefungen/2026-11-28-gemini-spec.md`.

Die erste Version liefert Rezepte, Wochenplan, Einkaufsliste, Vorrat und Kochmodus für das iPhone, ohne Konto und ohne Server. „Recipster“ ist ein Arbeitstitel (Rasmus, 28.11.2026). Der endgültige Name wird vor dem Store entschieden, gemerkte Kandidaten sind „Leckr“ und „Crispee“.

## 1 Ziel, Nichtziele, Abnahmeweg

**Ziel:** Eine Person plant in wenigen Minuten die Essen einer Woche, bekommt daraus eine Einkaufsliste ohne doppelte Einkäufe und wird beim Kochen Schritt für Schritt geführt. Die Rezepte bedienen vier Schwerpunkte: Fitness, Keto, Fisch und Familie.

**Nichtziele der ersten Version**

- Konto, Anmeldung, Synchronisierung, geteilter Haushalt
- Händler, mehrere Einkaufslisten, Preise, Budget
- Import aus Instagram, TikTok oder Foto
- Bewertungen für Gesundheit oder Nachhaltigkeit
- Allergenfilter und Filter für Unverträglichkeiten wie glutenfrei oder laktosefrei. Die App weist beim ersten Start und in den Einstellungen darauf hin, dass sie Allergene nicht prüft.
- Wechsel des App-Icons und Timer auf dem Sperrbildschirm (Live Activities). Beides braucht eigenen nativen Code und kommt frühestens mit dem ersten eigenen Build.
- Bezahlfunktionen in der ersten Testfassung. Die App soll kommerziell werden, deshalb wird der Aufbau so angelegt, dass sich einzelne Funktionen später hinter einen Kauf legen lassen.
- Zweite Sprache. Alle Texte liegen aber in einer Sprachdatei, nicht im Code.
- Android

**Abnahmeweg**

1. Jeder Bauschritt aus Abschnitt 4 ist eine Story mit den dort genannten Kriterien.
2. Die Rechenregeln aus Abschnitt 3 haben automatische Tests, die bei jedem Pull Request laufen.
3. Du nimmst jeden Bauschritt auf deinem iPhone ab, anfangs über Expo Go, später über TestFlight. Alles in dieser Spec läuft in Expo Go. TestFlight braucht das Apple-Entwicklerkonto (Abschnitt 5).
4. Vor jedem Merge prüft ein anderer Anbieter als der Autor den Code gegen die Kriterien aus Abschnitt 4, die Regeln aus Abschnitt 3 und ihre Randfälle. Ein offener Befund der Stufe Blocker verhindert den Merge.

## 2 Datenmodell

Es gibt zwei getrennte Datenbestände. Diese Trennung ist die Grundlage für Updates, eine spätere zweite Sprache und einen späteren Abgleich.

- **Mitgelieferte Daten** (Zutatenkatalog, Rezepte) sind Dateien in der App. Sie werden zur Laufzeit nie geändert. Ein App-Update ersetzt sie vollständig.
- **Nutzerdaten** (Plan, Vorrat, Haken, Einstellungen, eigene Rezepte) liegen als ein versioniertes Objekt auf dem Gerät. Sie verweisen auf mitgelieferte Daten nur über Kennungen.

| Tabelle | Wichtigste Felder | Bestand |
| --- | --- | --- |
| Zutat | Kennung, Name, Mehrzahl, Abteilung, Basiseinheit (g, ml oder Stück), Umrechnung je Einheit, Rundung bei Stück (ganz oder halb), Haltbarkeit in Tagen, „immer im Haus“ | mitgeliefert |
| Rezept | Kennung, Titel, Schwerpunkte, Ernährungsformen, Tags, Mahlzeit, Minuten, Portionen, Nährwerte, Quelle (mitgeliefert, importiert oder selbst angelegt), Quellenlink | mitgeliefert und eigene |
| Rezeptzutat | Rezept, dann entweder Zutat, Menge und Einheit oder eine freie Zeile als Text (nur bei eigenen Rezepten) | zum Rezept |
| Schritt | Rezept, Reihenfolge, Text, Timer in Sekunden, Tipp | zum Rezept |
| Planeintrag | Kennung, Datum, Mahlzeit, Rezept oder Notiztext, Portionen, gekocht ja oder nein | Nutzer |
| Haken | Zutat, abgehakte Menge in der Basiseinheit | Nutzer |
| Eintrag von Hand | Kennung, Text, abgehakt | Nutzer |
| Kaufzähler | Name, Anzahl der Einkäufe | Nutzer |
| Vorratseintrag | Zutat, vorhanden ja oder nein, gekauft am | Nutzer |
| Rezeptstatus | Rezept, „mag ich nicht“, zuletzt gekocht am | Nutzer |
| Laufende Timer | Rezept, Schritt, Endzeit | Nutzer |
| Einstellungen | Personenzahl, Ernährungsformen, Kochfigur, Farbwelt | Nutzer |

Die Einkaufsliste selbst wird nicht gespeichert. Sie wird bei jeder Anzeige aus Plan, Vorrat und Haken berechnet. Gespeichert werden nur Haken, Einträge von Hand und der Kaufzähler.

**Bewusste Vereinfachungen**

- Der Vorrat kennt nur „vorhanden“ oder „nicht vorhanden“, keine Mengen. Das vermeidet falsche Bestände. Der Nachteil: Die App weiß nicht, ob der Rest Reis für das nächste Gericht reicht, und eine als vorhanden geführte Zutat erscheint auch dann nicht auf der Liste, wenn ein später geplantes Gericht mehr davon braucht. Dafür gibt es vor dem Einkauf den Schritt „Vorrat prüfen“.
- Der Katalog wird vom Nutzer nicht erweitert. Was beim Import keiner Zutat zugeordnet wird, bleibt eine freie Zeile (Regeln I2 und I3). So entstehen im Katalog keine Dubletten und keine Zutaten ohne Einheit.
- Die Basiseinheit einer Zutat ist immer die Einheit, in der man sie einkauft: Zwiebeln und Eier in Stück, Mehl in Gramm, Öl in Milliliter.

**Vorbereitet für später, ohne es jetzt zu bauen**

- Updates: Mitgelieferte Rezepte und Zutaten behalten ihre Kennung über alle Versionen. Weil sie Dateien sind und keine Zeilen in der Nutzerdatenbank, braucht ein Update keinen Abgleich. Verweist ein Planeintrag auf ein Rezept, das es nicht mehr gibt, bleibt der Eintrag stehen und wird als „nicht mehr verfügbar“ gezeigt.
- Schemaänderungen: Die Nutzerdaten tragen eine Versionsnummer. Jede Änderung am Aufbau erhöht sie und bringt einen Umwandlungsschritt mit eigenem Test mit. Beim Laden bleibt alles Gültige erhalten, Ungültiges wird durch Startwerte ersetzt.
- Zweite Sprache: Texte der Oberfläche liegen in einer Sprachdatei. Mitgelieferte Daten bekommen je Sprache eine eigene Datei mit denselben Kennungen. Nutzerdaten enthalten keine Katalogtexte.
- Abgleich zwischen Geräten: Planeinträge, Einträge von Hand und eigene Rezepte haben zufällige, stabile Kennungen. Zeitstempel und Löschmarken kommen mit dem Schemaschritt, der den Abgleich einführt. Vorher gibt es keinen zweiten Bestand, mit dem etwas zusammenzuführen wäre.
- Kauf: Jede Funktion fragt an genau einer Stelle im Code, ob sie benutzt werden darf (`src/lib/funktionen.ts`). In der ersten Version ist die Antwort immer ja.

## 3 Regeln

Jede Regel hat eine Kennung, auf die sich die Tests beziehen.

**Mengen und Portionen**

- **M1** Jede Zutat hat eine Basiseinheit. Esslöffel, Teelöffel und Stück werden über den Katalog in die Basiseinheit umgerechnet, etwa ein Esslöffel Butter in Gramm.
- **M2** Der Faktor ist Portionen geteilt durch die Portionen des Rezepts. Erlaubt sind 1 bis 12. Die Personenzahl aus den Einstellungen ist nur die Vorbelegung beim Öffnen eines Rezepts und beim Anlegen eines Planeintrags. Für alles, was aus dem Plan entsteht (Einkaufsliste, Kochen aus dem Plan), gelten die Portionen des Planeintrags.
- **M3** Stück wird je Kochvorgang aufgerundet, und zwar auf den Schritt aus dem Katalog: ganze Stück bei Ei, Knoblauchzehe oder Fischfilet, halbe Stück bei Zwiebel, Gurke, Avocado oder Zitrone. Die kleinste Menge ist ein Schritt.
- **M4** „Prise“ wird nicht umgerechnet. Sie bleibt bei jeder Portionszahl gleich und hat auf der Einkaufsliste keine Menge. Salz und Pfeffer zum Abschmecken stehen als „nach Geschmack“ ohne Zahl in den Zutaten. Jedes Gewürz, das ein Schritt nennt, hat eine Zutatenzeile.
- **M5** Timer und Garzeiten ändern sich mit der Portionszahl nicht. Weicht die Portionszahl vom Rezept ab, steht das als Hinweis am Rezept.

**Vorschläge im Wochenplan**

Ein Vorschlag wird je Tag und Mahlzeit gezogen, es gibt keinen Knopf „ganze Woche füllen“.

1. **W1** Harte Filter: gewählte Ernährungsformen (alle müssen passen), passende Mahlzeit, nicht „mag ich nicht“.
2. **W2** Wiederholungssperre: kein Rezept, das zwischen 14 Tagen vor und 6 Tagen nach dem Zieltag geplant ist. Damit kommt in einer Woche nichts doppelt vor.
3. **W3** Reihenfolge: zuerst Rezepte mit mehr vorhandenen Zutaten, dann kürzere Kochzeit, dann Titel.
4. **W4** Gibt es keinen Treffer, wird die Wiederholungssperre aufgehoben. Gibt es dann immer noch keinen, steht ein Hinweis mit dem Grund da. Die App zeigt nie eine leere Fläche ohne Erklärung.
5. **W5** „Mag ich nicht“ lässt sich in den Einstellungen in einer Liste zurücknehmen.

**Einkaufsliste**

- **E1** Zeitraum: von heute an 7 oder 14 Tage, umschaltbar, Vorgabe 7. Es zählen alle Planeinträge mit Rezept in diesem Zeitraum, die nicht als gekocht markiert sind. Notizen zählen nicht.
- **E2** Je Zutat werden die Mengen zusammengezählt, die die Rezepte anzeigen, also nach M3. Stück wird in der Summe auf ganze Stück aufgerundet, weil man ganze Stück kauft. Drei Gerichte mit je einem aufgerundeten Ei ergeben drei Eier, drei mit je einer halben Zwiebel ergeben zwei Zwiebeln.
- **E3** Zutaten, die als vorhanden gelten, erscheinen nicht. Vorhanden ist, was der Nutzer so markiert hat. Ohne Angabe des Nutzers gilt „immer im Haus“ aus dem Katalog.
- **E4** Ein Haken merkt sich die Menge, die beim Abhaken auf der Liste stand. Steigt der Bedarf danach durch eine Planänderung, ist die Zutat wieder offen und zeigt nur die Differenz, mit dem Hinweis, wie viel schon abgehakt ist. Sinkt der Bedarf, bleibt der Haken. Einträge von Hand bleiben bei jeder Neuberechnung unverändert.
- **E5** „Einkauf abschließen“ bucht alle abgehakten Zutaten als vorhanden in den Vorrat, setzt ihr Kaufdatum auf heute, erhöht den Kaufzähler um eins je Eintrag und entfernt die Haken und die abgehakten Einträge von Hand. Nur hier wird das Kaufdatum durch den Einkauf gesetzt.
- **E6** „Häufig gekauft“ zeigt höchstens 8 Einträge mit den meisten Einkäufen, ab dem ersten Einkauf, ohne das, was schon auf der Liste steht.
- **E7** Freie Zeilen aus eigenen Rezepten (I3) erscheinen als Text unter „Sonstiges“. Sie werden nicht zusammengezählt und nicht mit dem Vorrat abgeglichen.

**Vorrat**

- **V1** Der Vorrat ist über „Vorrat prüfen“ auf der Seite Einkauf erreichbar. Er hat keinen eigenen Bereich in der Leiste.
- **V2** „Fertig gekocht“ gibt es an zwei Stellen: am Planeintrag (Seiten Heute und Woche) und am Ende des Kochmodus. Danach fragt die App, welche Zutaten aufgebraucht sind. Vorgewählt sind alle Zutaten des Rezepts ohne „immer im Haus“.
- **V3** „Bald aufbrauchen“ erscheint auf der Seite Heute, wenn bis zum Ablauf (Kaufdatum plus Haltbarkeit) höchstens 2 Tage bleiben, bei Zutaten mit höchstens 3 Tagen Haltbarkeit höchstens 1 Tag. Ist der Ablauf überschritten, steht dort „seit n Tagen über der Haltbarkeit“. Ohne Kaufdatum oder bei unbegrenzter Haltbarkeit gibt es keinen Hinweis. Mitteilungen außerhalb der App gibt es dafür nicht.

**Kochmodus**

- **K1** Der Bildschirm bleibt an, solange der Kochmodus offen ist.
- **K2** Ein Timer speichert seine Endzeit, nicht die Restzeit. Mehrere Timer dürfen gleichzeitig laufen, höchstens einer je Schritt. Laufende Timer sind in jedem Schritt sichtbar.
- **K3** Für jeden Timer wird eine lokale Mitteilung mit Ton zur Endzeit geplant. Sie kommt auch bei gesperrtem iPhone. Bei Stummschaltung oder einem Fokus kann sie lautlos bleiben, das sagt die App einmalig vor dem ersten Timer. Lehnt jemand Mitteilungen ab, steht das vor dem Start jedes Timers da, und der Timer läuft nur in der App.
- **K4** Der Tipp kommt immer von der gewählten Kochfigur. Die Texte sind für alle Figuren gleich.

**Eigene Rezepte und Link-Import**

- **I1** Import nur auf ausdrückliche Aktion, ein Link je Aktion, nur ins private Kochbuch auf dem Gerät, immer mit Quellenlink. Fremde Fotos werden nicht gespeichert. Es gibt keinen Server, der fremde Seiten abruft oder speichert.
- **I2** Die App liest die strukturierten Rezeptdaten der Seite (schema.org/Recipe). Jede Zutatenzeile wird in Menge, Einheit und Name zerlegt und mit Name und Mehrzahl des Katalogs verglichen. Nur ein eindeutiger Treffer wird vorgeschlagen, es wird nicht geraten.
- **I3** Vor dem Speichern sieht der Nutzer jede Zeile mit dem Vorschlag und kann die Zutat aus dem Katalog wählen, Menge und Einheit ändern oder die Zeile als freien Text behalten. Freie Zeilen stehen im Rezept wie im Original, werden nicht umgerechnet und folgen E7.
- **I4** Findet die App keine strukturierten Rezeptdaten, ist die Adresse ungültig oder das iPhone offline, erscheint eine Meldung, die den Grund nennt und sagt, was der Nutzer tun kann. Es wird nichts gespeichert.
- **I5** Ein eigenes Rezept lässt sich auch ohne Link von Hand anlegen, mit demselben Formular wie in I3. Eigene Rezepte lassen sich ändern und löschen.

**Einordnung der Rezepte**

- Schwerpunkt (Fitness, Keto, Fisch, Familie) ist die redaktionelle Sammlung. Er ist Filter in der Rezeptliste und keine Einstellung.
- Ernährungsform (vegetarisch, vegan, pescetarisch) ist die harte Grenze. Sie ist Einstellung, Filter in der Rezeptliste und Filter W1.
- Tags sind freie Stichworte. Sie werden nur von der Suche gelesen.

## 4 Bauschritte und Abnahmekriterien

Jede Zeile ist ein Kriterium mit eigener Kennung für den zugehörigen Test. Die Schritte bauen aufeinander auf. Nach Schritt 5 ist die App im Alltag benutzbar.

| Kennung | Bauschritt | Kriterium |
| --- | --- | --- |
| S0-1 | 0 Probe | Ein leeres Projekt läuft über Expo Go auf deinem iPhone. |
| S0-2 | 0 Probe | Eine geplante lokale Mitteilung kommt in Expo Go auf deinem iPhone bei gesperrtem Bildschirm an. Das Ergebnis steht in `docs/entscheidungen/`. |
| S1-1 | 1 Grundgerüst | Vier Bereiche Heute, Woche, Rezepte, Einkauf sind über die Leiste erreichbar, das Menü oben rechts öffnet die Einstellungen. |
| S1-2 | 1 Grundgerüst | Farben und Schriften stimmen mit den Werten in `src/constants/theme.ts` überein, die aus den Tafeln App-Heute bis App-Kochmodus der Designfläche stammen. Der sichtbare App-Name steht nur in `app.json`. Ein Test prüft, dass Name und Schriftzug daraus abgeleitet werden. |
| S1-3 | 1 Grundgerüst | Bei jedem Pull Request laufen Build, Lint, Typprüfung, Tests, `npm audit` (schlägt ab Stufe high fehl), Gitleaks (schlägt bei jedem Fund fehl) und CodeQL. Die Typprüfung erzeugt vorher die Routentypen, damit ein falsches Navigationsziel scheitert. |
| S2-1 | 2 Rezepte | Alle mitgelieferten Rezepte erscheinen in der Liste und lassen sich öffnen. |
| S2-2 | 2 Rezepte | Filter: Schwerpunkt (einer), Ernährungsform (mehrere, alle müssen passen), Mahlzeit (eine), Kochzeit (bis 20, bis 30 oder bis 45 Minuten), Suche in Titel, Zutaten und Tags. Verschiedene Filter gelten zusammen. Ohne Treffer steht ein Hinweis mit einem Knopf zum Zurücksetzen da. |
| S2-3 | 2 Rezepte | Bei geänderter Portionszahl stimmen alle Mengen nach M1 bis M4: Eier bleiben ganze Stück, eine Zwiebel wird höchstens halbiert. |
| S2-4 | 2 Rezepte | „Mag ich nicht“ entfernt das Rezept aus Vorschlägen und lässt sich in den Einstellungen zurücknehmen. |
| S3-1 | 3 Wochenplan | Ein Tag kann mehrere Gerichte haben. Ein Gericht lässt sich auf einen anderen Tag verschieben. |
| S3-2 | 3 Wochenplan | Vorschläge folgen W1 bis W4. |
| S3-3 | 3 Wochenplan | Statt eines Rezepts lässt sich eine Notiz eintragen. |
| S3-4 | 3 Wochenplan | Die Portionen eines Planeintrags lassen sich abweichend von den Einstellungen ändern. Die Einkaufsliste rechnet mit den Portionen des Eintrags (M2). |
| S4-1 | 4 Einkauf | Die Liste folgt E1 bis E3 und ist nach Abteilung sortiert. |
| S4-2 | 4 Einkauf | Haken und eigene Einträge folgen E4: Nach einer Planerhöhung ist nur die Differenz offen. |
| S4-3 | 4 Einkauf | „Einkauf abschließen“ folgt E5, „Häufig gekauft“ folgt E6. |
| S4-4 | 4 Einkauf | „Fertig gekocht“ am Planeintrag und „Bald aufbrauchen“ folgen V2 und V3. |
| S5-1 | 5 Kochmodus | Schritte lassen sich vor und zurück blättern, der Bildschirm bleibt an. Am Ende steht „Fertig gekocht“ nach V2. |
| S5-2 | 5 Kochmodus | Ein Timer meldet sich bei gesperrtem iPhone höchstens 5 Sekunden nach seiner Endzeit. Nach Schließen und Öffnen der App stimmt die Restzeit auf 1 Sekunde. |
| S5-3 | 5 Kochmodus | Zwei Timer aus verschiedenen Schritten laufen gleichzeitig und melden sich einzeln (K2). Die Hinweise aus K3 erscheinen. |
| S6-1 | 6 Koch-Auswahl | Beim ersten Start lässt sich eine von sechs Figuren mit Farbwelt wählen. Ohne Auswahl gilt der Kürbis. Der Hinweis zu Allergenen steht auf diesem Bildschirm. |
| S6-2 | 6 Koch-Auswahl | Die Auswahl ändert Farben, Logo-Figur und Tippgeber sofort und bleibt nach Neustart erhalten. |
| S7-1 | 7 Eigene Rezepte | Ein Link auf eine Seite mit strukturierten Rezeptdaten führt zum Prüfbildschirm nach I2 und I3. Nach dem Speichern steht das Rezept mit Quellenlink im Kochbuch. |
| S7-2 | 7 Eigene Rezepte | Für jeden der drei Fälle aus I4 erscheint die festgelegte Meldung, und nichts wird gespeichert. |
| S7-3 | 7 Eigene Rezepte | Ein Rezept lässt sich von Hand anlegen, ändern und löschen (I5). |
| S7-4 | 7 Eigene Rezepte | Zugeordnete Zutaten eines eigenen Rezepts erscheinen summiert auf der Einkaufsliste, freie Zeilen nach E7. |
| S8-1 | Übergreifend | Bis zur größten normalen Schriftstufe von iOS (ohne die Bedienungshilfen-Stufen) ist kein Text abgeschnitten oder überlagert. Text hat einen Kontrast von mindestens 4,5 zu 1, große Überschriften mindestens 3 zu 1. Die Farbwerte prüft ein Test. |
| S8-2 | Übergreifend | Ein Test lädt gespeicherte Nutzerdaten mit einem anderen Rezeptbestand: Plan, Vorrat und eigene Rezepte sind unverändert. |

## 5 Annahmen und offene Punkte

**Annahmen, die gelten, bis du widersprichst**

- Nur Deutsch. Die App wird kommerziell angeboten (Rasmus, 27.11.2026), das Preismodell ist noch offen.
- Vorrat ohne Mengen.
- Die vier Schwerpunkte bleiben, auch wenn das mehr Rezepte verlangt.
- „glutenfrei“ und „laktosefrei“ sind keine Filter mehr und stehen auch nicht mehr an den Rezepten. Das wäre eine Zusage, die die App ohne geprüfte Allergendaten nicht halten kann. Codex hat ein so gekennzeichnetes Rezept mit gewöhnlicher Sojasauce gefunden.
- Eigene Rezepte von Hand (I5, S7-3) gehören zur ersten Version, weil der Prüfbildschirm des Imports dasselbe Formular ist.
- Kein Icon-Wechsel und kein Timer auf dem Sperrbildschirm in der ersten Version.

**Vor TestFlight nötig**

- Apple-Entwicklerkonto (99 US-Dollar im Jahr). Für die Abnahme über Expo Go braucht es das Konto nicht. Die Anmeldung kann einige Tage dauern.

**Offen vor dem Store, nicht vor dem Bau**

- Name: „Recipster“ ist Arbeitstitel. Kandidaten „Leckr“ und „Crispee“ haben die Schnellprüfung bestanden (keine identische Marke, keine gleichnamige App, .app frei). Das ist keine Rechtsberatung, vor dem Store sollte eine Markenrecherche bestätigen.
- Nährwerte: Bis zur Nachrechnung tragen sie den Zusatz „geschätzt“. Vor dem Store werden sie aus Werten je 100 g am Zutatenkatalog berechnet (Quelle Bundeslebensmittelschlüssel oder USDA), und die Einordnung „Keto“ folgt aus den berechneten Kohlenhydraten. Dazu kommt der Hinweis, dass die App keine medizinische Ernährungsberatung ist.
- Rechtliche Prüfung des Link-Imports, vor allem der Übernahme fremder Zubereitungstexte in ein bezahltes Produkt.
- Schrift des Schriftzugs. Gebaut ist Fredoka, das Konzept lässt die Wahl offen.
- Rechte an den erzeugten Figuren und Rezeptfotos: Nutzungsbedingungen des Bildgenerators prüfen, die Hauptfigur als Marke anmelden.
- Datenschutzerklärung, Anbieterangaben.
- Rezeptbestand: mindestens 20 Rezepte je Mahlzeit für jede Ernährungsform und für Keto, damit die Wiederholungssperre W2 im Alltag nicht ständig aufgehoben wird. Heute sind es weniger, die Regel W4 fängt das ab.

**Prüfstand dieser Spec:** Fassung 1 wurde am 28.11.2026 von Gemini unabhängig geprüft (Urteil: nicht baureif, 5 Blocker). Fassung 2 ist die Überarbeitung durch Claude und bisher nur eigengeprüft. Eine zweite unabhängige Prüfung der Fassung 2 steht aus.
