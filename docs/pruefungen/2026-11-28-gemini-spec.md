# Prüfung der Spec durch Gemini, Bewertung je Befund

Stand 28.11.2026. Geprüft wurde Fassung 1 der Spec. Art der Prüfung: unabhängige Prüfung durch einen anderen Anbieter (Gemini), von Rasmus beauftragt. Die Bewertung unten stammt von Claude und ist eine Eigenprüfung. Geminis Urteil: nicht baureif, nach Überarbeitung baureif mit Auflagen.

Kurzfassung: Von 33 Einzelpunkten sind 22 übernommen, 7 abgewandelt übernommen, 3 abgelehnt und 1 entfällt. Acht der übernommenen Punkte waren im Code schon so gebaut und standen nur nicht in der Spec. Geändert hat sich das Verhalten bei der Stück-Rundung, den Haken, der Vorwarnung der Haltbarkeit und den Filtern für Unverträglichkeiten.

## Blocker

| Befund | Urteil | Was daraus wird |
| --- | --- | --- |
| B1 Freitext gegen Katalogzwang beim Import | Übernommen | Regeln I2 und I3: Zeile zerlegen, nur eindeutige Treffer vorschlagen, Nutzer ordnet zu oder behält eine freie Zeile. Der Katalog wird vom Nutzer nicht erweitert. Kriterium S7-1 nennt den Prüfschritt. |
| B1 Fehlender Rezept-Editor | Übernommen, Rasmus kann widersprechen | I5 und S7-3: von Hand anlegen mit dem Formular des Imports. |
| B2.1 Abgehakt und danach Planerhöhung | Übernommen | E4: Der Haken merkt sich die Menge, offen ist danach nur die Differenz. Im Code umgesetzt (`mitHaken`). |
| B2.2 Gekochte Gerichte zählen weiter | Übernommen, war schon so gebaut | E1 sagt es jetzt ausdrücklich. |
| B2.3 Zeitraum nicht definiert | Übernommen, war schon so gebaut | E1: ab heute 7 oder 14 Tage. |
| B3.1 Zeitpunkt der Rundung | Übernommen | M3 und E2: gerundet wird je Kochvorgang, die Liste zählt die gerundeten Mengen zusammen. |
| B3.2 Teilbare Stück | Übernommen | Katalogfeld `rundung` mit ganz oder halb. Eine dritte Stufe „metrisch“ braucht es nicht, g und ml werden nie gerundet. |
| B3.3 Skalierung bei 12 Personen, Timer | Abgewandelt | M5: Timer bleiben gleich, Hinweis am Rezept. Eigene Regeln für Gewürze bei großen Mengen gibt es nicht. |
| B4.1 Kein Zähler für „Häufig gekauft“ | Übernommen, war schon so gebaut | Kaufzähler steht jetzt im Datenmodell, E5 nennt den Auslöser. Gezählt wird beim Abschließen des Einkaufs, nicht bei jedem Haken, damit ein versehentlicher Haken nicht zählt. |
| B4.2 „Frisch“ ohne Feld | Übernommen, war schon so gebaut | V2: vorgewählt ist alles ohne „immer im Haus“. |
| B4.3 „Bald aufbrauchen“ nach Ablauf | Abgewandelt | V3: 2 Tage Vorwarnung, bei höchstens 3 Tagen Haltbarkeit 1 Tag, sonst stünde frischer Fisch schon am Kauftag in der Warnung. „Abgelaufen“ ist ein eigener Zustand. |
| B4.4 Vorrat ohne Einstieg | Übernommen, war schon so gebaut | V1: über „Vorrat prüfen“ auf der Seite Einkauf. |
| B5.1 Kennungen, Zeitstempel, Löschmarken für Sync | Abgewandelt | Zufällige stabile Kennungen gibt es. Zeitstempel und Löschmarken kommen mit dem Abgleich selbst. Vorher gibt es keinen zweiten Bestand, und der Schemaschritt dafür ist klein. |
| B5.2 Sprachtrennung im Katalog | Abgelehnt in dieser Form | Übersetzungstabellen braucht es nicht, weil mitgelieferte Daten Dateien sind. Eine zweite Sprache ist eine zweite Datei mit denselben Kennungen. Das steht jetzt in Abschnitt 2. |
| B5.3 Seed-Lauf und SQL-Migrationen | Abgelehnt in dieser Form | Der Befund setzt eine gemeinsame SQLite-Datenbank voraus, die es nicht gibt. Übernommen ist die Versionsregel für Nutzerdaten. |
| B5.4 Kaufschranke | Übernommen | `src/lib/funktionen.ts`, liefert immer ja. Ein Feld „Premium“ an Rezepten kommt erst mit dem Preismodell. |

