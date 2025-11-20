<?php
declare(strict_types=1);

require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/CrudController.php';

$pdo = Database::getConnection();

$controller = new CrudController(
    $pdo,
    'tbl_kurse',
    'id_kurs',
    [
        'kursnummer', 'kursthema', 'inhalt',
        'nr_dozent', 'startdatum', 'enddatum', 'dauer'
    ],
    ['kursnummer', 'kursthema']    // Pflichtfelder bei POST
);

$controller->handle();