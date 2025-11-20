<?php
declare(strict_types=1);

require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/CrudController.php';

$pdo = Database::getConnection();

$controller = new CrudController(
    $pdo,
    'tbl_kurse_lernende',
    'id_kurse_lernende',
    ['nr_kurs', 'nr_lernende', 'note'],
    ['nr_kurs', 'nr_lernende']   // Pflichtfelder bei POST
);

$controller->handle();