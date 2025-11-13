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

// ===== Hilfsfunktionen für Responses =====

/**
 * Sendet eine JSON-Antwort mit HTTP-Statuscode.
 */
function sendJson(mixed $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Einheitliches Fehler-Response-Format.
 */
function sendError(string $message, int $statusCode = 400, ?array $details = null): void
{
    $payload = ['error' => $message];
    if ($details !== null) {
        $payload['details'] = $details;
    }
    sendJson($payload, $statusCode);
}

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
    // DB-Fehler, hier besser keine internen Details rausgeben
    sendError('Datenbankverbindung fehlgeschlagen', 500);
}

// ===== Request-Methode & Body auslesen =====

$method = $_SERVER['REQUEST_METHOD'];

// JSON-Body einlesen (nur bei Methoden mit Body sinnvoll)
$rawBody = file_get_contents('php://input');
$input   = null;

if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
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
        // GET: Lernenden lesen
        // ===========================
        case 'GET':
            // Erwartet ?id_lernende=1
            if (!isset($_GET['id_lernende'])) {
                sendError('Parameter "id_lernende" ist erforderlich', 400);
            }

            $id = (int) $_GET['id_lernende'];
            if ($id <= 0) {
                sendError('Parameter "id_lernende" muss eine positive Zahl sein', 400);
            }

            $stmt = $pdo->prepare('SELECT * FROM tbl_lernende WHERE id_lernende = ?');
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                sendError('Lernende/r nicht gefunden', 404);
            }

            sendJson($row);
            break;

        // ===========================
        // POST: Lernenden erstellen
        // ===========================
        case 'POST':
            if (!is_array($input)) {
                sendError('Request-Body erwartet JSON-Objekt', 400);
            }

            // Pflichtfelder prüfen
            $required = ['nachname', 'vorname', 'email'];
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
                INSERT INTO tbl_lernende (
                    nachname, vorname, email, strasse, plz, ort,
                    nr_land, geschlecht, telefon, handy, email_privat, birthdate
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ';

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $input['nachname'],
                $input['vorname'],
                $input['email'],
                $input['strasse']       ?? null,
                $input['plz']           ?? null,
                $input['ort']           ?? null,
                $input['nr_land']       ?? null,
                $input['geschlecht']    ?? null,
                $input['telefon']       ?? null,
                $input['handy']         ?? null,
                $input['email_privat']  ?? null,
                $input['birthdate']     ?? null,
            ]);

            $newId = (int) $pdo->lastInsertId();

            sendJson([
                'id_lernende' => $newId,
                'message'     => 'Lernende/r erfolgreich erstellt',
            ], 201);
            break;

        // ===========================
        // PUT: Lernenden aktualisieren
        // ===========================
        case 'PUT':
            if (!is_array($input)) {
                sendError('Request-Body erwartet JSON-Objekt', 400);
            }

            if (empty($input['id_lernende'])) {
                sendError('Feld "id_lernende" ist erforderlich', 400);
            }

            $id = (int) $input['id_lernende'];
            if ($id <= 0) {
                sendError('"id_lernende" muss eine positive Zahl sein', 400);
            }

            $fields = [];
            $params = [];

            // Liste erlaubter Spalten, damit nicht beliebige Spalten gesetzt werden können
            $allowedColumns = [
                'nachname', 'vorname', 'email', 'strasse', 'plz', 'ort',
                'nr_land', 'geschlecht', 'telefon', 'handy',
                'email_privat', 'birthdate',
            ];

            foreach ($input as $key => $value) {
                if ($key === 'id_lernende') {
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

            $sql     = 'UPDATE tbl_lernende SET ' . implode(', ', $fields) . ' WHERE id_lernende = ?';
            $params[] = $id;

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            if ($stmt->rowCount() === 0) {
                // Kann bedeuten: ID existiert nicht oder Werte waren identisch
                // Wir prüfen hier nach, ob die ID existiert
                $check = $pdo->prepare('SELECT 1 FROM tbl_lernende WHERE id_lernende = ?');
                $check->execute([$id]);

                if (!$check->fetchColumn()) {
                    sendError('Lernende/r nicht gefunden', 404);
                }

                // ID existiert, aber nichts geändert
                sendJson([
                    'message' => 'Keine Änderungen vorgenommen (Daten identisch)',
                ]);
            }

            // Aktualisierten Datensatz zurückgeben
            $stmt = $pdo->prepare('SELECT * FROM tbl_lernende WHERE id_lernende = ?');
            $stmt->execute([$id]);
            $updated = $stmt->fetch(PDO::FETCH_ASSOC);

            sendJson([
                'message'         => 'Lernende/r erfolgreich aktualisiert',
                'updated_student' => $updated,
            ]);
            break;

        // ===========================
        // DELETE: Lernenden löschen
        // ===========================
        case 'DELETE':
            // Hier konsistent ebenfalls id_lernende verwenden
            if (!isset($_GET['id_lernende'])) {
                sendError('Parameter "id_lernende" ist erforderlich', 400);
            }

            $id = (int) $_GET['id_lernende'];
            if ($id <= 0) {
                sendError('"id_lernende" muss eine positive Zahl sein', 400);
            }

            $stmt = $pdo->prepare('DELETE FROM tbl_lernende WHERE id_lernende = ?');
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                sendError('Lernende/r nicht gefunden', 404);
            }

            sendJson(['message' => 'Lernende/r erfolgreich gelöscht']);
            break;

        // ===========================
        // Nicht erlaubte Methoden
        // ===========================
        default:
            sendError('HTTP-Methode nicht erlaubt', 405);
    }
} catch (PDOException $e) {
    // DB-Fehler, Option: Logging intern, User nur generische Meldung
    sendError('Datenbankfehler', 500);
} catch (Throwable $e) {
    // Fallback für alle anderen Fehler
    sendError('Interner Serverfehler', 500);
}
