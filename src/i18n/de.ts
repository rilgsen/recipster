/**
 * Alle sichtbaren Texte der App. Bildschirme enthalten keine festen Texte,
 * damit eine zweite Sprache später nur eine weitere Datei ist.
 */
export const de = {
  tabs: {
    heute: 'Heute',
    woche: 'Woche',
    rezepte: 'Rezepte',
    einkauf: 'Einkauf',
  },
  menue: {
    oeffnen: 'Einstellungen öffnen',
  },
  heute: {
    titel: 'Was gibt es heute?',
    leer: 'Für heute ist noch nichts geplant.',
    tippTitel: 'Tipp vom Koch',
    tipp: 'Sobald dein Wochenplan steht, zeige ich dir hier, was heute auf den Tisch kommt.',
  },
  woche: {
    titel: 'Deine Woche',
    leer: 'Der Wochenplan kommt mit Bauschritt 3.',
  },
  rezepte: {
    titel: 'Rezepte',
    leer: 'Die Rezeptliste kommt mit Bauschritt 2.',
  },
  einkauf: {
    titel: 'Einkaufsliste',
    leer: 'Die Einkaufsliste kommt mit Bauschritt 4.',
  },
  einstellungen: {
    titel: 'Einstellungen',
    fertig: 'Fertig',
    bald: 'Bald',
    punkte: {
      profil: 'Profil',
      koch: 'Koch und Farbwelt',
      ernaehrung: 'Ernährung',
      haushalt: 'Haushalt',
      mitteilungen: 'Mitteilungen',
      apps: 'Verknüpfte Apps',
      datenschutz: 'Datenschutz',
      hilfe: 'Hilfe',
    },
    allergene: 'Die App prüft keine Allergene.',
  },
} as const;
