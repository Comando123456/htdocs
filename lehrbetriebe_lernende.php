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
 * Erstellt einen CRUD-Controller für die Lehrbetriebe-Lernende-Zuordnungstabelle
 * Diese Tabelle verwaltet die Beziehung zwischen Lehrbetrieben und Lernenden (Many-to-Many)
 * und speichert Informationen über die Lehrstelle
 * Diese Konfiguration verwaltet alle Lese-, Schreib-, Aktualisierungs- und Löschoperationen
 */
$controller = new CrudController(
    // Die Datenbankverbindung (PDO-Instanz)
    $pdo,
    
    // Der Tabellenname in der Datenbank (Verknüpfungstabelle für Lehrbetriebe und Lernende)
    'tbl_lehrbetriebe_lernende',
    
    // Der Name des Primärschlüssels (eindeutige ID für jeden Datensatz)
    'id_lehrbetriebe_lernende',
    
    // Liste aller Spalten, die über die API gelesen und geschrieben werden dürfen
    [
        'nr_lehrbetrieb',   // Referenz-ID des Lehrbetriebs (Fremdschlüssel zur Lehrbetriebe-Tabelle)
        'nr_lernende',      // Referenz-ID des Lernenden (Fremdschlüssel zur Lernende-Tabelle)
        'start',            // Startdatum der Lehrstelle (z.B. 2025-01-01)
        'ende',             // Enddatum der Lehrstelle (z.B. 2027-12-31)
        'beruf'             // Berufsbezeichnung oder Lehrberuf (z.B. "Elektrikerin", "Kaufmann")
    ],
    
    // Liste der Pflichtfelder bei POST-Requests (Neuanlage)
    // Diese Felder müssen beim Erstellen einer Zuordnung angegeben werden
    ['nr_lehrbetrieb', 'nr_lernende']
);

// Leitet den eingehenden HTTP-Request an den Controller weiter
// Der Controller bestimmt automatisch die Aktion basierend auf der HTTP-Methode (GET, POST, PUT, DELETE)
$controller->handle();
