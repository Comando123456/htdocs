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
 * Erstellt einen CRUD-Controller für die Lernende-Tabelle
 * Diese Konfiguration verwaltet alle Lese-, Schreib-, Aktualisierungs- und Löschoperationen
 * für Lernenden-Stammdaten in der Datenbank
 */
$controller = new CrudController(
    // Die Datenbankverbindung (PDO-Instanz)
    $pdo,
    
    // Der Tabellenname in der Datenbank
    'tbl_lernende',
    
    // Der Name des Primärschlüssels (eindeutige ID für jeden Lernenden)
    'id_lernende',
    
    // Liste aller Spalten, die über die API gelesen und geschrieben werden dürfen
    [
        'vorname',          // Vorname des Lernenden
        'nachname',         // Nachname des Lernenden
        'strasse',          // Strassenname und Hausnummer
        'plz',              // Postleitzahl
        'ort',              // Wohnort/Stadt
        'nr_land',          // Landcode/Länder-ID (Fremdschlüssel zur Länder-Tabelle)
        'geschlecht',       // Geschlecht (m/w/d)
        'telefon',          // Telefonnummer (privat oder dienstlich)
        'handy',            // Mobilfunknummer
        'email',            // Geschäfts-E-Mail oder primäre E-Mail
        'email_privat',     // Private E-Mail-Adresse
        'birthdate'         // Geburtsdatum
    ],
    
    // Liste der Pflichtfelder bei POST-Requests (Neuanlage)
    // Diese Felder müssen beim Erstellen eines Lernenden angegeben werden
    ['nachname', 'vorname', 'email']
);

// Leitet den eingehenden HTTP-Request an den Controller weiter
// Der Controller bestimmt automatisch die Aktion basierend auf der HTTP-Methode (GET, POST, PUT, DELETE)
$controller->handle();
