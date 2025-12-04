<?php
// Aktiviert strikte Typprüfung für alle Funktionsargumente und Return-Typen
declare(strict_types=1);

// Importiert die Validierungsklasse für Fehlerbehandlung und Datenvalidierung
require_once __DIR__ . '/validation.php';

/**
 * CrudController - Verwaltet alle CRUD-Operationen (Create, Read, Update, Delete)
 * für eine beliebige Datentabelle mit REST-API-Funktionalität.
 * Diese Klasse ist final und kann nicht erweitert werden.
 */
final class CrudController
{
    // Datenbankverbindung (PDO-Instanz)
    private PDO $pdo;
    
    // Name der Tabelle, auf die dieser Controller zugreift
    private string $table;
    
    // Name des Primärschlüssels (z.B. 'id') für die Tabelle
    private string $primaryKey;
    
    // Liste der Spalten, die für Lese- und Schreiboperationen erlaubt sind
    private array $allowedColumns;
    
    // Liste der Spalten, die bei POST-Requests (Erzeugung) erforderlich sind
    private array $requiredColumns;

    /**
     * Konstruktor - Initialisiert den CRUD-Controller mit notwendigen Parametern
     * 
     * @param PDO $pdo                 Datenbankverbindung
     * @param string $table            Name der zu verwaltenden Tabelle
     * @param string $primaryKey       Name des Primärschlüssels (z.B. 'id')
     * @param array $allowedColumns    Spalten, die gelesen/geschrieben werden dürfen
     * @param array $requiredColumns   Spalten, die bei Neuanlage erforderlich sind (optional)
     */
    public function __construct(
        PDO $pdo,
        string $table,
        string $primaryKey,
        array $allowedColumns,
        array $requiredColumns = []
    ) {
        // Speichert die Datenbankverbindung
        $this->pdo             = $pdo;
        
        // Speichert den Tabellennamen
        $this->table           = $table;
        
        // Speichert den Namen des Primärschlüssels
        $this->primaryKey      = $primaryKey;
        
        // Speichert die Liste erlaubter Spalten
        $this->allowedColumns  = $allowedColumns;
        
        // Speichert die Liste erforderlicher Spalten (Standard: leeres Array)
        $this->requiredColumns = $requiredColumns;
    }

    /**
     * Haupteinstiegspunkt - Verarbeitet den HTTP-Request und leitet ihn an die richtige Methode
     * Diese Methode wird aufgerufen, um den eingehenden Request zu verarbeiten.
     */
    public function handle(): void
    {
        // Setzt den HTTP-Header für JSON-Response mit UTF-8-Zeichensatz
        header('Content-Type: application/json; charset=utf-8');
        
        // Erlaubt Zugriff von allen Origins (CORS - Cross-Origin Resource Sharing)
        header('Access-Control-Allow-Origin: *');
        
        // Erlaubt die HTTP-Methoden GET, POST, PUT, DELETE und OPTIONS
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        
        // Erlaubt die HTTP-Header Content-Type und Authorization
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        // Liest die HTTP-Methode aus dem Request (GET, POST, PUT, DELETE, etc.), Standard: GET
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        // Wenn die Methode OPTIONS ist (Preflight-Request für CORS), wird ein leerer Response gesendet
        if ($method === 'OPTIONS') {
            // Sendet HTTP-Status 204 (No Content)
            http_response_code(204);
            // Beendet die Skriptausführung
            exit;
        }

        // Try-Catch-Block für Fehlerbehandlung
        try {
            // Leitet den Request basierend auf der HTTP-Methode an die richtige Funktion
            switch ($method) {
                case 'GET':
                    // Ruft die Funktion für GET-Requests auf (Daten auslesen)
                    $this->handleGet();
                    break;
                case 'POST':
                    // Ruft die Funktion für POST-Requests auf (neue Daten anlegen)
                    $this->handlePost();
                    break;
                case 'PUT':
                    // Ruft die Funktion für PUT-Requests auf (Daten aktualisieren)
                    $this->handlePut();
                    break;
                case 'DELETE':
                    // Ruft die Funktion für DELETE-Requests auf (Daten löschen)
                    $this->handleDelete();
                    break;
                default:
                    // Wenn die HTTP-Methode nicht unterstützt wird, wird ein Fehler geworfen
                    Validation::error('HTTP-Methode nicht erlaubt', 405);
            }
        } catch (Throwable $e) {
            // Fängt alle Fehler ab und gibt eine generische Fehlermeldung zurück
            // (keine Details nach aussen, um Sicherheit zu gewährleisten)
            Validation::error('Interner Serverfehler', 500);
        }
    }

