'use strict';

const API_URL = 'api/estudiantes.php';
const tabla = document.querySelector('#tabla-estudiantes');
const total = document.querySelector('#total-estudiantes');
const buscador = document.querySelector('#buscador');
const indicadorCarga = document.querySelector('#indicador-carga');
const botonRecargar = document.querySelector('#boton-recargar');
const feedback = document.querySelector('#feedback');
const formCrear = document.querySelector('#form-crear');
const botonCrear = document.querySelector('#boton-crear');
const modalEditar = document.querySelector('#modal-editar');
const formEditar = document.querySelector('#form-editar');
const botonEditar = document.querySelector('#boton-editar');
const cerrarModal = document.querySelector('#cerrar-modal');

let estudiantes = [];
let temporizadorBusqueda;
let controladorPeticion;
let temporizadorFeedback;

function datosFormulario(formulario) {
    return Object.fromEntries(new FormData(formulario).entries());
}

async function pedirJson(url, opciones = {}) {
    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            Accept: 'application/json',
            ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
            ...opciones.headers,
        },
    });

    const texto = await respuesta.text();
    let resultado;

    try {
        resultado = texto ? JSON.parse(texto) : {};
    } catch {
        throw new Error('El servidor devolvió una respuesta que no es JSON.');
    }

    if (!respuesta.ok || resultado.ok === false) {
        throw new Error(resultado.mensaje || `Error HTTP ${respuesta.status}.`);
    }

    return resultado;
}

function mostrarFeedback(mensaje, tipo = 'success') {
    const clases = {
        success: 'alert alert-success alert-soft mb-6',
        error: 'alert alert-error alert-soft mb-6',
        info: 'alert alert-info alert-soft mb-6',
    };

    window.clearTimeout(temporizadorFeedback);
    feedback.className = clases[tipo] || clases.info;
    feedback.textContent = mensaje;
    feedback.hidden = false;

    temporizadorFeedback = window.setTimeout(() => {
        feedback.hidden = true;
    }, 5000);
}

function crearCelda(texto) {
    const celda = document.createElement('td');
    celda.textContent = texto;
    return celda;
}

function crearFila(estudiante) {
    const fila = document.createElement('tr');
    fila.dataset.id = String(estudiante.id);

    const nombre = crearCelda(`${estudiante.nombre} ${estudiante.apellido}`);
    nombre.dataset.campo = 'nombre-completo';

    const email = crearCelda(estudiante.email);
    email.dataset.campo = 'email';

    const acciones = document.createElement('td');
    acciones.className = 'text-right whitespace-nowrap';

    const editar = document.createElement('button');
    editar.type = 'button';
    editar.className = 'btn btn-sm btn-outline';
    editar.dataset.accion = 'editar';
    editar.textContent = 'Editar';

    const eliminar = document.createElement('button');
    eliminar.type = 'button';
    eliminar.className = 'btn btn-sm btn-outline btn-error ml-2';
    eliminar.dataset.accion = 'eliminar';
    eliminar.textContent = 'Eliminar';

    acciones.append(editar, eliminar);
    fila.append(nombre, email, acciones);

    return fila;
}

function actualizarTotal() {
    const cantidad = tabla.querySelectorAll('tr[data-id]').length;
    total.textContent = `${cantidad} ${cantidad === 1 ? 'estudiante' : 'estudiantes'}`;
}

function renderizarEstudiantes() {
    tabla.replaceChildren();

    if (estudiantes.length === 0) {
        const fila = document.createElement('tr');
        const celda = document.createElement('td');
        celda.colSpan = 3;
        celda.className = 'py-8 text-center text-base-content/60';
        celda.textContent = 'No se encontraron estudiantes.';
        fila.append(celda);
        tabla.append(fila);
    } else {
        const fragmento = document.createDocumentFragment();
        estudiantes.forEach((estudiante) => fragmento.append(crearFila(estudiante)));
        tabla.append(fragmento);
    }

    actualizarTotal();
}

function establecerCarga(cargando) {
    indicadorCarga.hidden = !cargando;
    botonRecargar.disabled = cargando;
}

