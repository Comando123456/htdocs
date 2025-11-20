<?php
declare(strict_types=1);

require_once __DIR__ . '/validation.php';

final class CrudController
{
    private PDO $pdo;
    private string $table;
    private string $primaryKey;
    private array $allowedColumns;
    private array $requiredColumns;

    public function __construct(
        PDO $pdo,
        string $table,
        string $primaryKey,
        array $allowedColumns,
        array $requiredColumns = []
    ) {
        $this->pdo             = $pdo;
        $this->table           = $table;
        $this->primaryKey      = $primaryKey;
        $this->allowedColumns  = $allowedColumns;
        $this->requiredColumns = $requiredColumns;
    }

    public function handle(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if ($method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        try {
            switch ($method) {
                case 'GET':
                    $this->handleGet();
                    break;
                case 'POST':
                    $this->handlePost();
                    break;
                case 'PUT':
                    $this->handlePut();
                    break;
                case 'DELETE':
                    $this->handleDelete();
                    break;
                default:
                    Validation::error('HTTP-Methode nicht erlaubt', 405);
            }
        } catch (Throwable $e) {
            // hier keine Details nach außen geben
            Validation::error('Interner Serverfehler', 500);
        }
    }

    // -------- GET --------
    private function handleGet(): void
    {
        if (isset($_GET['all'])) {
            $stmt = $this->pdo->query("SELECT * FROM {$this->table}");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Validation::json($rows);
        }

        $id = Validation::queryPositiveInt($this->primaryKey);

        $stmt = $this->pdo->prepare(
            "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?"
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        Validation::ensureFound($row);

        Validation::json($row);
    }

    // -------- POST --------
    private function handlePost(): void
    {
        $data = Validation::jsonBody();

        if (!empty($this->requiredColumns)) {
            Validation::requireFields($data, $this->requiredColumns);
        }

        $columns = [];
        $values  = [];

        foreach ($this->allowedColumns as $col) {
            if (array_key_exists($col, $data)) {
                $columns[] = $col;
                $values[]  = $data[$col];
            }
        }

        Validation::ensureNonEmptyArray(
            $columns,
            'Keine gültigen Felder zum Erstellen übergeben'
        );

        $placeholders = implode(', ', array_fill(0, count($columns), '?'));

        $sql = "INSERT INTO {$this->table} (" . implode(', ', $columns) . ")
                VALUES ({$placeholders})";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($values);

        $newId = (int) $this->pdo->lastInsertId();

        Validation::json([
            $this->primaryKey => $newId,
            'message'         => 'Ressource erfolgreich erstellt',
        ], 201);
    }

    // -------- PUT --------
    private function handlePut(): void
    {
        $data = Validation::jsonBody();

        $id = Validation::bodyPositiveInt($data, $this->primaryKey);

        $sets   = [];
        $params = [];

        foreach ($this->allowedColumns as $col) {
            if (array_key_exists($col, $data)) {
                $sets[]   = "$col = ?";
                $params[] = $data[$col];
            }
        }

        Validation::ensureNonEmptyArray(
            $sets,
            'Keine gültigen Felder zum Aktualisieren übergeben'
        );

        $params[] = $id;

        $sql  = "UPDATE {$this->table} SET " . implode(', ', $sets) . " WHERE {$this->primaryKey} = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() === 0) {
            $check = $this->pdo->prepare(
                "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?"
            );
            $check->execute([$id]);
            $row = $check->fetch(PDO::FETCH_ASSOC);

            Validation::ensureFound($row);

            Validation::json(['message' => 'Keine Änderungen vorgenommen (Daten identisch)']);
        } else {
            $get = $this->pdo->prepare(
                "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?"
            );
            $get->execute([$id]);
            $updated = $get->fetch(PDO::FETCH_ASSOC);

            Validation::json([
                'message' => 'Ressource erfolgreich aktualisiert',
                'updated' => $updated,
            ]);
        }
    }

    // -------- DELETE --------
    private function handleDelete(): void
    {
        $id = Validation::queryPositiveInt($this->primaryKey);

        $stmt = $this->pdo->prepare(
            "DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?"
        );
        $stmt->execute([$id]);

        Validation::ensureAffectedRows($stmt->rowCount());

        Validation::json(['message' => 'Ressource erfolgreich gelöscht']);
    }
}
