<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

require_once __DIR__ . '/../conexion.php';

function responder(array $contenido, int $estado = 200): never
{
    http_response_code($estado);
    echo json_encode($contenido, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function leerDatos(): array
{
    $cuerpo = file_get_contents('php://input');

    if ($cuerpo === false || trim($cuerpo) === '') {
        return $_POST;
    }

    $datos = json_decode($cuerpo, true);

    if (!is_array($datos)) {
        responder([
            'ok' => false,
            'mensaje' => 'El cuerpo de la petición debe ser un JSON válido.',
        ], 400);
    }

    return $datos;
}

function validarEstudiante(array $datos): array
{
    $nombre = trim((string) ($datos['nombre'] ?? ''));
    $apellido = trim((string) ($datos['apellido'] ?? ''));
    $email = trim((string) ($datos['email'] ?? ''));
    $errores = [];

    if ($nombre === '') {
        $errores['nombre'] = 'El nombre es obligatorio.';
    } elseif (mb_strlen($nombre) > 100) {
        $errores['nombre'] = 'El nombre no puede superar los 100 caracteres.';
    }

    if ($apellido === '') {
        $errores['apellido'] = 'El apellido es obligatorio.';
    } elseif (mb_strlen($apellido) > 100) {
        $errores['apellido'] = 'El apellido no puede superar los 100 caracteres.';
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errores['email'] = 'Ingresá un email válido.';
    } elseif (mb_strlen($email) > 150) {
        $errores['email'] = 'El email no puede superar los 150 caracteres.';
    }

    if ($errores !== []) {
        responder([
            'ok' => false,
            'mensaje' => 'Revisá los datos enviados.',
            'errores' => $errores,
        ], 422);
    }

    return compact('nombre', 'apellido', 'email');
}

function validarId(mixed $valor): int
{
    $id = filter_var($valor, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1],
    ]);

    if ($id === false) {
        responder([
            'ok' => false,
            'mensaje' => 'El identificador del estudiante no es válido.',
        ], 400);
    }

    return $id;
}

function buscarPorId(mysqli $conn, int $id): ?array
{
    $stmt = $conn->prepare(
        'SELECT id, nombre, apellido, email
         FROM estudiantes
         WHERE id = ? AND activo = 1'
    );
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $estudiante = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return $estudiante ?: null;
}

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$conn = null;

try {
    $conn = getConnection();

    if ($metodo === 'GET') {
        $termino = trim((string) ($_GET['q'] ?? ''));

        if ($termino === '') {
            $resultado = $conn->query(
                'SELECT id, nombre, apellido, email
                 FROM estudiantes
                 WHERE activo = 1
                 ORDER BY apellido, nombre'
            );
        } else {
            $patron = '%' . $termino . '%';
            $stmt = $conn->prepare(
                "SELECT id, nombre, apellido, email
                 FROM estudiantes
                 WHERE activo = 1
                   AND (nombre LIKE ?
                        OR apellido LIKE ?
                        OR email LIKE ?
                        OR CONCAT(nombre, ' ', apellido) LIKE ?)
                 ORDER BY apellido, nombre"
            );
            $stmt->bind_param('ssss', $patron, $patron, $patron, $patron);
            $stmt->execute();
            $resultado = $stmt->get_result();
        }

        $estudiantes = $resultado->fetch_all(MYSQLI_ASSOC);

        if (isset($stmt)) {
            $stmt->close();
        }

        $conn->close();
        responder([
            'ok' => true,
            'data' => $estudiantes,
            'total' => count($estudiantes),
        ]);
    }

    if ($metodo === 'POST') {
        $datos = validarEstudiante(leerDatos());
        $stmt = $conn->prepare(
            'INSERT INTO estudiantes (nombre, apellido, email, activo)
             VALUES (?, ?, ?, 1)'
        );
        $stmt->bind_param('sss', $datos['nombre'], $datos['apellido'], $datos['email']);
        $stmt->execute();
        $id = $stmt->insert_id;
        $stmt->close();
        $estudiante = buscarPorId($conn, $id);
        $conn->close();

        responder([
            'ok' => true,
            'mensaje' => 'Estudiante agregado correctamente.',
            'data' => $estudiante,
        ], 201);
    }

    if ($metodo === 'PUT') {
        $entrada = leerDatos();
        $id = validarId($entrada['id'] ?? null);
        $datos = validarEstudiante($entrada);

        if (buscarPorId($conn, $id) === null) {
            $conn->close();
            responder([
                'ok' => false,
                'mensaje' => 'No se encontró el estudiante.',
            ], 404);
        }

        $stmt = $conn->prepare(
            'UPDATE estudiantes
             SET nombre = ?, apellido = ?, email = ?
             WHERE id = ? AND activo = 1'
        );
        $stmt->bind_param(
            'sssi',
            $datos['nombre'],
            $datos['apellido'],
            $datos['email'],
            $id
        );
        $stmt->execute();
        $stmt->close();
        $estudiante = buscarPorId($conn, $id);
        $conn->close();

        responder([
            'ok' => true,
            'mensaje' => 'Estudiante actualizado correctamente.',
            'data' => $estudiante,
        ]);
    }

    if ($metodo === 'DELETE') {
        $entrada = leerDatos();
        $id = validarId($_GET['id'] ?? $entrada['id'] ?? null);
        $stmt = $conn->prepare(
            'UPDATE estudiantes SET activo = 0 WHERE id = ? AND activo = 1'
        );
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $eliminado = $stmt->affected_rows > 0;
        $stmt->close();
        $conn->close();

        if (!$eliminado) {
            responder([
                'ok' => false,
                'mensaje' => 'No se encontró el estudiante o ya estaba eliminado.',
            ], 404);
        }

        responder([
            'ok' => true,
            'mensaje' => 'Estudiante eliminado correctamente.',
            'data' => ['id' => $id],
        ]);
    }

    $conn->close();
    header('Allow: GET, POST, PUT, DELETE');
    responder([
        'ok' => false,
        'mensaje' => 'Método HTTP no permitido.',
    ], 405);
} catch (mysqli_sql_exception $error) {
    if ($conn instanceof mysqli) {
        $conn->close();
    }

    $estado = $error->getCode() === 1062 ? 409 : 500;
    $mensaje = $estado === 409
        ? 'Ya existe un estudiante con ese email.'
        : 'No se pudo completar la operación en la base de datos.';

    responder([
        'ok' => false,
        'mensaje' => $mensaje,
    ], $estado);
} catch (Throwable $error) {
    if ($conn instanceof mysqli) {
        $conn->close();
    }

    responder([
        'ok' => false,
        'mensaje' => 'Ocurrió un error inesperado en el servidor.',
    ], 500);
}
