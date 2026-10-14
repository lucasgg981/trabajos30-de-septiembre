# Guía de ejecución en localhost

## Requisitos

- Apache con PHP 8.1 o superior.
- MySQL o MariaDB.
- Node.js y npm, únicamente para recompilar los estilos.
- Conexión a internet para el ejercicio 1, porque consulta JSONPlaceholder.

En XAMPP se utilizan los módulos **Apache** y **MySQL**. En Linux también se puede usar un entorno LAMP equivalente.

## 1. Ubicar el proyecto

El proyecto debe quedar dentro de la carpeta pública del servidor. En este entorno ya está ubicado en:

```text
/var/www/html/trabajos30-de-septiembre
```

En XAMPP para Windows normalmente sería:

```text
C:\xampp\htdocs\trabajos30-de-septiembre
```

## 2. Preparar la base de datos

Importar el archivo `database.sql` desde phpMyAdmin o desde una terminal:

```bash
mysql -u root -p < database.sql
```

El script crea la base `sistema_alumno` y la tabla `estudiantes` si todavía no existen.

## 3. Configurar la conexión

Revisar `conexion.php` y adaptar estos valores al servidor local:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'alumno');
define('DB_PASS', 'secreto');
define('DB_NAME', 'sistema_alumno');
```

Si se usa XAMPP con la configuración inicial, normalmente el usuario es `root` y la contraseña está vacía. Conviene crear un usuario propio para el proyecto.

## 4. Instalar y compilar estilos

Desde la carpeta del proyecto:

```bash
npm install
npm run build:css
```

Durante el desarrollo se puede recompilar automáticamente:

```bash
npm run watch:css
```

El CSS compilado ya está versionado, por lo que estos comandos no son indispensables para una primera ejecución si no se modifica la interfaz.

## 5. Abrir los ejercicios

- Ejercicio 1: `http://localhost/trabajos30-de-septiembre/ejercicio1/`
- Ejercicios 2 y 3: `http://localhost/trabajos30-de-septiembre/`
- API JSON: `http://localhost/trabajos30-de-septiembre/api/estudiantes.php`

No se deben abrir los HTML con doble clic mediante `file://`. Hay que acceder mediante `http://localhost`, porque la API necesita que PHP procese las peticiones.

## 6. Pruebas sugeridas

### Ejercicio 1

1. Abrir la página y observar el indicador `Cargando...`.
2. Confirmar que aparecen 10 usuarios.
3. Pulsar **Recargar** y comprobar que la consulta se repite.

### Ejercicios 2 y 3

1. Abrir el CRUD y confirmar que aparece el listado actual.
2. Escribir en el buscador y verificar que filtra sin recargar la página.
3. Crear un estudiante con nombre, apellido y email válido.
4. Editarlo desde el modal y guardar los cambios.
5. Eliminarlo y confirmar que la fila desaparece.
6. Revisar en las herramientas del navegador, pestaña **Red/Network**, las peticiones `GET`, `POST`, `PUT` y `DELETE`.

## Solución de problemas

- **La API devuelve error de base de datos:** revisar credenciales, iniciar MySQL e importar `database.sql`.
- **El navegador muestra 404:** verificar que la carpeta se llame `trabajos30-de-septiembre` y esté bajo la raíz pública de Apache.
- **El ejercicio 1 no carga:** comprobar la conexión a internet y que el navegador no esté bloqueando `jsonplaceholder.typicode.com`.
- **Los estilos no aparecen:** ejecutar `npm install` y `npm run build:css`, luego hacer una recarga forzada del navegador.
- **Se ve código PHP como texto:** PHP no está habilitado; abrir el proyecto desde un servidor Apache/PHP, no directamente desde el sistema de archivos.
