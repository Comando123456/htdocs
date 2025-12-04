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
 * Erstellt einen CRUD-Controller für die Kurse-Lernende-Zuordnungstabelle
 * Diese Tabelle verwaltet die Beziehung zwischen Kursen und Lernenden (Many-to-Many)
 * Diese Konfiguration verwaltet alle Lese-, Schreib-, Aktualisierungs- und Löschoperationen
 */
$controller = new CrudController(
    // Die Datenbankverbindung (PDO-Instanz)
    $pdo,
    
    // Der Tabellenname in der Datenbank (Verknüpfungstabelle für Kurse und Lernende)
    'tbl_kurse_lernende',
    
    // Der Name des Primärschlüssels (eindeutige ID für jeden Datensatz)
    'id_kurse_lernende',
    
    // Liste aller Spalten, die über die API gelesen und geschrieben werden dürfen
    [
        'nr_kurs',      // Referenz-ID des Kurses (Fremdschlüssel zur Kurse-Tabelle)
        'nr_lernende',  // Referenz-ID des Lernenden (Fremdschlüssel zur Lernende-Tabelle)
        'note'          // Benotung des Lernenden im Kurs (z.B. 1-6 oder Punkte)
    ],
    
    // Liste der Pflichtfelder bei POST-Requests (Neuanlage)
    // Diese Felder müssen beim Erstellen einer Zuordnung angegeben werden
    ['nr_kurs', 'nr_lernende']
);

// Leitet den eingehenden HTTP-Request an den Controller weiter
// Der Controller bestimmt automatisch die Aktion basierend auf der HTTP-Methode (GET, POST, PUT, DELETE)
$controller->handle();