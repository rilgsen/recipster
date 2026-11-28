# Spec: Recipster, erste Version

Stand 28.11.2026. Von Rasmus am 28.11.2026 zum Bau freigegeben („bau die volle Version“). Eine unabhängige Prüfung der Spec durch einen anderen Anbieter steht aus.

Die erste Version liefert Rezepte, Wochenplan, Einkaufsliste, Vorrat und Kochmodus für das iPhone, ohne Konto und ohne Server. „Recipster“ ist ein Arbeitstitel (Rasmus, 28.11.2026). Der endgültige Name wird vor dem Store entschieden, gemerkte Kandidaten sind „Leckr“ und „Crispee“.

## 1 Ziel, Nichtziele, Abnahmeweg

**Ziel:** Eine Person plant in wenigen Minuten die Essen einer Woche, bekommt daraus eine Einkaufsliste ohne doppelte Einkäufe und wird beim Kochen Schritt für Schritt geführt. Die Rezepte bedienen vier Schwerpunkte: Fitness, Keto, Fisch und Familie.

**Nichtziele der ersten Version**

- Konto, Anmeldung, Synchronisierung, geteilter Haushalt
- Händler, mehrere Einkaufslisten, Preise, Budget
- Import aus Instagram, TikTok oder Foto
- Bewertungen für Gesundheit oder Nachhaltigkeit
- Allergenfilter. Die App weist darauf hin, dass sie Allergene nicht prüft.
- Bezahlfunktionen in der ersten Testfassung. Die App soll kommerziell werden, deshalb wird der Aufbau so angelegt, dass sich einzelne Funktionen später hinter einen Kauf legen lassen.
- Zweite Sprache. Alle Texte liegen aber in einer Sprachdatei, nicht im Code.
- Android

**Abnahmeweg**

1. Jeder Bauschritt aus Abschnitt 4 ist eine Story mit den dort genannten Kriterien.
2. Die Rechenregeln aus Abschnitt 3 haben automatische Tests, die bei jedem Pull Request laufen.
3. Du nimmst jeden Bauschritt auf deinem iPhone ab, anfangs über Expo Go, später über TestFlight.
4. Code von Claude prüft ein anderer Anbieter, wie es dein Entwicklungsstandard vorsieht.

## 2 Datenmodell

Alles hängt an einem Zutatenkatalog mit festen Kennungen. Rezepte, Einkaufsliste und Vorrat verweisen auf dieselbe Zutat, nie auf einen frei getippten Namen.

| Tabelle | Wichtigste Felder | Herkunft |
| --- | --- | --- |
| Zutat | Kennung, Name, Abteilung, Basiseinheit (g, ml oder Stück), Umrechnung je Einheit, Haltbarkeit in Tagen, „immer im Haus“ | mitgeliefert, durch Import erweiterbar |
| Rezept | Kennung, Titel, Schwerpunkte, Ernährungsformen, Tags, Mahlzeit, Minuten, Portionen, Nährwerte, Quelle (mitgeliefert oder importiert), Quellenlink | mitgeliefert und eigene |
| Rezeptzutat | Rezept, Zutat, Menge, Einheit | zum Rezept |
| Schritt | Rezept, Reihenfolge, Text, Timer in Sekunden, Tipp | zum Rezept |
| Planeintrag | Datum, Mahlzeit, Rezept oder Notiztext, Portionen, gekocht ja oder nein | vom Nutzer |
| Einkaufseintrag | Zutat oder freier Text, Menge, Einheit, abgehakt, Herkunft (Plan oder von Hand) | berechnet und vom Nutzer |
| Vorratseintrag | Zutat, vorhanden ja oder nein, gekauft am | vom Nutzer |
| Rezeptstatus | Rezept, „mag ich nicht“, zuletzt gekocht am | vom Nutzer |
| Einstellungen | Personenzahl, Ernährungsformen, Kochfigur, Farbwelt, Icon anpassen | vom Nutzer |

**Zwei bewusste Vereinfachungen**

- Der Vorrat kennt nur „vorhanden“ oder „nicht vorhanden“, keine Mengen. Das vermeidet falsche Bestände. Der Nachteil: Die App weiß nicht, ob der Rest Reis für das nächste Gericht reicht.
- Mitgelieferte Rezepte behalten ihre Kennung über alle App-Updates. Ein Update ändert nie Daten des Nutzers.

