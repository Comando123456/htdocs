<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once "Database.php";

$db = (new Database())->getConnection();

$type = $_GET["type"] ?? null;

switch ($type) {

    case "kurse":
        $sql = "
            SELECT
                k.*,
                CONCAT(d.vorname, ' ', d.nachname) AS dozent_name
            FROM tbl_kurse k
            LEFT JOIN tbl_dozenten d ON d.id_dozent = k.nr_dozent
        ";
        break;

    case "kurse_lernende":
        $sql = "
            SELECT
                kl.*,
                k.kursthema,
                CONCAT(l.vorname, ' ', l.nachname) AS lernender_name
            FROM tbl_kurse_lernende kl
            JOIN tbl_kurse k ON k.id_kurs = kl.nr_kurs
            JOIN tbl_lernende l ON l.id_lernende = kl.nr_lernende
        ";
        break;

    case "lehrbetriebe_lernende":
        $sql = "
            SELECT
                ll.*,
                lb.firma,
                CONCAT(l.vorname, ' ', l.nachname) AS lernender_name
            FROM tbl_lehrbetriebe_lernende ll
            JOIN tbl_lehrbetriebe lb ON lb.id_lehrbetrieb = ll.nr_lehrbetrieb
            JOIN tbl_lernende l ON l.id_lernende = ll.nr_lernende
        ";
        break;

    default:
        http_response_code(400);
        echo json_encode(["error" => "Unknown join type"]);
        exit;
}

$stmt = $db->prepare($sql);
$stmt->execute();
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
