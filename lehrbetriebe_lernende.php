<?php
declare(strict_types=1);

require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/CrudController.php';

$pdo = Database::getConnection();

$controller = new CrudController(
    $pdo,
    'tbl_lehrbetriebe_lernende',
    'id_lehrbetriebe_lernende',
    ['nr_lehrbetrieb', 'nr_lernende', 'start', 'ende', 'beruf'],
    ['nr_lehrbetrieb', 'nr_lernende']   // Pflichtfelder bei POST
);

$controller->handle();
