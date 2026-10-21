(function () {
    'use strict';

    var document = window.document;
    var CAMPOS_VENTA = ['venta-cliente', 'venta-libro', 'venta-cantidad'];
    var inicializado = false;

    function redondear2(valor) {
        return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
    }

    function normalizarTexto(valor) {
        return String(valor === null || valor === undefined ? '' : valor).trim();
    }

    function validarCantidad(valor) {
        var numero = Number(valor);
        return Number.isInteger(numero) && numero > 0;
    }

    function validarClienteSeleccionado(idCliente, coleccion) {
        var li = coleccion || window.libreria || {};
        var clientes = li.clientes || [];
        var id = normalizarTexto(idCliente);

        if (id === '') {
            return { valido: false, mensaje: 'El cliente es obligatorio.' };
        }

        var numero = Number(id);
        if (!Number.isInteger(numero)) {
            return { valido: false, mensaje: 'El cliente seleccionado no es válido.' };
        }

        var existe = clientes.some(function (cliente) { return Number(cliente.id) === numero; });
        if (!existe) {
            return { valido: false, mensaje: 'El cliente seleccionado no existe.' };
        }

        return { valido: true, mensaje: '' };
    }

    function agregarRenglon(libroId, libroTitulo, precioUnitario, cantidad, renglones) {
        var renglonesLista = renglones || [];
        var precio = Number(precioUnitario);
        var cantidadNumero = Number(cantidad);

        if (!validarCantidad(cantidadNumero)) {
            return { valido: false, mensaje: 'La cantidad debe ser un número entero mayor que cero.' };
        }

        var existente = renglonesLista.find(function (r) { return Number(r.libroId) === Number(libroId); });
        if (existente) {
            existente.cantidad += cantidadNumero;
            existente.subtotal = redondear2(existente.cantidad * existente.precioUnitario);
            return { valido: true, mensaje: 'El libro ya estaba en la venta. Se sumó la cantidad al renglón existente.' };
        }

        var nuevoRenglon = {
            libroId: libroId,
            libroTitulo: libroTitulo,
            precioUnitario: precio,
            cantidad: cantidadNumero,
            subtotal: redondear2(cantidadNumero * precio)
        };
        renglonesLista.push(nuevoRenglon);
        return { valido: true, mensaje: 'Renglón agregado.' };
    }

    function quitarRenglon(libroId, renglones) {
        var renglonesLista = renglones || [];
        for (var i = 0; i < renglonesLista.length; i++) {
            if (Number(renglonesLista[i].libroId) === Number(libroId)) {
                renglonesLista.splice(i, 1);
                return { valido: true, renglones: renglonesLista };
            }
        }
        return { valido: false, renglones: renglonesLista };
    }

    function limpiarNodo(nodo) {
        while (nodo.firstChild) {
            nodo.removeChild(nodo.firstChild);
        }
    }

    function agregarCelda(fila, texto) {
        var celda = document.createElement('td');
        celda.textContent = texto;
        fila.appendChild(celda);
        return celda;
    }

    function calcularSubtotal(cantidad, precio) {
        return redondear2(Number(cantidad) * Number(precio));
    }

    function calcularTotal(renglones) {
        var total = 0;
        (renglones || []).forEach(function (r) {
            total += r.subtotal === undefined ? calcularSubtotal(r.cantidad, r.precioUnitario) : Number(r.subtotal);
        });
        return redondear2(total);
    }

    function formatoTotal(valor) {
        return '$' + Number(valor).toFixed(2);
    }

    function actualizarTotal(renglones) {
        var nodoValor = document.getElementById('ventas-total-valor');
        if (nodoValor) {
            nodoValor.textContent = formatoTotal(calcularTotal(renglones));
            return;
        }
        var nodoTotal = document.getElementById('ventas-total');
        if (nodoTotal) {
            nodoTotal.textContent = 'Total de la Venta: ' + formatoTotal(calcularTotal(renglones));
        }
    }

    function ocultarMensajesVenta() {
        var nodoError = document.getElementById('ventas-error');
        var nodoExito = document.getElementById('ventas-exito');
        if (nodoError) { nodoError.hidden = true; }
        if (nodoExito) { nodoExito.hidden = true; }
    }

    function mostrarErrorVenta(mensaje) {
        var nodoError = document.getElementById('ventas-error');
        if (nodoError) {
            nodoError.textContent = mensaje;
            nodoError.hidden = false;
        }
    }

    function mostrarExitoVenta(mensaje) {
        var nodoExito = document.getElementById('ventas-exito');
        if (nodoExito) {
            nodoExito.textContent = mensaje;
            nodoExito.hidden = false;
        }
    }

    function limpiarAriaVenta() {
        CAMPOS_VENTA.forEach(function (id) {
            var campo = document.getElementById(id);
            if (campo && campo.removeAttribute) {
                campo.removeAttribute('aria-invalid');
            }
        });
    }

    function renderTablaRenglones(renglones) {
        var tbody = document.getElementById('tabla-renglones');
        if (!tbody) {
            return;
        }
        limpiarNodo(tbody);

        (renglones || []).forEach(function (r) {
            var fila = document.createElement('tr');
            agregarCelda(fila, r.libroTitulo);
            agregarCelda(fila, formatoTotal(r.precioUnitario));
            agregarCelda(fila, String(r.cantidad));
            agregarCelda(fila, formatoTotal(r.subtotal));
            var celdaAccion = document.createElement('td');
            var botonQuitar = document.createElement('button');
            botonQuitar.type = 'button';
            botonQuitar.textContent = 'Quitar';
            botonQuitar.setAttribute('data-libro-id', String(r.libroId));
            botonQuitar.addEventListener('click', function () {
                quitarRenglon(r.libroId, renglones);
                renderTablaRenglones(renglones);
            });
            celdaAccion.appendChild(botonQuitar);
            fila.appendChild(celdaAccion);
            tbody.appendChild(fila);
        });

        var vacio = document.getElementById('ventas-vacio');
        if (vacio) {
            vacio.hidden = (renglones || []).length > 0;
        }
        actualizarTotal(renglones);
    }

    function siguienteIdVenta() {
        var li = window.libreria;
        var ventas = li.ventas = li.ventas || [];
        var maximo = 0;
        ventas.forEach(function (v) {
            var id = Number(v.id);
            if (Number.isInteger(id) && id > maximo) {
                maximo = id;
            }
        });
        return maximo + 1;
    }

    function validarVenta(idCliente, renglones) {
        var errores = [];
        var campos = [];
        var clienteResultado = validarClienteSeleccionado(idCliente, window.libreria);

        if (!clienteResultado.valido) {
            errores.push(clienteResultado.mensaje);
            campos.push('venta-cliente');
        }
        if (!(renglones && renglones.length > 0)) {
            errores.push('La venta debe tener al menos un renglón.');
            campos.push('tabla-renglones');
        }

        return { valido: errores.length === 0, errores: errores, campos: campos };
    }

    function registrarVenta(idCliente, nombreCliente, renglones) {
        var li = window.libreria;
        var ventas = li.ventas = li.ventas || [];
        var idNumero = Number(idCliente);
        var cliente = (li.clientes || []).find(function (c) { return Number(c.id) === idNumero; });
        var renglonesVenta = (renglones || []).map(function (r) {
            var cantidad = Number(r.cantidad);
            var precio = Number(r.precioUnitario);
            return {
                libroId: Number(r.libroId),
                libroTitulo: r.libroTitulo,
                precioUnitario: precio,
                cantidad: cantidad,
                subtotal: redondear2(cantidad * precio)
            };
        });
        var venta = {
            id: siguienteIdVenta(),
            fecha: new Date().toISOString(),
            clienteId: idNumero,
            clienteNombre: cliente ? cliente.nombreCompleto : normalizarTexto(nombreCliente),
            renglones: renglonesVenta,
            total: calcularTotal(renglonesVenta)
        };
        ventas.push(venta);
        return venta;
    }

    function limpiarVenta() {
        var form = document.querySelector('#vista-ventas form');
        if (form && form.reset) {
            form.reset();
        }
        var inputCantidad = document.getElementById('venta-cantidad');
        if (inputCantidad) {
            inputCantidad.value = '1';
        }
        limpiarAriaVenta();
        actualizarTotal([]);
    }

    var renglonesVenta = [];

    function manejarAgregarRenglon() {
        var li = window.libreria;
        var selectLibro = document.getElementById('venta-libro');
        var inputCantidad = document.getElementById('venta-cantidad');

        ocultarMensajesVenta();

        if (!selectLibro || !inputCantidad) {
            return;
        }

        var libroId = Number(selectLibro.value);
        if (!libroId) {
            mostrarErrorVenta('Seleccione un libro.');
            return;
        }

        var libro = (li.libros || []).find(function (l) { return Number(l.id) === libroId; });
        if (!libro) {
            mostrarErrorVenta('El libro seleccionado no existe.');
            return;
        }

        var resultado = agregarRenglon(libro.id, libro.titulo, libro.precio, inputCantidad.value, renglonesVenta);
        if (!resultado.valido) {
            mostrarErrorVenta(resultado.mensaje);
            return;
        }

        renderTablaRenglones(renglonesVenta);
        inputCantidad.value = '1';

        if (resultado.mensaje.indexOf('ya estaba') === 0) {
            mostrarExitoVenta(resultado.mensaje);
        }
    }

    function manejarSubmitVenta(event) {
        event.preventDefault();
        var li = window.libreria;
        var selectCliente = document.getElementById('venta-cliente');
        var idCliente = selectCliente ? selectCliente.value : '';
        var nombreCliente = '';

        if (selectCliente) {
            var opciones = selectCliente.options;
            for (var i = 0; i < opciones.length; i++) {
                if (opciones[i].selected) {
                    nombreCliente = opciones[i].textContent;
                    break;
                }
            }
        }

        ocultarMensajesVenta();
        limpiarAriaVenta();

        var resultado = validarVenta(idCliente, renglonesVenta);
        if (!resultado.valido) {
            resultado.campos.forEach(function (id) {
                var campo = document.getElementById(id);
                if (campo && campo.setAttribute) {
                    campo.setAttribute('aria-invalid', 'true');
                }
            });
            mostrarErrorVenta(resultado.errores.join(' '));
            return;
        }

        registrarVenta(idCliente, nombreCliente, renglonesVenta);

        if (window.storage && typeof window.storage.saveToStorage === 'function') {
            window.storage.saveToStorage(window.storage.CLAVE_VENTAS, li.ventas);
        }

        renglonesVenta = [];
        renderTablaRenglones(renglonesVenta);
        limpiarVenta();

        if (window.historial && typeof window.historial.renderTablaHistorial === 'function') {
            window.historial.renderTablaHistorial(li.ventas);
        }

        mostrarExitoVenta('Venta confirmada correctamente.');
    }

    function inicializar() {
        if (inicializado) {
            return;
        }
        var li = window.libreria;
        if (!li) {
            return;
        }
        inicializado = true;

        if (window.clientes && typeof window.clientes.poblarSelectorVentaClientes === 'function') {
            window.clientes.poblarSelectorVentaClientes(li);
        }
        if (window.libros && typeof window.libros.poblarSelectorVentaLibros === 'function') {
            window.libros.poblarSelectorVentaLibros(li);
        }

        var botonAgregar = document.getElementById('agregar-renglon');
        if (botonAgregar) {
            botonAgregar.addEventListener('click', manejarAgregarRenglon);
        }

        var form = document.querySelector('#vista-ventas form');
        if (form) {
            form.addEventListener('submit', manejarSubmitVenta);
        }

        renderTablaRenglones(renglonesVenta);
    }

    window.ventas = window.ventas || {};
    window.ventas.CAMPOS_VENTA = CAMPOS_VENTA;
    window.ventas.redondear2 = redondear2;
    window.ventas.validarCantidad = validarCantidad;
    window.ventas.validarClienteSeleccionado = validarClienteSeleccionado;
    window.ventas.agregarRenglon = agregarRenglon;
    window.ventas.quitarRenglon = quitarRenglon;
    window.ventas.calcularSubtotal = calcularSubtotal;
    window.ventas.calcularTotal = calcularTotal;
    window.ventas.formatoTotal = formatoTotal;
    window.ventas.renderTablaRenglones = renderTablaRenglones;
    window.ventas.validarVenta = validarVenta;
    window.ventas.registrarVenta = registrarVenta;
    window.ventas.limpiarVenta = limpiarVenta;
    window.ventas.inicializar = inicializar;

    inicializar();
})();
