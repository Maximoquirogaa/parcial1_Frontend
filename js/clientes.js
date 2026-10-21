(function () {
    'use strict';

    var document = window.document;

    function normalizarTexto(valor) {
        return String(valor === null || valor === undefined ? '' : valor).trim();
    }

    function normalizarEmail(valor) {
        return normalizarTexto(valor).toLowerCase();
    }

    function esEmailValido(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validarCliente(datos, coleccion) {
        var li = coleccion || window.libreria || {};
        var clientes = li.clientes || [];
        var errores = [];

        var nombre = normalizarTexto(datos.nombreCompleto);
        var email = normalizarTexto(datos.email);

        if (nombre === '') {
            errores.push({ campo: 'nombre', mensaje: 'El nombre completo es obligatorio.' });
        }

        if (email === '') {
            errores.push({ campo: 'email', mensaje: 'El email es obligatorio.' });
        } else if (!esEmailValido(email)) {
            errores.push({ campo: 'email', mensaje: 'El email no tiene un formato válido.' });
        } else {
            var duplicado = clientes.some(function (cliente) {
                return normalizarEmail(cliente.email) === normalizarEmail(email);
            });
            if (duplicado) {
                errores.push({ campo: 'email', mensaje: 'El email ya está registrado (duplicado).' });
            }
        }

        return { valido: errores.length === 0, errores: errores };
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

    function agregarCelda(fila, texto) {
        var celda = document.createElement('td');
        celda.textContent = texto;
        fila.appendChild(celda);
        return celda;
    }

    function renderTablaClientes(coleccion) {
        var li = coleccion || window.libreria || {};
        var tbody = document.getElementById('tabla-clientes');
        if (!tbody) {
            return;
        }
        limpiarNodo(tbody);

        (li.clientes || []).forEach(function (cliente) {
            var fila = document.createElement('tr');
            agregarCelda(fila, String(cliente.id));
            agregarCelda(fila, cliente.nombreCompleto);
            agregarCelda(fila, cliente.email);
            tbody.appendChild(fila);
        });

        var vacio = document.getElementById('clientes-vacio');
        if (vacio) {
            vacio.hidden = (li.clientes || []).length > 0;
        }
    }

    function poblarSelectorVentaClientes(coleccion) {
        var li = coleccion || window.libreria || {};
        var select = document.getElementById('venta-cliente');
        if (!select) {
            return;
        }
        var previo = select.value;
        limpiarNodo(select);
        crearOpcion(select, '', 'Seleccione un cliente...', previo === '');
        (li.clientes || []).forEach(function (cliente) {
            crearOpcion(select, cliente.id, cliente.nombreCompleto, String(cliente.id) === previo);
        });
        var haySeleccion = false;
        for (var i = 0; i < select.options.length; i++) {
            if (select.options[i].selected) {
                haySeleccion = true;
                break;
            }
        }
        if (!haySeleccion && select.options.length > 0) {
            select.options[0].selected = true;
        }
    }

    var CAMPOS_CLIENTE = {
        nombre: 'cliente-nombre',
        email: 'cliente-email'
    };

    function limpiarAria() {
        Object.keys(CAMPOS_CLIENTE).forEach(function (campo) {
            var control = document.getElementById(CAMPOS_CLIENTE[campo]);
            if (control && control.removeAttribute) {
                control.removeAttribute('aria-invalid');
                control.removeAttribute('aria-describedby');
            }
        });
    }

    function mostrarErrores(errores) {
        var nodoError = document.getElementById('clientes-error');
        if (nodoError) {
            nodoError.textContent = errores.map(function (e) { return e.mensaje; }).join(' ');
            nodoError.hidden = false;
        }
        var nodoExito = document.getElementById('clientes-exito');
        if (nodoExito) {
            nodoExito.hidden = true;
        }

        limpiarAria();
        errores.forEach(function (error) {
            var control = document.getElementById(CAMPOS_CLIENTE[error.campo]);
            if (control) {
                control.setAttribute('aria-invalid', 'true');
                control.setAttribute('aria-describedby', 'clientes-error');
            }
        });

        var primero = errores.length > 0 ? document.getElementById(CAMPOS_CLIENTE[errores[0].campo]) : null;
        if (primero && primero.focus) {
            primero.focus();
        }
    }

    function leerDatosFormulario() {
        return {
            nombreCompleto: document.getElementById('cliente-nombre').value,
            email: document.getElementById('cliente-email').value
        };
    }

    function limpiarFormulario() {
        var formulario = document.querySelector('#vista-clientes form');
        if (formulario && formulario.reset) {
            formulario.reset();
        }
        limpiarAria();
    }

    function manejarSubmitCliente(event) {
        event.preventDefault();
        var li = window.libreria;
        if (!li) {
            return;
        }

        var datos = leerDatosFormulario();
        var resultado = validarCliente(datos, li);
        if (!resultado.valido) {
            mostrarErrores(resultado.errores);
            return;
        }

        li.clientes.push({
            id: siguienteId(li.clientes),
            nombreCompleto: normalizarTexto(datos.nombreCompleto),
            email: normalizarTexto(datos.email)
        });

        renderTablaClientes(li);
        poblarSelectorVentaClientes(li);
        limpiarFormulario();

        var nodoError = document.getElementById('clientes-error');
        if (nodoError) {
            nodoError.hidden = true;
            nodoError.textContent = '';
        }
        var nodoExito = document.getElementById('clientes-exito');
        if (nodoExito) {
            nodoExito.hidden = false;
        }
    }

    function inicializar() {
        var li = window.libreria;
        if (!li) {
            return;
        }
        renderTablaClientes(li);
        poblarSelectorVentaClientes(li);

        var formulario = document.querySelector('#vista-clientes form');
        if (formulario) {
            formulario.addEventListener('submit', manejarSubmitCliente);
        }
    }

    window.clientes = window.clientes || {};
    window.clientes.normalizarEmail = normalizarEmail;
    window.clientes.validarCliente = validarCliente;
    window.clientes.siguienteId = siguienteId;
    window.clientes.renderTablaClientes = renderTablaClientes;
    window.clientes.poblarSelectorVentaClientes = poblarSelectorVentaClientes;

    inicializar();
})();
