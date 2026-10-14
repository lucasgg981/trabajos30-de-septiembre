<?php
declare(strict_types=1);

define('DB_HOST', 'localhost');
define('DB_USER', 'alumno');
define('DB_PASS', 'secreto');
define('DB_NAME', 'sistema_alumno');

function getConnection(): mysqli
{
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    $conn->set_charset('utf8mb4');

    return $conn;
}
