(function () {
    'use strict';

    var CLAVE_LIBROS = 'libreria_libros';
    var CLAVE_CLIENTES = 'libreria_clientes';
    var CLAVE_VENTAS = 'libreria_ventas';

    var almacenamientoMemoria = {};

    function isStorageAvailable() {
        try {
            if (!window.localStorage) {
                return false;
            }
            var clavePrueba = '__libreria_storage_test__';
            window.localStorage.setItem(clavePrueba, '1');
            window.localStorage.removeItem(clavePrueba);
            return true;
        } catch (e) {
            return false;
        }
    }

    function guardarSerializado(clave, datos) {
        if (isStorageAvailable()) {
            window.localStorage.setItem(clave, JSON.stringify(datos));
        } else {
            almacenamientoMemoria[clave] = JSON.stringify(datos);
        }
    }

    function leerParseado(clave) {
        var valor;
        if (isStorageAvailable()) {
            valor = window.localStorage.getItem(clave);
        } else {
            valor = almacenamientoMemoria[clave] === undefined ? null : almacenamientoMemoria[clave];
        }
        if (valor === null) {
            return null;
        }
        try {
            var parseado = JSON.parse(valor);
            if (Array.isArray(parseado)) {
                return parseado;
            }
        } catch (e) {
            // datos corruptos: se ignora y se devuelve null
        }
        return null;
    }

    function saveToStorage(clave, datos) {
        guardarSerializado(clave, datos);
    }

    function loadFromStorage(clave) {
        return leerParseado(clave);
    }

    function seedIfEmpty(libros, clientes, ventas) {
        if (!isStorageAvailable()) {
            return false;
        }

        var existen = false;
        if (loadFromStorage(CLAVE_LIBROS) !== null) { existen = true; }
        if (loadFromStorage(CLAVE_CLIENTES) !== null) { existen = true; }
        if (loadFromStorage(CLAVE_VENTAS) !== null) { existen = true; }

        if (existen) {
            return false;
        }

        var li = window.libreria || {};
        guardarSerializado(CLAVE_LIBROS, libros !== undefined ? libros : (li.libros || []));
        guardarSerializado(CLAVE_CLIENTES, clientes !== undefined ? clientes : (li.clientes || []));
        guardarSerializado(CLAVE_VENTAS, ventas !== undefined ? ventas : (li.ventas || []));

        return true;
    }

    window.storage = window.storage || {};
    window.storage.CLAVE_LIBROS = CLAVE_LIBROS;
    window.storage.CLAVE_CLIENTES = CLAVE_CLIENTES;
    window.storage.CLAVE_VENTAS = CLAVE_VENTAS;
    window.storage.isStorageAvailable = isStorageAvailable;
    window.storage.saveToStorage = saveToStorage;
    window.storage.loadFromStorage = loadFromStorage;
    window.storage.seedIfEmpty = seedIfEmpty;
})();
