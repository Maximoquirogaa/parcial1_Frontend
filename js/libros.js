(function () {
    'use strict';

    var document = window.document;

    function normalizarTexto(valor) {
        return String(valor === null || valor === undefined ? '' : valor).trim();
    }

    function normalizarIsbn(valor) {
        return normalizarTexto(valor).replace(/[\s-]/g, '').toUpperCase();
    }

    function siguienteId(coleccion) {
        var maximo = 0;
        (coleccion || []).forEach(function (item) {
            if (Number.isInteger(item.id) && item.id > maximo) {
                maximo = item.id;
            }
        });
        return maximo + 1;
    }

    function parsearPrecio(valor) {
        var texto = normalizarTexto(valor);
        if (texto === '') {
            return NaN;
        }
        return Number(texto);
    }

    function parsearId(valor) {
        var texto = normalizarTexto(valor);
        if (texto === '') {
            return null;
        }
        var numero = Number(texto);
        return Number.isInteger(numero) ? numero : NaN;
    }

    function existeId(coleccion, id) {
        return (coleccion || []).some(function (item) { return item.id === id; });
    }

    function coleccionDe(coleccion) {
        return coleccion || window.libreria || {};
    }

    function validarLibro(datos, coleccion) {
        var li = coleccionDe(coleccion);
        var libros = li.libros || [];
        var errores = [];

        var titulo = normalizarTexto(datos.titulo);
        var isbn = normalizarTexto(datos.isbn);
        var isbnNormalizado = normalizarIsbn(datos.isbn);

        if (titulo === '') {
            errores.push({ campo: 'titulo', mensaje: 'El título es obligatorio.' });
        }

        if (isbn === '' || isbnNormalizado === '') {
            errores.push({ campo: 'isbn', mensaje: 'El ISBN es obligatorio.' });
        } else {
            var duplicado = libros.some(function (libro) {
                return normalizarIsbn(libro.isbn) === isbnNormalizado;
            });
            if (duplicado) {
                errores.push({ campo: 'isbn', mensaje: 'El ISBN ya está registrado (duplicado).' });
            }
        }

        var precio = parsearPrecio(datos.precio);
        if (!Number.isFinite(precio)) {
            errores.push({ campo: 'precio', mensaje: 'El precio debe ser un número válido.' });
        } else if (precio <= 0) {
            errores.push({ campo: 'precio', mensaje: 'El precio debe ser mayor que cero.' });
        }

        var editorialId = parsearId(datos.editorialId);
        if (editorialId === null) {
            errores.push({ campo: 'editorial', mensaje: 'La editorial es obligatoria.' });
        } else if (!Number.isInteger(editorialId) || !existeId(li.editoriales, editorialId)) {
            errores.push({ campo: 'editorial', mensaje: 'La editorial seleccionada no es válida.' });
        }

        var autoresIds = (datos.autoresIds || []).map(parsearId);
        if (autoresIds.length === 0) {
            errores.push({ campo: 'autores', mensaje: 'Debe seleccionar al menos un autor.' });
        } else if (autoresIds.some(function (id) {
            return !Number.isInteger(id) || !existeId(li.autores, id);
        })) {
            errores.push({ campo: 'autores', mensaje: 'Uno o más autores seleccionados no son válidos.' });
        }

        var generoId = parsearId(datos.generoId);
        if (generoId !== null && (!Number.isInteger(generoId) || !existeId(li.generos, generoId))) {
            errores.push({ campo: 'genero', mensaje: 'El género seleccionado no es válido.' });
        }

        return { valido: errores.length === 0, errores: errores };
    }

    function limpiarNodo(nodo) {
        while (nodo.firstChild) {
            nodo.removeChild(nodo.firstChild);
        }
    }

    function crearOpcion(select, valor, texto, seleccionada) {
        var opcion = document.createElement('option');
        opcion.value = String(valor);
        opcion.textContent = texto;
        opcion.selected = Boolean(seleccionada);
        select.appendChild(opcion);
        return opcion;
    }

    function asegurarSeleccion(select) {
        var opciones = select.options;
        if (opciones.length === 0) {
            return;
        }
        for (var i = 0; i < opciones.length; i++) {
            if (opciones[i].selected) {
                return;
            }
        }
        opciones[0].selected = true;
    }

    function leerValoresSeleccionados(select) {
        var salida = [];
        var opciones = select.options;
        for (var i = 0; i < opciones.length; i++) {
            if (opciones[i].selected) {
                salida.push(String(opciones[i].value));
            }
        }
        return salida;
    }

    function poblarSelectores(coleccion) {
        var li = coleccionDe(coleccion);
        var selectEditorial = document.getElementById('libro-editorial');
        var selectGenero = document.getElementById('libro-genero');
        var selectAutores = document.getElementById('libro-autores');
        if (!selectEditorial || !selectGenero || !selectAutores) {
            return;
        }

        var editorialPrevia = selectEditorial.value;
        var generoPrevio = selectGenero.value;
        var autoresPrevios = leerValoresSeleccionados(selectAutores);

        limpiarNodo(selectEditorial);
        crearOpcion(selectEditorial, '', 'Seleccione una editorial...', editorialPrevia === '');
        (li.editoriales || []).forEach(function (editorial) {
            crearOpcion(selectEditorial, editorial.id, editorial.nombre, String(editorial.id) === editorialPrevia);
        });
        asegurarSeleccion(selectEditorial);

        limpiarNodo(selectGenero);
        crearOpcion(selectGenero, '', '«Sin clasificar»', generoPrevio === '');
        (li.generos || []).forEach(function (genero) {
            crearOpcion(selectGenero, genero.id, genero.nombre, String(genero.id) === generoPrevio);
        });
        asegurarSeleccion(selectGenero);

        limpiarNodo(selectAutores);
        selectAutores.multiple = true;
        (li.autores || []).forEach(function (autor) {
            crearOpcion(selectAutores, autor.id, autor.nombre, autoresPrevios.indexOf(String(autor.id)) !== -1);
        });
    }

    function agregarCelda(fila, texto) {
        var celda = document.createElement('td');
        celda.textContent = texto;
        fila.appendChild(celda);
        return celda;
    }

    function renderTablaLibros(coleccion) {
        var li = coleccionDe(coleccion);
        var tbody = document.getElementById('tabla-libros');
        if (!tbody) {
            return;
        }
        limpiarNodo(tbody);

        (li.libros || []).forEach(function (libro) {
            var fila = document.createElement('tr');
            var editorial = (li.editoriales || []).filter(function (e) { return e.id === libro.editorialId; })[0];
            var genero = libro.generoId !== null
                ? (li.generos || []).filter(function (g) { return g.id === libro.generoId; })[0]
                : null;

            agregarCelda(fila, libro.titulo);
            agregarCelda(fila, libro.isbn);
            agregarCelda(fila, editorial ? editorial.nombre : '');
            agregarCelda(fila, genero ? genero.nombre : 'Sin clasificar');
            agregarCelda(fila, '$' + Number(libro.precio).toFixed(2));
            tbody.appendChild(fila);
        });

        var vacio = document.getElementById('libros-vacio');
        if (vacio) {
            vacio.hidden = (li.libros || []).length > 0;
        }
    }

    var CAMPOS_LIBRO = {
        titulo: 'libro-titulo',
        isbn: 'libro-isbn',
        precio: 'libro-precio',
        editorial: 'libro-editorial',
        autores: 'libro-autores',
        genero: 'libro-genero'
    };

    function limpiarAria() {
        Object.keys(CAMPOS_LIBRO).forEach(function (campo) {
            var control = document.getElementById(CAMPOS_LIBRO[campo]);
            if (control && control.removeAttribute) {
                control.removeAttribute('aria-invalid');
                control.removeAttribute('aria-describedby');
            }
        });
    }

    function mostrarErrores(errores) {
        var nodoError = document.getElementById('libros-error');
        if (nodoError) {
            nodoError.textContent = errores.map(function (e) { return e.mensaje; }).join(' ');
            nodoError.hidden = false;
        }
        var nodoExito = document.getElementById('libros-exito');
        if (nodoExito) {
            nodoExito.hidden = true;
        }

        limpiarAria();
        errores.forEach(function (error) {
            var control = document.getElementById(CAMPOS_LIBRO[error.campo]);
            if (control) {
                control.setAttribute('aria-invalid', 'true');
                control.setAttribute('aria-describedby', 'libros-error');
            }
        });

        var primero = errores.length > 0 ? document.getElementById(CAMPOS_LIBRO[errores[0].campo]) : null;
        if (primero && primero.focus) {
            primero.focus();
        }
    }

    function leerAutoresSeleccionados() {
        var select = document.getElementById('libro-autores');
        if (!select) {
            return [];
        }
        return leerValoresSeleccionados(select);
    }

    function leerDatosFormulario() {
        return {
            titulo: document.getElementById('libro-titulo').value,
            isbn: document.getElementById('libro-isbn').value,
            precio: document.getElementById('libro-precio').value,
            editorialId: document.getElementById('libro-editorial').value,
            generoId: document.getElementById('libro-genero').value,
            autoresIds: leerAutoresSeleccionados()
        };
    }

    function normalizarAutores(ids) {
        var salida = [];
        (ids || []).forEach(function (valor) {
            var id = parsearId(valor);
            if (Number.isInteger(id) && salida.indexOf(id) === -1) {
                salida.push(id);
            }
        });
        return salida;
    }

    function poblarSelectorVentaLibros(coleccion) {
        var li = coleccionDe(coleccion);
        var select = document.getElementById('venta-libro');
        if (!select) {
            return;
        }
        var previo = select.value;
        limpiarNodo(select);
        crearOpcion(select, '', 'Seleccione un libro...', previo === '');
        (li.libros || []).forEach(function (libro) {
            crearOpcion(select, libro.id, libro.titulo, String(libro.id) === previo);
        });
        asegurarSeleccion(select);
    }

    function refrescarCatalogo() {
        if (window.catalogo && typeof window.catalogo.refrescar === 'function') {
            window.catalogo.refrescar();
        }
    }

    function limpiarFormulario() {
        var formulario = document.querySelector('#vista-libros form');
        if (formulario && formulario.reset) {
            formulario.reset();
        }
        limpiarAria();
    }

    function manejarSubmitLibro(event) {
        event.preventDefault();
        var li = window.libreria;
        if (!li) {
            return;
        }

        var datos = leerDatosFormulario();
        var resultado = validarLibro(datos, li);
        if (!resultado.valido) {
            mostrarErrores(resultado.errores);
            return;
        }

        var libro = {
            id: siguienteId(li.libros),
            titulo: normalizarTexto(datos.titulo),
            isbn: normalizarTexto(datos.isbn),
            precio: parsearPrecio(datos.precio),
            editorialId: parsearId(datos.editorialId),
            generoId: parsearId(datos.generoId),
            autoresIds: normalizarAutores(datos.autoresIds)
        };

        li.libros.push(libro);

        if (window.storage && typeof window.storage.saveToStorage === 'function') {
            window.storage.saveToStorage(window.storage.CLAVE_LIBROS, li.libros);
        }

        renderTablaLibros(li);
        poblarSelectores(li);
        poblarSelectorVentaLibros(li);
        refrescarCatalogo();
        limpiarFormulario();

        var nodoError = document.getElementById('libros-error');
        if (nodoError) {
            nodoError.hidden = true;
            nodoError.textContent = '';
        }
        var nodoExito = document.getElementById('libros-exito');
        if (nodoExito) {
            nodoExito.hidden = false;
        }
    }

    function inicializar() {
        var li = window.libreria;
        if (!li) {
            return;
        }
        renderTablaLibros(li);
        poblarSelectores(li);
        poblarSelectorVentaLibros(li);

        var formulario = document.querySelector('#vista-libros form');
        if (formulario) {
            formulario.addEventListener('submit', manejarSubmitLibro);
        }
    }

    window.libros = window.libros || {};
    window.libros.normalizarIsbn = normalizarIsbn;
    window.libros.siguienteId = siguienteId;
    window.libros.parsearPrecio = parsearPrecio;
    window.libros.validarLibro = validarLibro;
    window.libros.poblarSelectores = poblarSelectores;
    window.libros.renderTablaLibros = renderTablaLibros;
    window.libros.poblarSelectorVentaLibros = poblarSelectorVentaLibros;

    inicializar();
})();
