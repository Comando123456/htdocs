<?php
// Aktiviert strikte Typprüfung für alle Funktionsargumente und Return-Typen
declare(strict_types=1);

/**
 * Database - Verwaltet die Datenbankverbindung als Singleton
 * Diese Klasse stellt eine einzige, wiederverwendbare Datenbankverbindung bereit
 * und stellt sicher, dass nur eine PDO-Instanz zur Laufzeit existiert.
 * Die Klasse ist final und kann nicht erweitert werden.
 */
final class Database
{
    /**
     * Statische Eigenschaft für die PDO-Instanz
     * - Wird mit null initialisiert (noch keine Verbindung)
     * - Wird nur einmal beim ersten Zugriff erstellt (Lazy Loading)
     */
    private static ?PDO $pdo = null;

    /**
     * Statische Methode zur Rückgabe der Datenbankverbindung
     * Implementiert das Singleton-Pattern - es gibt nur eine Instanz
     * 
     * @return PDO Die Datenbankverbindung (beim ersten Aufruf erstellt)
     */
    public static function getConnection(): PDO
    {
        // Prüft, ob die PDO-Instanz noch nicht erstellt wurde
        if (self::$pdo === null) {
            // Erstellt eine neue PDO-Instanz mit den Verbindungsparametern:
            // - Host: localhost (lokaler Datenbankserver)
            // - Datenbankname: kursverwaltung (Name der zu verwendenden Datenbank)
            // - Charset: utf8mb4 (Zeichensatz für internationale Zeichen und Emojis)
            // - Benutzer: root (Standard-Administrator-Benutzer)
            // - Passwort: "" (leer - kein Passwort gesetzt)
            self::$pdo = new PDO(
                "mysql:host=localhost;dbname=kursverwaltung;charset=utf8mb4",
                "root",
                ""
            );
            
            // Setzt das Fehlerbehandlungsmodus auf EXCEPTION
            // Dies bedeutet, dass Datenbankfehler als Exceptions geworfen werden
            // und so mit Try-Catch-Blöcken abgefangen werden können
            self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }

        // Gibt die Datenbankverbindung zurück (entweder neu erstellt oder bereits existierend)
        return self::$pdo;
    }
}
