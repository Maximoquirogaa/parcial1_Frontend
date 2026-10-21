(function () {
    'use strict';

    var document = window.document;

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

        var existe = clientes.some(function (cliente) { return cliente.id === numero; });
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

        var existente = renglonesLista.find(function (r) { return r.libroId === libroId; });
        if (existente) {
            existente.cantidad += cantidadNumero;
            existente.subtotal = existente.cantidad * existente.precioUnitario;
            return { valido: true, mensaje: 'El libro ya estaba en la venta. Se sumó la cantidad al renglón existente.' };
        }

        var nuevoRenglon = {
            libroId: libroId,
            libroTitulo: libroTitulo,
            precioUnitario: precio,
            cantidad: cantidadNumero,
            subtotal: cantidadNumero * precio
        };
        renglonesLista.push(nuevoRenglon);
        return { valido: true, mensaje: 'Renglón agregado.' };
    }

    function quitarRenglon(libroId, renglones) {
        var renglonesLista = renglones || [];
        var encontrado = false;
        for (var i = renglonesLista.length - 1; i >= 0; i--) {
            if (renglonesLista[i].libroId === libroId) {
                renglonesLista.splice(i, 1);
                encontrado = true;
            }
        }
        return { valido: encontrado, renglones: renglonesLista };
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
        return Number(cantidad) * Number(precio);
    }

    function calcularTotal(renglones) {
        var total = 0;
        (renglones || []).forEach(function (r) { total += Number(r.subtotal); });
        return total;
    }

    function formatoTotal(valor) {
        return '$' + Number(valor).toFixed(2);
    }

    function actualizarTotal(renglones) {
        var nodoTotal = document.getElementById('ventas-total');
        if (nodoTotal) {
            nodoTotal.textContent = 'Total de la Venta: ' + formatoTotal(calcularTotal(renglones));
        }
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
            if (Number.isInteger(v.id) && v.id > maximo) {
                maximo = v.id;
            }
        });
        return maximo + 1;
    }

    function validarVenta(idCliente, renglones) {
        var errores = [];
        var clienteResultado = validarClienteSeleccionado(idCliente, window.libreria);
        if (!clienteResultado.valido) {
            errores.push(clienteResultado.mensaje);
        }
        if (!(renglones && renglones.length > 0)) {
            errores.push('La venta debe tener al menos un renglón.');
        }
        return { valido: errores.length === 0, errores: errores };
    }

    function registrarVenta(idCliente, nombreCliente, renglones) {
        var li = window.libreria;
        var ventas = li.ventas = li.ventas || [];
        var id = siguienteIdVenta();
        var venta = {
            id: id,
            fecha: new Date().toISOString(),
            clienteId: Number(idCliente),
            clienteNombre: normalizarTexto(nombreCliente),
            renglones: renglones.map(function (r) {
                return {
                    libroId: r.libroId,
                    libroTitulo: r.libroTitulo,
                    precioUnitario: r.precioUnitario,
                    cantidad: r.cantidad,
                    subtotal: r.subtotal
                };
            }),
            total: calcularTotal(renglones)
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
        actualizarTotal([]);
    }

    var renglonesVenta = [];

    function manejarAgregarRenglon() {
        var li = window.libreria;
        var selectLibro = document.getElementById('venta-libro');
        var inputCantidad = document.getElementById('venta-cantidad');
        var nodoError = document.getElementById('ventas-error');
        var nodoExito = document.getElementById('ventas-exito');

        if (nodoError) { nodoError.hidden = true; }
        if (nodoExito) { nodoExito.hidden = true; }

        if (!selectLibro || !inputCantidad) {
            return;
        }

        var libroId = Number(selectLibro.value);
        if (!libroId) {
            if (nodoError) {
                nodoError.textContent = 'Seleccione un libro.';
                nodoError.hidden = false;
            }
            return;
        }

        var libro = (li.libros || []).find(function (l) { return l.id === libroId; });
        if (!libro) {
            return;
        }

        var resultado = agregarRenglon(libro.id, libro.titulo, libro.precio, inputCantidad.value, renglonesVenta);
        if (!resultado.valido) {
            if (nodoError) {
                nodoError.textContent = resultado.mensaje;
                nodoError.hidden = false;
            }
            return;
        }

        renderTablaRenglones(renglonesVenta);
        inputCantidad.value = '1';
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

        var nodoError = document.getElementById('ventas-error');
        var nodoExito = document.getElementById('ventas-exito');

        if (nodoError) { nodoError.hidden = true; }
        if (nodoExito) { nodoExito.hidden = true; }

        var resultado = validarVenta(idCliente, renglonesVenta);
        if (!resultado.valido) {
            if (nodoError) {
                nodoError.textContent = resultado.errores.join(' ');
                nodoError.hidden = false;
            }
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

        if (nodoExito) { nodoExito.hidden = false; }
    }

    function inicializar() {
        var li = window.libreria;
        if (!li) {
            return;
        }

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