## Wichtig

| Befund | Urteil | Was daraus wird |
| --- | --- | --- |
| W1 Kriterien nicht messbar | Übernommen | S0-2, S1-2, S1-3, S2-2, S3-2, S4-3, S5-2, S7-2 und S8-1 haben jetzt Werte oder verweisen auf eine Regel. Bei S8-1 gilt die größte normale Schriftstufe, die Bedienungshilfen-Stufen sind nicht zugesagt. |
| W2.1 Expo Go als Sackgasse | Abgelehnt für diese Version | Lokale Mitteilungen laufen laut Quelltext von expo-notifications in Expo Go. Belegt wird das durch S0-2 auf deinem iPhone. Ein eigener Build wird erst für Icon-Wechsel und Live Activities nötig, beides ist jetzt Nichtziel. |
| W2.2 Mitteilung geht bei Stummschaltung unter | Abgewandelt | K3: Mitteilung mit Ton und ein Hinweis vor dem ersten Timer. Live Activities kommen später, sie brauchen nativen Code. |
| W2.3 Mehrere Timer | Übernommen | K2: mehrere gleichzeitig, höchstens einer je Schritt. |
| W2.4 Systemdialog beim Icon-Wechsel | Erledigt | Der Icon-Wechsel entfällt in dieser Version. |
| W3.1 Einkaufseinheit | Abgewandelt | Kein zweites Feld. Die Basiseinheit ist die Einkaufseinheit, das steht jetzt in Abschnitt 2. |
| W3.2 Prise in der Summe | Übernommen, war schon so gebaut | M4: Eine Prise hat keine Menge, eine echte Menge gewinnt. |
| W4.1 Urheberrecht beim Import | Übernommen als offener Punkt | Rechtliche Prüfung vor dem Store. I1 hält fest: kein Server, nur auf Aktion, nur privat. |
| W4.2 Geschätzte Nährwerte bei Keto | Übernommen | Vor dem Store Berechnung aus Werten je 100 g am Katalog. Bis dahin „geschätzt“. |
| W4.3 „glutenfrei“ und „laktosefrei“ als Filter | Übernommen, Rasmus kann widersprechen | Beide Filter sind entfernt. vegetarisch, vegan und pescetarisch bleiben. |
| W4.4 Rechte an erzeugten Bildern | Übernommen als offener Punkt | Nutzungsbedingungen prüfen, Hauptfigur als Marke anmelden. |
| W4.5 Apple-Entwicklerkonto zu spät | Abgewandelt | Nicht vor Bauschritt 0 nötig, aber vor TestFlight. Empfehlung: jetzt anmelden. |

## Hinweise

| Befund | Urteil | Was daraus wird |
| --- | --- | --- |
| H1 Rezeptzahl gegen Wiederholungssperre | Abgewandelt | Die Sperre bleibt bei 14 Tagen, W4 fängt zu wenige Rezepte ab. Das Ziel vor dem Store steigt auf 20 Rezepte je Mahlzeit und Ernährungsform. |
| H2 Schwerpunkt, Ernährungsform, Tags | Übernommen | Abschnitt 3, „Einordnung der Rezepte“. |
| H3 Welche Portionszahl gilt | Übernommen, war schon so gebaut | M2 und neues Kriterium S3-4. |
| H4 „Fertig gekocht“ vor dem Kochmodus | Übernommen, war schon so gebaut | V2 nennt beide Stellen. |
| H5 Prüfung durch anderen Anbieter ohne Umfang | Übernommen | Abnahmeweg 4 nennt Umfang und Wirkung. |

## Was offen bleibt

- Eine zweite unabhängige Prüfung der Fassung 2.
- Der bekannte Nachteil des Vorrats ohne Mengen: Ist eine Zutat nach dem Einkauf als vorhanden gebucht, erscheint sie bei einem später geplanten Gericht nicht noch einmal auf der Liste. Die Spec nennt das in Abschnitt 2.
