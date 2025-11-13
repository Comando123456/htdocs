<?php
declare(strict_types=1);

// ===== Allgemeine Header (JSON + CORS) =====
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Preflight-Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ===== Zentrales Error-Handling laden =====
require_once __DIR__ . '/error_handling.php';

// ===== Datenbank-Verbindung =====
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=kursverwaltung;charset=utf8mb4",
        "root",
        ""
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    try {
        logException($e);
    } catch (Throwable $ignore) {}

    sendError('Datenbankverbindung fehlgeschlagen', 500);
}

$method  = $_SERVER['REQUEST_METHOD'];
$rawBody = file_get_contents('php://input');
$input   = null;

// JSON einlesen
if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {

    if (isset($_SERVER['CONTENT_LENGTH']) && (int) $_SERVER['CONTENT_LENGTH'] > 1048576) {
        sendError('Request body zu groß', 413);
    }

    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'application/json') === false) {
        sendError('Content-Type muss application/json sein', 415);
    }

    if ($rawBody !== '') {
        $input = json_decode($rawBody, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            sendError('Ungültiges JSON im Request-Body', 400, [
                'json_error' => json_last_error_msg(),
            ]);
        }
    } else {
        $input = [];
    }
}

try {
    switch ($method) {

        // ===========================
        // GET: Country lesen
        // ===========================
        case 'GET':

            if (!isset($_GET['id_country'])) {
                sendError('Parameter "id_country" ist erforderlich', 400);
            }

            $id = (int) $_GET['id_country'];
            if ($id <= 0) {
                sendError('"id_country" muss eine positive Zahl sein', 400);
            }

            $stmt = $pdo->prepare('SELECT * FROM tbl_countries WHERE id_country = ?');
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                sendError('Country nicht gefunden', 404);
            }

            sendJson($row);
            break;

        // ===========================
        // POST: Country erstellen
        // ===========================
        case 'POST':

            if (!is_array($input)) {
                sendError('Request-Body erwartet JSON-Objekt', 400);
            }

            if (empty($input['country'])) {
                sendError('Pflichtfeld "country" fehlt', 400);
            }

            $stmt = $pdo->prepare('INSERT INTO tbl_countries (country) VALUES (?)');
            $stmt->execute([$input['country']]);

            $newId = (int) $pdo->lastInsertId();

            sendJson([
                'id_country' => $newId,
                'message'    => 'Country erfolgreich erstellt',
            ], 201);
            break;

        // ===========================
        // PUT: Country aktualisieren
        // ===========================
        case 'PUT':

            if (!is_array($input)) {
                sendError('Request-Body erwartet JSON-Objekt', 400);
            }

            if (empty($input['id_country'])) {
                sendError('Feld "id_country" ist erforderlich', 400);
            }

            $id = (int) $input['id_country'];
            if ($id <= 0) {
                sendError('"id_country" muss eine positive Zahl sein', 400);
            }

            // Erlaubte Felder
            $allowed = ['country'];

            $fields = [];
            $params = [];
            foreach ($input as $key => $value) {
                if ($key !== 'id_country' && in_array($key, $allowed, true)) {
                    $fields[] = "$key = ?";
                    $params[] = $value;
                }
            }

            if (empty($fields)) {
                sendError('Keine gültigen Felder zum Aktualisieren übergeben', 400);
            }

            $params[] = $id;

            $stmt = $pdo->prepare('UPDATE tbl_countries SET ' . implode(', ', $fields) . ' WHERE id_country = ?');
            $stmt->execute($params);

            if ($stmt->rowCount() === 0) {
                $check = $pdo->prepare('SELECT 1 FROM tbl_countries WHERE id_country = ?');
                $check->execute([$id]);

                if (!$check->fetchColumn()) {
                    sendError('Country nicht gefunden', 404);
                }

                sendJson(['message' => 'Keine Änderungen vorgenommen']);
            }

            // aktualisierten Datensatz zurückgeben
            $stmt = $pdo->prepare('SELECT * FROM tbl_countries WHERE id_country = ?');
            $stmt->execute([$id]);
            $updated = $stmt->fetch(PDO::FETCH_ASSOC);

            sendJson([
                'message' => 'Country erfolgreich aktualisiert',
                'updated' => $updated,
            ]);
            break;

        // ===========================
        // DELETE: Country löschen
        // ===========================
        case 'DELETE':

            if (!isset($_GET['id_country'])) {
                sendError('Parameter "id_country" ist erforderlich', 400);
            }

            $id = (int) $_GET['id_country'];
            if ($id <= 0) {
                sendError('"id_country" muss eine positive Zahl sein', 400);
            }

            $stmt = $pdo->prepare('DELETE FROM tbl_countries WHERE id_country = ?');
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                sendError('Country nicht gefunden', 404);
            }

            sendJson(['message' => 'Country erfolgreich gelöscht']);
            break;

        default:
            sendError('HTTP-Methode nicht erlaubt', 405);
    }

} catch (PDOException $e) {
    try { logException($e); } catch (Throwable $ignore) {}
    sendError('Datenbankfehler', 500);

} catch (Throwable $e) {
    try { logException($e); } catch (Throwable $ignore) {}
    sendError('Interner Serverfehler', 500);
}
