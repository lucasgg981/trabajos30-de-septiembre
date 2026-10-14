CREATE DATABASE IF NOT EXISTS sistema_alumno
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE sistema_alumno;

CREATE TABLE IF NOT EXISTS estudiantes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    UNIQUE KEY uq_estudiantes_email (email)
) ENGINE=InnoDB;
