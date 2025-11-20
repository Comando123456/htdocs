<?php
declare(strict_types=1);

require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/CrudController.php';

$pdo = Database::getConnection();

$controller = new CrudController(
    $pdo,
    'tbl_dozenten',
    'id_dozent',
    [
        'vorname', 'nachname', 'strasse', 'plz', 'ort',
        'nr_land', 'geschlecht', 'telefon', 'handy',
        'email', 'birthdate'
    ],
    ['vorname', 'nachname']   // Pflichtfelder bei POST
);

$controller->handle();