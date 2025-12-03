<?php
require __DIR__ . '/../src/config/database.php'; // ajusta la ruta a tu conexión

$mysqli = db();

// Trae todas las filas
$res = $mysqli->query("SELECT id_usuario, email, password FROM usuarios");
if (!$res) {
    die("Query failed: " . $mysqli->error . PHP_EOL);
}

$upd = $mysqli->prepare("UPDATE usuarios SET password = ? WHERE id_usuario = ?");
if (!$upd) {
    die("Prepare failed: " . $mysqli->error . PHP_EOL);
}

$convertidas = 0;
while ($row = $res->fetch_assoc()) {
    $id = (int)$row['id_usuario'];
    $pwd = $row['password'];

    // Si parece texto plano (no bcrypt) la convertimos
    if (strpos($pwd, '$2') !== 0 || strlen($pwd) < 55) {
        $hash = password_hash($pwd, PASSWORD_DEFAULT);
        $upd->bind_param("si", $hash, $id);
        if (!$upd->execute()) {
            echo "No se pudo actualizar id={$id}: {$upd->error}\n";
        } else {
            $convertidas++;
            echo "Actualizada id={$id} ({$row['email']})\n";
        }
    }
}
$upd->close();
$res->close();

echo "Listo. Passwords convertidas: {$convertidas}\n";
