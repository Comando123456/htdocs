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
 * Erstellt einen CRUD-Controller für die Länder-Tabelle
 * Diese Konfiguration verwaltet alle Lese-, Schreib-, Aktualisierungs- und Löschoperationen
 * für Landstammdaten in der Datenbank
 */
$controller = new CrudController(
    // Die Datenbankverbindung (PDO-Instanz)
    $pdo,
    
    // Der Tabellenname in der Datenbank (Länder/Staaten)
    'tbl_countries',
    
    // Der Name des Primärschlüssels (eindeutige ID für jedes Land)
    'id_country',
    
    // Liste aller Spalten, die über die API gelesen und geschrieben werden dürfen
    [
        'country'       // Name des Landes (z.B. "Schweiz", "Deutschland", "Österreich")
    ],
    
    // Liste der Pflichtfelder bei POST-Requests (Neuanlage)
    // Diese Felder müssen beim Erstellen eines Landes angegeben werden
    ['country']
);

// Leitet den eingehenden HTTP-Request an den Controller weiter
// Der Controller bestimmt automatisch die Aktion basierend auf der HTTP-Methode (GET, POST, PUT, DELETE)
$controller->handle();