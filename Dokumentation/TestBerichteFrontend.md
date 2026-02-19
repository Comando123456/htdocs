# Testkonzept – Lernende-Verwaltung

## Testumgebung

| Bereich           | Details                           |
|-------------------|-----------------------------------|
| Betriebssystem    | Windows 11 (64-Bit)               |
| Webserver         | Apache 2.4.58 via XAMPP           |
| PHP               | Version 8.2.12                    |
| Datenbank         | MariaDB 10.4.32 (Host: 127.0.0.1) |
| Relevante Tabelle | tbl_lernende                      |
| Browser           | Google Chrome Version 145.0.7632.110 (Offizieller Build) (64-Bit)|

---

## Testdaten

| Feld         | Beispielwert          |
|--------------|-----------------------|
| Vorname      | Anna                  |
| Nachname     | Muster                |
| Strasse      | Bahnhofstrasse 12     |
| PLZ          | 8001                  |
| Ort          | Zürich                |
| Land         | Schweiz               |
| Geschlecht   | Weiblich              |
| Telefon      | 044 123 45 67         |
| Handy        | 079 123 45 67         |
| E-Mail       | anna.muster@lehre.ch  |
| E-Mail privat| anna.muster@gmail.com |
| Geburtsdatum | 15.03.2005            |

---

## 1. Neuer Lernender hinzufügen

**Ziel:** Ein neuer Lernender wird erfolgreich angelegt und erscheint in der Liste.

| Schritt | Aktion                                 | Erwartetes Ergebnis                                          | Tatsächliches Ergebnis                                       |
|---------|----------------------------------------|--------------------------------------------------------------|--------------------------------------------------------------|
| 1       | Seite „Lernende" öffnen                | Liste der Lernenden wird angezeigt                           | Liste der Lernenden wird angezeigt                           |
| 2       | Button **„+ Neuer Lernender"** klicken | Formular öffnet sich                                         | Formular öffnet sich                                         |
| 3       | Alle erforderlichen Daten eingeben     | Eingaben werden übernommen                                   | Eingaben werden übernommen                                   |
| 4       | Speichern klicken                      | Erfolgsmeldung erscheint                                     | Erfolgsmeldung erscheint                                     |
| 5       | Liste prüfen                           | Neuer Lernender erscheint mit korrekten Daten in der Tabelle | Neuer Lernender erscheint mit korrekten Daten in der Tabelle |

**Status:** ✅ Bestanden

---

## 2. Lernender bearbeiten

**Ziel:** Die Daten eines bestehenden Lernenden werden korrekt geändert und gespeichert.

| Schritt | Aktion                                                       | Erwartetes Ergebnis                                    | Tatsächliches Ergebnis                                 |
|---------|--------------------------------------------------------------|--------------------------------------------------------|--------------------------------------------------------|
| 1       | Auf das **Stift-Symbol** eines Eintrags klicken              | Formular öffnet sich mit den bestehenden Daten         | Formular öffnet sich mit den bestehenden Daten         |
| 2       | Einen oder mehrere Werte ändern (zb. Name von Anna zu Annie) | Eingabe wird im Feld übernommen                        | Eingabe wird im Feld übernommen                        |
| 3       | Speichern klicken                                            | Erfolgsmeldung erscheint                               | Erfolgsmeldung erscheint                               |
| 4       | Liste prüfen                                                 | Geänderter Wert wird korrekt in der Tabelle angezeigt  | Geänderter Wert wird korrekt in der Tabelle angezeigt  |

**Status:** ✅ Bestanden

---

## 3. Lernender löschen

**Ziel:** Ein Lernender wird erfolgreich gelöscht und erscheint nicht mehr in der Liste.

| Schritt | Aktion                                                  | Erwartetes Ergebnis                              | Tatsächliches Ergebnis                     |
|---------|---------------------------------------------------------|--------------------------------------------------|--------------------------------------------|
| 1       | Auf das **Löschen-Symbol** (🗑️) eines Eintrags klicken | Bestätigungsdialog erscheint                     | Bestätigungsdialog erscheint               |
| 2       | Löschen bestätigen                                      | geht automatisch zurueck in die Liste             | geht automatisch zurueck in die Liste                   |
| 3       | Liste prüfen                                            | Lernender ist nicht mehr in der Tabelle sichtbar | Lernender ist nicht mehr in der Tabelle sichtbar |

**Status:** ✅ Bestanden

---

## Testergebnis

| Testfall                   | Status |
|----------------------------|--------|
| Neuer Lernender hinzufügen | ✅     |
| Lernender bearbeiten       | ✅     |
| Lernender löschen          | ✅     |

*Alle drei Tests wurden mit ✅ bestanden. Die Funktionen sind erfolgreich abgenommen.*