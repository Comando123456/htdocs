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
 * Erstellt einen CRUD-Controller für die Kurse-Tabelle
 * Diese Konfiguration verwaltet alle Lese-, Schreib-, Aktualisierungs- und Löschoperationen
 * für Kursdaten in der Datenbank
 */
$controller = new CrudController(
    // Die Datenbankverbindung (PDO-Instanz)
    $pdo,
    
    // Der Tabellenname in der Datenbank
    'tbl_kurse',
    
    // Der Name des Primärschlüssels (eindeutige ID für jeden Kurs)
    'id_kurs',
    
    // Liste aller Spalten, die über die API gelesen und geschrieben werden dürfen
    [
        'kursnummer',   // Eindeutige Kursnummer für administrative Zwecke
        'kursthema',    // Das Hauptthema oder der Titel des Kurses
        'inhalt',       // Detaillierte Beschreibung des Kursinhalts
        'nr_dozent',    // Referenz-ID des Dozenten (Fremdschlüssel zur Dozenten-Tabelle)
        'startdatum',   // Startdatum des Kurses (z.B. 2025-01-15)
        'enddatum',     // Enddatum des Kurses (z.B. 2025-03-15)
        'dauer'         // Dauer des Kurses in Tagen oder Stunden
    ],
    
    // Liste der Pflichtfelder bei POST-Requests (Neuanlage)
    // Diese Felder müssen beim Erstellen eines Kurses angegeben werden
    ['kursnummer', 'kursthema']
);

// Leitet den eingehenden HTTP-Request an den Controller weiter
// Der Controller bestimmt automatisch die Aktion basierend auf der HTTP-Methode (GET, POST, PUT, DELETE)
$controller->handle();