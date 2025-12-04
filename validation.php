<?php
// Aktiviert strikte Typprüfung für alle Funktionsargumente und Return-Typen
declare(strict_types=1);

/**
 * Validation - Hilfsklasse für API-Responses und Input-Validierung
 *
 * Enthält einfache, wiederverwendbare Methoden zum:
 * - Erzeugen von JSON-Antworten und Fehlern
 * - Validieren und Parsen von JSON-Request-Bodies
 * - Validieren von Query- und Body-Parametern (z. B. positive IDs)
 * - Prüfen auf erwartete Felder
 */
final class Validation
{
    // ======================
    // Antworten / Fehler
    // ======================

    /**
     * Gibt eine strukturierte JSON-Antwort aus und beendet die Ausführung.
     * - Setzt den HTTP-Statuscode
     * - Setzt Content-Type Header auf application/json; charset=utf-8
     * - Nutzt json_encode mit Flags für Unicode/Safety
     *
     * @param mixed $data Beliebige Daten, die als JSON zurückgegeben werden sollen
     * @param int $statusCode HTTP-Statuscode (Default: 200)
     */
    public static function json(mixed $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');

        $encoded = json_encode(
            $data,
            JSON_UNESCAPED_UNICODE
            | JSON_UNESCAPED_SLASHES
            | JSON_PARTIAL_OUTPUT_ON_ERROR
        );

        // Falls das JSON-Encoding fehlschlägt, wird ein generischer Fehler zurückgegeben
        if ($encoded === false) {
            http_response_code(500);
            echo '{"error":"JSON-Encoding-Fehler"}';
            exit;
        }

        echo $encoded;
        exit;
    }

    /**
     * Hilfsmethode zum Zurückgeben eines Fehlers im JSON-Format.
     * Fügt optional Details hinzu (z. B. fehlende Felder) und beendet die Ausführung.
     *
     * @param string $message Fehlermeldung
     * @param int $statusCode HTTP-Statuscode (Default: 400)
     * @param array|null $details Zusätzliche Fehlerdetails (optional)
     */
    public static function error(string $message, int $statusCode = 400, ?array $details = null): void
    {
        $payload = ['error' => $message];
        if ($details !== null) {
            $payload['details'] = $details;
        }

        self::json($payload, $statusCode);
    }

    // ======================
    // Body / Parameter
    // ======================

    /**
     * Liest und validiert den JSON-Request-Body.
     * - Unterstützt nur POST, PUT und PATCH
     * - Prüft Content-Type und Body-Größe
     * - Parst JSON und prüft auf gültiges Array
     *
     * @return array Dekodiertes JSON als assoziatives Array (oder leeres Array wenn kein Body)
     */
    public static function jsonBody(): array
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        // Nur für Methoden mit Body relevant
        if (!in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
            return [];
        }

        // Beschränkung der Body-Größe (1 MB) zur Vermeidung von DoS durch große Requests
        if (isset($_SERVER['CONTENT_LENGTH']) && (int) $_SERVER['CONTENT_LENGTH'] > 1048576) {
            self::error('Request body zu groß', 413);
        }

        // Content-Type muss application/json enthalten
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($contentType, 'application/json') === false) {
            self::error('Content-Type muss application/json sein', 415);
        }

        // Rohdaten des Bodys lesen
        $raw = file_get_contents('php://input');
        if ($raw === '' || $raw === false) {
            // Kein Body vorhanden => leeres Array zurückgeben
            return [];
        }

        // JSON dekodieren
        $data = json_decode($raw, true);

        // Fehler beim JSON-Parsing abfangen
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
            self::error('Ungültiges JSON im Request-Body', 400, [
                'json_error' => json_last_error_msg(),
            ]);
        }

        return $data;
    }

    /**
     * Liest einen Query-Parameter und validiert, dass er eine positive Integer-Zahl ist.
     * Wenn der Parameter fehlt oder ungültig ist, wird ein Fehler ausgegeben.
     *
     * @param string $name Name des Query-Parameters
     * @return int Validierte positive Ganzzahl
     */
    public static function queryPositiveInt(string $name): int
    {
        if (!isset($_GET[$name])) {
            self::error("Parameter \"{$name}\" ist erforderlich", 400);
        }

        // Cast zu int: Ungültige Werte werden zu 0, negative Werte bleiben negativ
        $value = (int) $_GET[$name];
        if ($value <= 0) {
            self::error("\"{$name}\" muss eine positive Zahl sein", 400);
        }

        return $value;
    }

    /**
     * Validiert, dass im JSON-Body ein bestimmtes Feld eine positive Integer-Zahl enthält.
     *
     * @param array $data Dekodiertes JSON-Array
     * @param string $name Feldname
     * @return int Validierte positive Ganzzahl
     */
    public static function bodyPositiveInt(array $data, string $name): int
    {
        if (!isset($data[$name])) {
            self::error("Feld \"{$name}\" ist erforderlich", 400);
        }

        $value = (int) $data[$name];
        if ($value <= 0) {
            self::error("\"{$name}\" muss eine positive Zahl sein", 400);
        }

        return $value;
    }

    /**
     * Prüft, ob alle erforderlichen Felder in den übergebenen Daten vorhanden sind.
     * Gibt bei fehlenden Feldern einen Fehler mit einer Liste der fehlenden Felder zurück.
     *
     * @param array $data Eingabedaten
     * @param array $required Liste der erforderlichen Feldnamen
     */
    public static function requireFields(array $data, array $required): void
    {
        $missing = [];

        foreach ($required as $field) {
            // Leere Strings gelten als fehlend
            if (!isset($data[$field]) || $data[$field] === '') {
                $missing[] = $field;
            }
        }

        if (!empty($missing)) {
            self::error('Pflichtfelder fehlen', 400, [
                'missing_fields' => $missing,
            ]);
        }
    }

    /**
     * Prüft, ob ein Ergebnis (z. B. aus fetch()) vorhanden ist.
     * Falls nicht, wird ein 404-Fehler mit dem übergebenen Label geworfen.
     *
     * @param mixed $row Ergebnis aus einer Datenbankabfrage
     * @param string $label Bezeichner für die Ressource (z. B. 'Ressource')
     */
    public static function ensureFound(mixed $row, string $label = 'Ressource'): void
    {
        if (!$row) {
            self::error($label . ' nicht gefunden', 404);
        }
    }

    /**
     * Prüft, ob ein Array nicht leer ist; sonst wird ein Fehler mit der übergebenen Nachricht
     * und Statuscode 400 ausgegeben.
     *
     * @param array $arr Zu prüfendes Array
     * @param string $message Fehlermeldung, falls das Array leer ist
     */
    public static function ensureNonEmptyArray(array $arr, string $message): void
    {
        if (empty($arr)) {
            self::error($message, 400);
        }
    }

    /**
     * Prüft, ob eine Datenbank-Operation Auswirkungen hatte (z. B. rowCount > 0).
     * Wenn nicht, wird ein 404-Fehler ausgegeben (Ressource nicht gefunden).
     *
     * @param int $count Anzahl betroffener Zeilen
     * @param string $label Bezeichner für die Ressource
     */
    public static function ensureAffectedRows(int $count, string $label = 'Ressource'): void
    {
        if ($count === 0) {
            self::error($label . ' nicht gefunden', 404);
        }
    }
}