(function () {
    'use strict';

    var ns = window;

    var editoriales = [
        { id: 1, nombre: 'Sudamericana' },
        { id: 2, nombre: 'Sur' }
    ];

    var generos = [
        { id: 1, nombre: 'Realismo Mágico' },
        { id: 2, nombre: 'Ensayo' }
    ];

    var autores = [
        { id: 1, nombre: 'Gabriel García Márquez' },
        { id: 2, nombre: 'Jorge Luis Borges' },
        { id: 3, nombre: 'Julio Cortázar' }
    ];

    var librosSeed = [
        { id: 1, titulo: 'Cien años de soledad', isbn: '9789500428132', precio: 12500, editorialId: 1, generoId: 1, autoresIds: [1] },
        { id: 2, titulo: 'El Aleph', isbn: '9789500428149', precio: 9800, editorialId: 2, generoId: 2, autoresIds: [2] },
        { id: 3, titulo: 'Rayuela', isbn: '9789500428156', precio: 11200, editorialId: 1, generoId: null, autoresIds: [3] },
        { id: 4, titulo: 'Ficciones', isbn: '9789500428163', precio: 10800, editorialId: 2, generoId: 2, autoresIds: [2] },
        { id: 5, titulo: 'Final del juego', isbn: '9789500428170', precio: 9500, editorialId: 1, generoId: 1, autoresIds: [3] },
        { id: 6, titulo: 'Crónica de una muerte anunciada', isbn: '9789500428187', precio: 11500, editorialId: 2, generoId: 1, autoresIds: [1] },
        { id: 7, titulo: 'El libro de arena', isbn: '9789500428194', precio: 10200, editorialId: 1, generoId: 2, autoresIds: [2] }
    ];

    var clientesSeed = [
        { id: 1, nombreCompleto: 'Juan Pérez', email: 'juan.perez@mail.com' },
        { id: 2, nombreCompleto: 'María Gómez', email: 'maria.gomez@mail.com' },
        { id: 3, nombreCompleto: 'Carlos Ruiz', email: 'carlos.ruiz@mail.com' }
    ];

    var libros = librosSeed;
    var clientes = clientesSeed;
    var ventas = [];

    if (window.storage && typeof window.storage.loadFromStorage === 'function') {
        var librosGuardados = window.storage.loadFromStorage(window.storage.CLAVE_LIBROS);
        if (librosGuardados !== null) {
            libros = librosGuardados;
        }
        var clientesGuardados = window.storage.loadFromStorage(window.storage.CLAVE_CLIENTES);
        if (clientesGuardados !== null) {
            clientes = clientesGuardados;
        }
        var ventasGuardadas = window.storage.loadFromStorage(window.storage.CLAVE_VENTAS);
        if (Array.isArray(ventasGuardadas)) {
            ventas = ventasGuardadas;
        }
    }

    ns.libreria = ns.libreria || {};
    ns.libreria.editoriales = editoriales;
    ns.libreria.generos = generos;
    ns.libreria.autores = autores;
    ns.libreria.libros = libros;
    ns.libreria.clientes = clientes;
    ns.libreria.ventas = ventas;
})();
