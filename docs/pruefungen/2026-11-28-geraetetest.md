# Gerätetest am iPhone durch Rasmus

Stand 28.11.2026. Art der Prüfung: Test von Hand durch Rasmus in Expo Go auf seinem iPhone, Branch `s8-pruefung-codex` (Commit `8c88bbc`). Die Ergebnisse stammen aus seiner Rückmeldung, Bildschirmfotos oder Aufnahmen liegen nicht vor. Gerät und iOS-Version sind nicht festgehalten.

| Geprüft | Ergebnis laut Rasmus |
| --- | --- |
| Navigation durch alle vier Bereiche und zurück aus den Einstellungen (S1-1, S1-2) | funktioniert |
| Mitteilung des Timers bei gesperrtem iPhone (S5-2) | funktioniert |
| Import von einer echten Rezeptseite (S7-1) | funktioniert |
| Große Systemschrift | Zwei Wünsche: Maskottchen größer, mehr Luft im Kopfbereich |

## Was daraus wurde

Im Kopfbereich ist die Figur jetzt 48 statt 36 Punkt groß, der Schriftzug 30 statt 26. Der Kopf ist 68 Punkt hoch statt der Vorgabe des Systems, hat links und rechts denselben Rand wie der Inhalt und eine feine Linie nach unten, damit durchlaufender Inhalt nicht am Logo klebt. Die Figur im Tipp auf „Heute“ ist 88 statt 72 Punkt groß.

Geprüft ist die Änderung nur im Browser bei normaler Schriftgröße, nicht am iPhone und nicht mit großer Systemschrift.