## 3 Regeln

**Mengen und Portionen**

- Jede Zutat hat eine Basiseinheit. Andere Einheiten werden über den Katalog umgerechnet, etwa ein Esslöffel Butter in Gramm.
- Der Faktor ist Personenzahl geteilt durch die Portionen des Rezepts. Erlaubt sind 1 bis 12 Personen.
- Stückzutaten wie Eier werden auf ganze Stück aufgerundet. Prise und „nach Geschmack“ werden nicht umgerechnet.

**Vorschläge im Wochenplan**

1. Harte Filter: gewählte Ernährungsformen, passende Mahlzeit, nicht „mag ich nicht“.
2. Wiederholungssperre: kein Rezept, das in den letzten 14 Tagen geplant war.
3. Reihenfolge: zuerst Rezepte mit vielen vorhandenen Zutaten, dann kürzere Kochzeit.
4. Gibt es keinen Treffer, wird erst die Wiederholungssperre gelockert und dann ein Hinweis mit dem Grund gezeigt. Die App zeigt nie eine leere Fläche ohne Erklärung.
5. „Mag ich nicht“ lässt sich in den Einstellungen in einer Liste zurücknehmen.

**Einkaufsliste**

- Sie wird aus allen Planeinträgen eines Zeitraums berechnet. Gleiche Zutaten werden in der Basiseinheit zusammengezählt.
- Zutaten, die im Vorrat als vorhanden markiert sind, erscheinen nicht.
- Ändert sich der Plan, wird neu berechnet. Abgehakte Einträge und Einträge von Hand bleiben erhalten.

**Vorrat**

- Nach „fertig gekocht“ fragt die App, welche Zutaten aufgebraucht sind. Vorgewählt sind frische Zutaten, nicht die mit „immer im Haus“.
- Der Hinweis „bald aufbrauchen“ entsteht aus Kaufdatum plus Haltbarkeit der Zutat und erscheint in der App auf der Seite Heute. Mitteilungen außerhalb der App gibt es dafür nicht.

**Kochmodus**

- Der Bildschirm bleibt an, solange der Kochmodus offen ist.
- Ein Timer speichert seine Endzeit. Wird die App verlassen oder das iPhone gesperrt, meldet sich eine lokale Mitteilung. Lehnt jemand Mitteilungen ab, zeigt die App das vor dem Start des Timers an.
- Der Tipp kommt immer von der gewählten Kochfigur. Die Texte sind für alle Figuren gleich.

**Link-Import**

- Nur auf ausdrückliche Aktion, nur ins private Kochbuch, immer mit Quellenlink. Fremde Fotos werden nicht gespeichert.
- Findet die App keine strukturierten Rezeptdaten oder ist das iPhone offline, sagt sie das. Vor dem Speichern prüft und ergänzt der Nutzer die Zutaten.

## 4 Bauschritte und Abnahmekriterien

Jede Zeile ist ein Kriterium mit eigener Kennung für den zugehörigen Test. Die Schritte bauen aufeinander auf. Nach Schritt 5 ist die App im Alltag benutzbar.

