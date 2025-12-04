<?php
// Aktiviert strikte Typprüfung für alle Funktionsargumente und Return-Typen
declare(strict_types=1);

// Importiert die Datenbankverbindungs-Klasse (Singleton-Pattern)
require_once __DIR__ . '/Database.php';

// Importiert den generischen CRUD-Controller für Datenverwaltung
require_once __DIR__ . '/CrudController.php';

// Holt die Datenbankverbindung vom Database-Singleton
$pdo = Database::getConnection();

/**
 * Erstellt einen CRUD-Controller für die Dozenten-Tabelle
 * Diese Konfiguration verwaltet alle Lese-, Schreib-, Aktualisierungs- und Löschoperationen
 */
$controller = new CrudController(
    // Die Datenbankverbindung (PDO-Instanz)
    $pdo,
    
    // Der Tabellenname in der Datenbank
    'tbl_dozenten',
    
    // Der Name des Primärschlüssels (eindeutige ID für jeden Datensatz)
    'id_dozent',
    
    // Liste aller Spalten, die über die API gelesen und geschrieben werden dürfen
    [
        'vorname',      // Vorname des Dozenten
        'nachname',     // Nachname des Dozenten
        'strasse',      // Strassenname und Hausnummer
        'plz',          // Postleitzahl
        'ort',          // Wohnort/Stadt
        'nr_land',      // Landcode/Länder-ID
        'geschlecht',   // Geschlecht (m/w/d)
        'telefon',      // Telefonnummer
        'handy',        // Handynummer
        'email',        // E-Mail-Adresse
        'birthdate'     // Geburtsdatum
    ],
    
    // Liste der Pflichtfelder bei POST-Requests (Neuanlage)
    // Diese Felder müssen beim Erstellen eines Datensatzes angegeben werden
    ['vorname', 'nachname']
);

// Leitet den eingehenden HTTP-Request an den Controller weiter
// Der Controller bestimmt automatisch die Aktion basierend auf der HTTP-Methode (GET, POST, PUT, DELETE)
$controller->handle();