    /**
     * GET - Verarbeitet Lesezugriffe auf Datenbankdaten
     * - Mit Parameter 'all': Gibt alle Datensätze zurück
     * - Mit Primärschlüssel: Gibt einen spezifischen Datensatz zurück
     */
    private function handleGet(): void
    {
        // Prüft, ob der Query-Parameter 'all' gesetzt ist
        if (isset($_GET['all'])) {
            // Liest alle Datensätze aus der Tabelle ohne WHERE-Bedingung
            $stmt = $this->pdo->query("SELECT * FROM {$this->table}");
            
            // Holt alle Zeilen als assoziatives Array (Spaltenname => Wert)
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Gibt die Ergebnisse als JSON zurück
            Validation::json($rows);
        }

        // Wenn 'all' nicht gesetzt ist, wird ein spezifischer Datensatz gelesen
        // Validiert und liest die ID aus den Query-Parametern (muss positiv ganze Zahl sein)
        $id = Validation::queryPositiveInt($this->primaryKey);

        // Bereitet einen SQL-Statement für sichere Parameterersetzung vor (verhindert SQL-Injection)
        $stmt = $this->pdo->prepare(
            "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?"
        );
        
        // Führt die Abfrage mit der übergebenen ID aus
        $stmt->execute([$id]);
        
        // Holt das Ergebnis als assoziatives Array (oder null, wenn nicht gefunden)
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        // Prüft, ob ein Datensatz gefunden wurde, sonst gibt ein Fehler zurück
        Validation::ensureFound($row);

        // Gibt den gefundenen Datensatz als JSON zurück
        Validation::json($row);
    }

    /**
     * POST - Verarbeitet die Erstellung neuer Datensätze
     * Erwartet JSON-Daten im Request-Body mit Spaltenname => Wert Paaren
     */
    private function handlePost(): void
    {
        // Liest den JSON-Body aus dem Request und konvertiert ihn zu einem Array
        $data = Validation::jsonBody();

        // Prüft, ob erforderliche Spalten vorhanden sind (wenn diese definiert wurden)
        if (!empty($this->requiredColumns)) {
            // Validiert, dass alle erforderlichen Felder in den Eingabedaten vorhanden sind
            Validation::requireFields($data, $this->requiredColumns);
        }

        // Arrays für die SQL-INSERT-Abfrage
        // $columns: Liste der Spaltennamen
        // $values: Liste der entsprechenden Werte
        $columns = [];
        $values  = [];

        // Iteriert über alle erlaubten Spalten
        foreach ($this->allowedColumns as $col) {
            // Prüft, ob die Spalte in den Eingabedaten vorhanden ist
            if (array_key_exists($col, $data)) {
                // Fügt den Spaltennamen zur Liste hinzu
                $columns[] = $col;
                
                // Fügt den entsprechenden Wert zur Liste hinzu
                $values[]  = $data[$col];
            }
        }

        // Prüft, ob mindestens ein Feld zum Einfügen vorhanden ist
        Validation::ensureNonEmptyArray(
            $columns,
            'Keine gültigen Felder zum Erstellen übergeben'
        );

        // Erstellt Platzhalter für die Werte (z.B. "?, ?, ?" für 3 Werte)
        $placeholders = implode(', ', array_fill(0, count($columns), '?'));

        // Baut die SQL-INSERT-Abfrage zusammen
        $sql = "INSERT INTO {$this->table} (" . implode(', ', $columns) . ")
                VALUES ({$placeholders})";

        // Bereitet die Abfrage für sichere Parameterersetzung vor
        $stmt = $this->pdo->prepare($sql);
        
        // Führt die Abfrage mit den Werten aus
        $stmt->execute($values);

        // Holt die zuletzt eingefügte ID (von der Datenbank generiert)
        $newId = (int) $this->pdo->lastInsertId();

        // Gibt die neue ID und eine Erfolgsmeldung mit HTTP-Status 201 (Created) zurück
        Validation::json([
            $this->primaryKey => $newId,
            'message'         => 'Ressource erfolgreich erstellt',
        ], 201);
    }

