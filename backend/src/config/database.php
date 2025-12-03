<?php
// src/config/database.php

function db(): mysqli {
    static $mysqli;

    if ($mysqli instanceof mysqli) {
        return $mysqli;
    }

    $host = getenv('DB_HOST') ?: 'db';
    $port = (int)(getenv('DB_PORT') ?: 3306);
    $user = getenv('DB_USER') ?: 'sitev';
    $pass = getenv('DB_PASS') ?: '';
    $name = getenv('DB_NAME') ?: 'sitev_db';

    $mysqli = @new mysqli($host, $user, $pass, $name, $port);
    if ($mysqli->connect_errno) {
        throw new RuntimeException("MySQL connect error ({$mysqli->connect_errno}): {$mysqli->connect_error}");
    }

    $mysqli->set_charset('utf8mb4');
    return $mysqli;
}