async function cargarEstudiantes(termino = buscador.value.trim()) {
    controladorPeticion?.abort();
    controladorPeticion = new AbortController();
    const controladorActual = controladorPeticion;
    establecerCarga(true);

    try {
        const url = `${API_URL}?q=${encodeURIComponent(termino)}`;
        const resultado = await pedirJson(url, { signal: controladorActual.signal });
        estudiantes = resultado.data;
        renderizarEstudiantes();
    } catch (error) {
        if (error.name !== 'AbortError') {
            mostrarFeedback(error.message, 'error');
        }
    } finally {
        if (!controladorActual.signal.aborted) {
            establecerCarga(false);
        }
    }
}

async function crearEstudiante(evento) {
    evento.preventDefault();

    if (!formCrear.reportValidity()) {
        return;
    }

    botonCrear.disabled = true;

    try {
        const resultado = await pedirJson(API_URL, {
            method: 'POST',
            body: JSON.stringify(datosFormulario(formCrear)),
        });
        formCrear.reset();
        mostrarFeedback(resultado.mensaje);
        await cargarEstudiantes();
    } catch (error) {
        mostrarFeedback(error.message, 'error');
    } finally {
        botonCrear.disabled = false;
    }
}

function abrirEdicion(id) {
    const estudiante = estudiantes.find((item) => Number(item.id) === id);

    if (!estudiante) {
        mostrarFeedback('No se encontraron los datos para editar.', 'error');
        return;
    }

    formEditar.elements.id.value = estudiante.id;
    formEditar.elements.nombre.value = estudiante.nombre;
    formEditar.elements.apellido.value = estudiante.apellido;
    formEditar.elements.email.value = estudiante.email;
    modalEditar.showModal();
}

function actualizarFila(estudiante) {
    const fila = tabla.querySelector(`tr[data-id="${estudiante.id}"]`);

    if (!fila) {
        return;
    }

    fila.querySelector('[data-campo="nombre-completo"]').textContent =
        `${estudiante.nombre} ${estudiante.apellido}`;
    fila.querySelector('[data-campo="email"]').textContent = estudiante.email;
}

async function guardarEdicion(evento) {
    evento.preventDefault();

    if (!formEditar.reportValidity()) {
        return;
    }

    botonEditar.disabled = true;

    try {
        const resultado = await pedirJson(API_URL, {
            method: 'PUT',
            body: JSON.stringify(datosFormulario(formEditar)),
        });
        const indice = estudiantes.findIndex(
            (item) => Number(item.id) === Number(resultado.data.id)
        );

        if (indice !== -1) {
            estudiantes[indice] = resultado.data;
        }

        actualizarFila(resultado.data);
        modalEditar.close();
        mostrarFeedback(resultado.mensaje);
    } catch (error) {
        mostrarFeedback(error.message, 'error');
    } finally {
        botonEditar.disabled = false;
    }
}

async function eliminarEstudiante(id, fila) {
    const estudiante = estudiantes.find((item) => Number(item.id) === id);
    const nombre = estudiante ? `${estudiante.nombre} ${estudiante.apellido}` : 'este estudiante';

    if (!window.confirm(`¿Querés eliminar a ${nombre}?`)) {
        return;
    }

    const botones = fila.querySelectorAll('button');
    botones.forEach((boton) => { boton.disabled = true; });

    try {
        const resultado = await pedirJson(`${API_URL}?id=${id}`, {
            method: 'DELETE',
        });
        estudiantes = estudiantes.filter((item) => Number(item.id) !== id);
        fila.remove();

        if (estudiantes.length === 0) {
            renderizarEstudiantes();
        } else {
            actualizarTotal();
        }

        mostrarFeedback(resultado.mensaje);
    } catch (error) {
        botones.forEach((boton) => { boton.disabled = false; });
        mostrarFeedback(error.message, 'error');
    }
}

tabla.addEventListener('click', (evento) => {
    const boton = evento.target.closest('button[data-accion]');

    if (!boton) {
        return;
    }

    const fila = boton.closest('tr[data-id]');
    const id = Number(fila.dataset.id);

    if (boton.dataset.accion === 'editar') {
        abrirEdicion(id);
    } else if (boton.dataset.accion === 'eliminar') {
        eliminarEstudiante(id, fila);
    }
});

buscador.addEventListener('input', () => {
    window.clearTimeout(temporizadorBusqueda);
    temporizadorBusqueda = window.setTimeout(() => cargarEstudiantes(), 300);
});

botonRecargar.addEventListener('click', () => cargarEstudiantes());
formCrear.addEventListener('submit', crearEstudiante);
formEditar.addEventListener('submit', guardarEdicion);
cerrarModal.addEventListener('click', () => modalEditar.close());

cargarEstudiantes();
