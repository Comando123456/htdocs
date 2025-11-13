<?php
declare(strict_types=1);

// ===== Allgemeine Header (JSON + CORS) =====
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Preflight-Request von Browsern für CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit;
}

// ===== Zentrales Error-Handling laden =====
require_once __DIR__ . '/error_handling.php';

// ===== Datenbank-Verbindung =====

try {
    // TODO: Zugangsdaten NICHT im Code lassen
    $pdo = new PDO(
        "mysql:host=localhost;dbname=kursverwaltung;charset=utf8mb4",
        "root",
        ""
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // DB-Fehler: intern loggen, aber generische Meldung an den Client
    try {
        logException($e);
    } catch (Throwable $ignore) {
    }

    sendError('Datenbankverbindung fehlgeschlagen', 500);
}

// ===== Request-Methode & Body auslesen =====

$method = $_SERVER['REQUEST_METHOD'];

// JSON-Body einlesen (nur bei Methoden mit Body sinnvoll)
$rawBody = file_get_contents('php://input');
$input   = null;

if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
    // Body-Size Limit (z.B. 1MB)
    if (isset($_SERVER['CONTENT_LENGTH']) && (int) $_SERVER['CONTENT_LENGTH'] > 1048576) {
        sendError('Request body zu groß', 413);
    }

    // Content-Type Prüfung: akzeptiere nur JSON für diese Endpunkte
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'application/json') === false) {
        sendError('Content-Type muss application/json sein', 415);
    }

    if ($rawBody !== '') {
        $input = json_decode($rawBody, true);

        // Prüfen, ob gültiges JSON
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendError('Ungültiges JSON im Request-Body', 400, [
                'json_error' => json_last_error_msg(),
            ]);
        }
    } else {
        // Leerer Body bei POST/PUT -> je nach Use-Case Fehler
        $input = [];
    }
}

try {
    switch ($method) {
        // ===========================
        // GET: Lehrbetrieb lesen
        // ===========================
        case 'GET':
            // Erwartet ?id_lehrbetrieb=1
            if (!isset($_GET['id_lehrbetrieb'])) {
                sendError('Parameter "id_lehrbetrieb" ist erforderlich', 400);
            }

            $id = (int) $_GET['id_lehrbetrieb'];
            if ($id <= 0) {
                sendError('Parameter "id_lehrbetrieb" muss eine positive Zahl sein', 400);
            }

            $stmt = $pdo->prepare('SELECT * FROM tbl_lehrbetriebe WHERE id_lehrbetrieb = ?');
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                sendError('Lehrbetrieb nicht gefunden', 404);
            }

            sendJson($row);
            break;

        // ===========================
        // POST: Lehrbetrieb erstellen
        // ===========================
        case 'POST':
            if (!is_array($input)) {
                sendError('Request-Body erwartet JSON-Objekt', 400);
            }

            // Pflichtfelder prüfen
            $required = ['firma'];
            $missing  = [];

            foreach ($required as $field) {
                if (empty($input[$field])) {
                    $missing[] = $field;
                }
            }

            if (!empty($missing)) {
                sendError(
                    'Pflichtfelder fehlen',
                    400,
                    ['missing_fields' => $missing]
                );
            }

            $sql = '
                INSERT INTO tbl_lehrbetriebe (
                    firma, strasse, plz, ort
                ) VALUES (?, ?, ?, ?)
            ';

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $input['firma'],
                $input['strasse'] ?? null,
                $input['plz']     ?? null,
                $input['ort']     ?? null,
            ]);

            $newId = (int) $pdo->lastInsertId();

            sendJson([
                'id_lehrbetrieb' => $newId,
                'message'        => 'Lehrbetrieb erfolgreich erstellt',
            ], 201);
            break;

        // ===========================
        // PUT: Lehrbetrieb aktualisieren
        // ===========================
        case 'PUT':
            if (!is_array($input)) {
                sendError('Request-Body erwartet JSON-Objekt', 400);
            }

            if (empty($input['id_lehrbetrieb'])) {
                sendError('Feld "id_lehrbetrieb" ist erforderlich', 400);
            }

            $id = (int) $input['id_lehrbetrieb'];
            if ($id <= 0) {
                sendError('"id_lehrbetrieb" muss eine positive Zahl sein', 400);
            }

            $fields = [];
            $params = [];

            // Liste erlaubter Spalten
            $allowedColumns = [
                'firma', 'strasse', 'plz', 'ort',
            ];

            foreach ($input as $key => $value) {
                if ($key === 'id_lehrbetrieb') {
                    continue;
                }

                if (in_array($key, $allowedColumns, true)) {
                    $fields[] = "$key = ?";
                    $params[] = $value;
                }
            }

            if (empty($fields)) {
                sendError('Keine gültigen Felder zum Aktualisieren übergeben', 400);
            }

            $sql      = 'UPDATE tbl_lehrbetriebe SET ' . implode(', ', $fields) . ' WHERE id_lehrbetrieb = ?';
            $params[] = $id;

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            if ($stmt->rowCount() === 0) {
                // Kann bedeuten: ID existiert nicht oder Werte waren identisch
                $check = $pdo->prepare('SELECT 1 FROM tbl_lehrbetriebe WHERE id_lehrbetrieb = ?');
                $check->execute([$id]);

                if (!$check->fetchColumn()) {
                    sendError('Lehrbetrieb nicht gefunden', 404);
                }

                // ID existiert, aber nichts geändert
                sendJson([
                    'message' => 'Keine Änderungen vorgenommen (Daten identisch)',
                ]);
            }

            // Aktualisierten Datensatz zurückgeben
            $stmt = $pdo->prepare('SELECT * FROM tbl_lehrbetriebe WHERE id_lehrbetrieb = ?');
            $stmt->execute([$id]);
            $updated = $stmt->fetch(PDO::FETCH_ASSOC);

            sendJson([
                'message'        => 'Lehrbetrieb erfolgreich aktualisiert',
                'updated_record' => $updated,
            ]);
            break;

        // ===========================
        // DELETE: Lehrbetrieb löschen
        // ===========================
        case 'DELETE':
            if (!isset($_GET['id_lehrbetrieb'])) {
                sendError('Parameter "id_lehrbetrieb" ist erforderlich', 400);
            }

            $id = (int) $_GET['id_lehrbetrieb'];
            if ($id <= 0) {
                sendError('"id_lehrbetrieb" muss eine positive Zahl sein', 400);
            }

            $stmt = $pdo->prepare('DELETE FROM tbl_lehrbetriebe WHERE id_lehrbetrieb = ?');
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                sendError('Lehrbetrieb nicht gefunden', 404);
            }

            sendJson(['message' => 'Lehrbetrieb erfolgreich gelöscht']);
            break;

        // ===========================
        // Nicht erlaubte Methoden
        // ===========================
        default:
            sendError('HTTP-Methode nicht erlaubt', 405);
    }
} catch (PDOException $e) {
    // DB-Fehler: intern loggen, aber generische Fehlermeldung an den Client
    try {
        logException($e);
    } catch (Throwable $ignore) {
    }

    sendError('Datenbankfehler', 500);
} catch (Throwable $e) {
    // Fallback für alle anderen Fehler: intern loggen
    try {
        logException($e);
    } catch (Throwable $ignore) {
    }

    sendError('Interner Serverfehler', 500);
}