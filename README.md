# Unidad 5 — Fetch y CRUD de estudiantes

Trabajo práctico que reúne tres ejercicios de consumo de APIs con JavaScript. El ejercicio 1 es independiente; los ejercicios 2 y 3 extienden el sistema de estudiantes realizado en la Unidad 4.

## Ejercicios incluidos

### 1. Fetch básico

- Consume `https://jsonplaceholder.typicode.com/users` al cargar la página.
- Muestra nombre, email y ciudad en una tabla.
- Indica `Cargando...` mientras espera la respuesta.
- Permite repetir la consulta con el botón **Recargar**.
- Muestra un mensaje si la API no está disponible.

Acceso: `http://localhost/trabajos30-de-septiembre/ejercicio1/`

### 2. Integración JavaScript + PHP

- `api/estudiantes.php` devuelve respuestas JSON.
- `index.html` carga estudiantes con `fetch`, sin renderizado PHP.
- El buscador consulta en tiempo real con `GET api/estudiantes.php?q=termino`.
- El formulario crea estudiantes con `POST`, sin recargar la página.

### 3. CRUD completo con Fetch

- **Editar:** abre un modal, envía `PUT` y actualiza la fila.
- **Eliminar:** envía `DELETE`, realiza un borrado lógico y quita la fila del DOM.
- Informa el resultado de cada operación con mensajes de feedback.
- Valida datos tanto en el navegador como en la API.

Acceso: `http://localhost/trabajos30-de-septiembre/`

## Tecnologías

- PHP 8.1 o superior con MySQLi y consultas preparadas.
- MySQL/MariaDB.
- JavaScript moderno: Fetch API, `async`/`await` y manipulación del DOM.
- Tailwind CSS 4 y daisyUI 5.

## Estructura principal

```text
trabajos30-de-septiembre/
├── api/
│   └── estudiantes.php       # API JSON: GET, POST, PUT y DELETE
├── ejercicio1/
│   ├── index.html             # Interfaz del ejercicio 1
│   └── usuarios.js            # Fetch a JSONPlaceholder
├── js/
│   └── estudiantes.js         # CRUD y buscador con Fetch
├── css/estilos.css            # CSS compilado
├── src/input.css              # Entrada Tailwind + daisyUI
├── conexion.php               # Conexión MySQL reutilizada
├── database.sql               # Creación de base y tabla
├── index.html                 # Interfaz de ejercicios 2 y 3
└── GUIA_EJECUCION.md          # Instalación y pruebas paso a paso
```

## API

| Método | Ruta | Acción |
|---|---|---|
| `GET` | `api/estudiantes.php` | Lista estudiantes activos |
| `GET` | `api/estudiantes.php?q=ana` | Busca por nombre, apellido o email |
| `POST` | `api/estudiantes.php` | Crea un estudiante |
| `PUT` | `api/estudiantes.php` | Actualiza un estudiante |
| `DELETE` | `api/estudiantes.php?id=1` | Desactiva un estudiante |

Los cuerpos de `POST` y `PUT` se envían como JSON. Todas las respuestas usan este formato general:

```json
{
  "ok": true,
  "mensaje": "Operación realizada correctamente.",
  "data": {}
}
```

## Inicio rápido

1. Importar `database.sql` en MySQL.
2. Revisar las credenciales de `conexion.php`.
3. Ejecutar `npm install` y `npm run build:css`.
4. Abrir `http://localhost/trabajos30-de-septiembre/`.

La explicación completa está en [GUIA_EJECUCION.md](GUIA_EJECUCION.md).

## Unidad 4

Los archivos PHP originales (`primerpaso.php`, `formulario.php`, `editar.php`, etc.) se conservan para comparar el flujo tradicional con recarga contra el nuevo flujo basado en Fetch.