    /**
     * PUT - Verarbeitet die Aktualisierung bestehender Datensätze
     * Erwartet JSON-Daten mit dem Primärschlüssel und den zu aktualisierenden Feldern
     */
    private function handlePut(): void
    {
        // Liest den JSON-Body aus dem Request
        $data = Validation::jsonBody();

        // Validiert und liest die ID aus den Daten (muss positiv ganze Zahl sein)
        $id = Validation::bodyPositiveInt($data, $this->primaryKey);

        // Arrays für die SQL-UPDATE-Abfrage
        // $sets: Liste der SET-Klauseln (z.B. "name = ?")
        // $params: Liste der Parameter für die sichere Abfrage
        $sets   = [];
        $params = [];

        // Iteriert über alle erlaubten Spalten
        foreach ($this->allowedColumns as $col) {
            // Prüft, ob die Spalte in den Eingabedaten vorhanden ist
            if (array_key_exists($col, $data)) {
                // Fügt die SET-Klausel hinzu (z.B. "name = ?")
                $sets[]   = "$col = ?";
                
                // Fügt den Wert zu den Parametern hinzu
                $params[] = $data[$col];
            }
        }

        // Prüft, ob mindestens ein Feld zum Aktualisieren vorhanden ist
        Validation::ensureNonEmptyArray(
            $sets,
            'Keine gültigen Felder zum Aktualisieren übergeben'
        );

        // Fügt die ID am Ende der Parameter hinzu (für die WHERE-Bedingung)
        $params[] = $id;

        // Baut die SQL-UPDATE-Abfrage zusammen
        $sql  = "UPDATE {$this->table} SET " . implode(', ', $sets) . " WHERE {$this->primaryKey} = ?";
        
        // Bereitet die Abfrage für sichere Parameterersetzung vor
        $stmt = $this->pdo->prepare($sql);
        
        // Führt die Abfrage mit den Parametern aus
        $stmt->execute($params);

        // Prüft, ob eine Zeile aktualisiert wurde
        if ($stmt->rowCount() === 0) {
            // Falls keine Zeile aktualisiert wurde, prüft, ob der Datensatz existiert
            $check = $this->pdo->prepare(
                "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?"
            );
            $check->execute([$id]);
            $row = $check->fetch(PDO::FETCH_ASSOC);

            // Wenn der Datensatz nicht existiert, wird ein Fehler zurückgegeben
            Validation::ensureFound($row);

            // Wenn der Datensatz existiert aber nicht geändert wurde, wird eine Nachricht zurückgegeben
            Validation::json(['message' => 'Keine Änderungen vorgenommen (Daten identisch)']);
        } else {
            // Wenn die Aktualisierung erfolgreich war, werden die aktualisierten Daten gelesen und zurückgegeben
            $get = $this->pdo->prepare(
                "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?"
            );
            $get->execute([$id]);
            $updated = $get->fetch(PDO::FETCH_ASSOC);

            // Gibt eine Erfolgsmeldung zusammen mit den aktualisierten Daten zurück
            Validation::json([
                'message' => 'Ressource erfolgreich aktualisiert',
                'updated' => $updated,
            ]);
        }
    }

    /**
     * DELETE - Verarbeitet das Löschen von Datensätzen
     * Erwartet die ID des zu löschenden Datensatzes in den Query-Parametern
     */
    private function handleDelete(): void
    {
        // Validiert und liest die ID aus den Query-Parametern (muss positiv ganze Zahl sein)
        $id = Validation::queryPositiveInt($this->primaryKey);

        // Bereitet die SQL-DELETE-Abfrage für sichere Parameterersetzung vor
        $stmt = $this->pdo->prepare(
            "DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?"
        );
        
        // Führt die Abfrage mit der ID aus
        $stmt->execute([$id]);

        // Prüft, ob mindestens eine Zeile gelöscht wurde
        Validation::ensureAffectedRows($stmt->rowCount());

        // Gibt eine Erfolgsmeldung zurück
        Validation::json(['message' => 'Ressource erfolgreich gelöscht']);
    }
}
