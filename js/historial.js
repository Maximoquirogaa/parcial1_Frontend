(function () {
    'use strict';

    var document = window.document;
    var inicializado = false;

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

    function formatoTotal(valor) {
        return '$' + Number(valor).toFixed(2);
    }

    function obtenerVenta(id) {
        var li = window.libreria;
        var ventas = li.ventas || [];
        var numero = Number(id);
        return ventas.find(function (v) { return v.id === numero; }) || null;
    }

    function renderTablaHistorial(ventas) {
        var tbody = document.getElementById('tabla-historial');
        if (!tbody) {
            return;
        }
        limpiarNodo(tbody);

        (ventas || []).forEach(function (venta) {
            var fila = document.createElement('tr');
            agregarCelda(fila, String(venta.id));
            agregarCelda(fila, venta.fecha);
            agregarCelda(fila, venta.clienteNombre);
            agregarCelda(fila, formatoTotal(venta.total));
            var celdaAccion = document.createElement('td');
            var botonDetalle = document.createElement('button');
            botonDetalle.type = 'button';
            botonDetalle.textContent = 'Ver Detalle';
            botonDetalle.setAttribute('data-venta-id', String(venta.id));
            botonDetalle.addEventListener('click', function () {
                renderDetalleVenta(obtenerVenta(venta.id) || venta);
            });
            celdaAccion.appendChild(botonDetalle);
            fila.appendChild(celdaAccion);
            tbody.appendChild(fila);
        });

        var vacio = document.getElementById('historial-vacio');
        if (vacio) {
            vacio.hidden = (ventas || []).length > 0;
        }
    }

    function renderDetalleVenta(venta) {
        var tbody = document.getElementById('tabla-detalle-venta');
        if (!tbody) {
            return;
        }
        limpiarNodo(tbody);

        (venta.renglones || []).forEach(function (r) {
            var fila = document.createElement('tr');
            agregarCelda(fila, r.libroTitulo);
            agregarCelda(fila, formatoTotal(r.precioUnitario));
            agregarCelda(fila, String(r.cantidad));
            agregarCelda(fila, formatoTotal(r.subtotal));
            tbody.appendChild(fila);
        });

        var detalle = document.getElementById('historial-detalle');
        if (detalle) {
            detalle.hidden = false;
        }
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
        renderTablaHistorial(li.ventas || []);
    }

    window.historial = window.historial || {};
    window.historial.renderTablaHistorial = renderTablaHistorial;
    window.historial.obtenerVenta = obtenerVenta;
    window.historial.renderDetalleVenta = renderDetalleVenta;
    window.historial.inicializar = inicializar;

    inicializar();
})();
