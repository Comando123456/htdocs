<?php
declare(strict_types=1);

// ===== Logging & Error-Handling (global, zentral) =====

// Log-Datei (im gleichen Ordner 'logs' ablegen). In Produktion besser außerhalb des Webroots.
$logDir  = __DIR__ . DIRECTORY_SEPARATOR . 'logs';
$logFile = $logDir . DIRECTORY_SEPARATOR . 'api.log';

if (!is_dir($logDir)) {
    @mkdir($logDir, 0700, true);
}

/**
 * Sendet eine JSON-Antwort mit HTTP-Statuscode.
 */
function sendJson(mixed $data, int $statusCode = 200): void
{
    http_response_code($statusCode);

    $encoded = json_encode(
        $data,
        JSON_UNESCAPED_UNICODE
        | JSON_UNESCAPED_SLASHES
        | JSON_PARTIAL_OUTPUT_ON_ERROR
    );

    if ($encoded === false) {
        // Falls das JSON-Encoding fehlschlägt, loggen wir den Fehler intern und senden eine generische Fehlermeldung.
        $msg = 'JSON encode error: ' . json_last_error_msg();
        error_log($msg);
        http_response_code(500);
        echo json_encode(['error' => 'Interner Serverfehler']);
        exit;
    }

    echo $encoded;
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

/**
 * Protokolliert interne Fehler mit Zeitstempel in die Log-Datei.
 */
function logException(Throwable $e): void
{
    global $logFile;

    $msg = sprintf(
        "[%s] %s in %s:%d\nStack trace:\n%s\n---\n",
        date('c'),
        $e->getMessage(),
        $e->getFile(),
        $e->getLine(),
        $e->getTraceAsString()
    );

    error_log($msg, 3, $logFile);
}

// Fehler-Handler: wandelt PHP-Warnings/Notices in Exceptions um, damit sie zentral behandelt werden können.
set_error_handler(function (int $severity, string $message, string $file, int $line) {
    // Error Reporting respektieren
    if (!(error_reporting() & $severity)) {
        return;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// Uncaught Exceptions zentral behandeln: loggen und generische Fehlermeldung senden.
set_exception_handler(function (Throwable $e) {
    try {
        logException($e);
    } catch (Throwable $ignore) {
        // Logging darf keinen weiteren Fehler werfen
    }

    // Keine internen Details an den Client
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Interner Serverfehler']);
    exit;
});

// Shutdown-Handler für Fatals
register_shutdown_function(function () {
    $err = error_get_last();
    if ($err !== null && in_array($err['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE], true)) {
        global $logFile;
        $msg = sprintf(
            "[%s] Fatal error: %s in %s on line %d\n",
            date('c'),
            $err['message'],
            $err['file'],
            $err['line']
        );
        error_log($msg, 3, $logFile);
    }
});