| Kennung | Bauschritt | Kriterium |
| --- | --- | --- |
| S0-1 | 0 Probe | Ein leeres Projekt läuft über Expo Go auf deinem iPhone. |
| S0-2 | 0 Probe | Geklärt und belegt, ob lokale Mitteilungen und Icon-Wechsel in Expo Go laufen oder einen eigenen Build brauchen. |
| S1-1 | 1 Grundgerüst | Vier Bereiche Heute, Woche, Rezepte, Einkauf sind über die Leiste erreichbar, das Menü oben rechts öffnet die Einstellungen. |
| S1-2 | 1 Grundgerüst | Farben, Schriften und Logo entsprechen dem Entwurf. App-Name und Schriftzug stehen an genau einer Stelle. |
| S1-3 | 1 Grundgerüst | Prüfungen laufen bei jedem Pull Request: Build, Lint, Typen, Tests, Abhängigkeiten, Geheimnisse. |
| S2-1 | 2 Rezepte | Alle mitgelieferten Rezepte erscheinen in der Liste und lassen sich öffnen. |
| S2-2 | 2 Rezepte | Filter nach Ernährungsform, Kochzeit, Mahlzeit und Zutat liefern nur passende Rezepte. Ohne Treffer steht ein erklärender Hinweis da. |
| S2-3 | 2 Rezepte | Bei geänderter Portionszahl stimmen alle Mengen nach den Regeln, Eier bleiben ganze Stück. |
| S2-4 | 2 Rezepte | „Mag ich nicht“ entfernt das Rezept aus Vorschlägen und lässt sich in den Einstellungen zurücknehmen. |
| S3-1 | 3 Wochenplan | Ein Tag kann mehrere Gerichte haben. Ein Gericht lässt sich auf einen anderen Tag verschieben. |
| S3-2 | 3 Wochenplan | Vorschläge folgen den Regeln aus Abschnitt 3. In einer Woche kommt kein Rezept doppelt vor, solange genug passende da sind. |
| S3-3 | 3 Wochenplan | Statt eines Rezepts lässt sich eine Notiz eintragen. |
| S4-1 | 4 Einkauf | Die Liste aus dem Plan zählt gleiche Zutaten zusammen und ist nach Abteilung sortiert. |
| S4-2 | 4 Einkauf | Nach einer Planänderung bleiben abgehakte und eigene Einträge erhalten. |
| S4-3 | 4 Einkauf | Im Vorrat markierte Zutaten fehlen auf der Liste. „Häufig gekauft“ zeigt die meistgekauften Einträge. |
| S4-4 | 4 Einkauf | Nach „fertig gekocht“ lassen sich aufgebrauchte Zutaten bestätigen. „Bald aufbrauchen“ erscheint nach Ablauf der Haltbarkeit. |
| S5-1 | 5 Kochmodus | Schritte lassen sich vor und zurück blättern, der Bildschirm bleibt an. |
| S5-2 | 5 Kochmodus | Ein Timer meldet sich auch bei gesperrtem iPhone zur richtigen Zeit. |
| S6-1 | 6 Koch-Auswahl | Beim ersten Start lässt sich eine von sechs Figuren mit Farbwelt wählen. Ohne Auswahl gilt der Kürbis. |
| S6-2 | 6 Koch-Auswahl | Die Auswahl ändert Farben, Logo-Figur und Tippgeber sofort und bleibt nach Neustart erhalten. |
| S6-3 | 6 Koch-Auswahl | Icon-Wechsel nur, falls S0-2 ihn als machbar belegt. Sonst entfällt der Schalter. |
| S7-1 | 7 Link-Import | Ein Rezept von einer Seite mit strukturierten Daten landet mit Quellenlink im Kochbuch. |
| S7-2 | 7 Link-Import | Bei Seiten ohne Rezeptdaten oder ohne Netz erscheint eine verständliche Meldung. |
| S8-1 | Übergreifend | Alle Bildschirme sind mit großer Systemschrift bedienbar, Text hat ausreichend Kontrast. |
| S8-2 | Übergreifend | Ein App-Update mit neuen Rezepten lässt Plan, Vorrat und eigene Rezepte unverändert. |

## 5 Annahmen und offene Punkte

**Annahmen, die gelten, bis du widersprichst**

- Nur Deutsch, kein Allergenfilter. Die App wird kommerziell angeboten (Rasmus, 27.11.2026), das Preismodell ist noch offen.
- Vorrat ohne Mengen.
- Die vier Schwerpunkte bleiben, auch wenn das mehr Rezepte verlangt.

**Offen vor dem Store, nicht vor dem Bau**

- Name: „Recipster“ ist Arbeitstitel. Kandidaten „Leckr“ und „Crispee“ haben die Schnellprüfung bestanden (keine identische Marke, keine gleichnamige App, .app frei). Das ist keine Rechtsberatung, vor dem Store sollte eine Markenrecherche bestätigen.
- Rechte an den erzeugten Figuren und Rezeptfotos.
- Nährwerte aus einer Lebensmitteldatenbank statt Schätzung. Bis dahin tragen sie in der App den Zusatz „geschätzt“.
- Datenschutzerklärung, Anbieterangaben, Apple-Entwicklerkonto.
- Mindestens 12 Rezepte je Schwerpunkt und Mahlzeit. Diese Zahl ist mein Vorschlag und noch nicht mit dir abgestimmt.

**Prüfstand dieser Spec:** Eigenprüfung von Claude gegen den Prüfbericht vom 27.11.2026. Eine unabhängige Prüfung der Spec selbst steht aus.
