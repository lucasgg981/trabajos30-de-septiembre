'use strict';

const URL_USUARIOS = 'https://jsonplaceholder.typicode.com/users';
const tabla = document.querySelector('#tabla-usuarios');
const indicadorCarga = document.querySelector('#indicador-carga');
const botonRecargar = document.querySelector('#boton-recargar');
const mensajeError = document.querySelector('#mensaje-error');

function crearCelda(texto) {
    const celda = document.createElement('td');
    celda.textContent = texto;
    return celda;
}

function mostrarUsuarios(usuarios) {
    const fragmento = document.createDocumentFragment();

    usuarios.forEach((usuario) => {
        const fila = document.createElement('tr');
        fila.append(
            crearCelda(usuario.name),
            crearCelda(usuario.email),
            crearCelda(usuario.address.city)
        );
        fragmento.append(fila);
    });

    tabla.replaceChildren(fragmento);
}

async function cargarUsuarios() {
    indicadorCarga.hidden = false;
    botonRecargar.disabled = true;
    mensajeError.hidden = true;

    try {
        const respuesta = await fetch(URL_USUARIOS);

        if (!respuesta.ok) {
            throw new Error(`La API respondió con el estado ${respuesta.status}.`);
        }

        const usuarios = await respuesta.json();
        mostrarUsuarios(usuarios);
    } catch (error) {
        tabla.replaceChildren();
        mensajeError.textContent = `No se pudieron cargar los usuarios: ${error.message}`;
        mensajeError.hidden = false;
    } finally {
        indicadorCarga.hidden = true;
        botonRecargar.disabled = false;
    }
}

botonRecargar.addEventListener('click', cargarUsuarios);
cargarUsuarios();
