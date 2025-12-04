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
 * Erstellt einen CRUD-Controller für die Lehrbetriebe-Tabelle
 * Diese Konfiguration verwaltet alle Lese-, Schreib-, Aktualisierungs- und Löschoperationen
 * für Lehrbetriebs-Stammdaten in der Datenbank
 */
$controller = new CrudController(
    // Die Datenbankverbindung (PDO-Instanz)
    $pdo,
    
    // Der Tabellenname in der Datenbank
    'tbl_lehrbetriebe',
    
    // Der Name des Primärschlüssels (eindeutige ID für jeden Lehrbetrieb)
    'id_lehrbetrieb',
    
    // Liste aller Spalten, die über die API gelesen und geschrieben werden dürfen
    // (ohne den Primärschlüssel, dieser wird vom System verwaltet)
    [
        'firma',        // Name/Bezeichnung des Lehrbetriebs/Unternehmens
        'strasse',      // Strasenname und Hausnummer
        'plz',          // Postleitzahl des Lehrbetriebs
        'ort'           // Ort/Stadt des Lehrbetriebs
    ],
    
    // Liste der Pflichtfelder bei POST-Requests (Neuanlage)
    // Diese Felder müssen beim Erstellen eines Lehrbetriebs angegeben werden
    ['firma']
);

// Leitet den eingehenden HTTP-Request an den Controller weiter
// Der Controller bestimmt automatisch die Aktion basierend auf der HTTP-Methode (GET, POST, PUT, DELETE)
$controller->handle();
