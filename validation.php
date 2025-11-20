<?php
declare(strict_types=1);

final class Validation
{
    // ======================
    // Antworten / Fehler
    // ======================

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

        if ($encoded === false) {
            http_response_code(500);
            echo '{"error":"JSON-Encoding-Fehler"}';
            exit;
        }

        echo $encoded;
        exit;
    }

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

    public static function jsonBody(): array
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if (!in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
            return [];
        }

        if (isset($_SERVER['CONTENT_LENGTH']) && (int) $_SERVER['CONTENT_LENGTH'] > 1048576) {
            self::error('Request body zu groß', 413);
        }

        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($contentType, 'application/json') === false) {
            self::error('Content-Type muss application/json sein', 415);
        }

        $raw = file_get_contents('php://input');
        if ($raw === '' || $raw === false) {
            return [];
        }

        $data = json_decode($raw, true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
            self::error('Ungültiges JSON im Request-Body', 400, [
                'json_error' => json_last_error_msg(),
            ]);
        }

        return $data;
    }

    public static function queryPositiveInt(string $name): int
    {
        if (!isset($_GET[$name])) {
            self::error("Parameter \"{$name}\" ist erforderlich", 400);
        }

        $value = (int) $_GET[$name];
        if ($value <= 0) {
            self::error("\"{$name}\" muss eine positive Zahl sein", 400);
        }

        return $value;
    }

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

    public static function requireFields(array $data, array $required): void
    {
        $missing = [];

        foreach ($required as $field) {
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

    public static function ensureFound(mixed $row, string $label = 'Ressource'): void
    {
        if (!$row) {
            self::error($label . ' nicht gefunden', 404);
        }
    }

    public static function ensureNonEmptyArray(array $arr, string $message): void
    {
        if (empty($arr)) {
            self::error($message, 400);
        }
    }

    public static function ensureAffectedRows(int $count, string $label = 'Ressource'): void
    {
        if ($count === 0) {
            self::error($label . ' nicht gefunden', 404);
        }
    }
}
