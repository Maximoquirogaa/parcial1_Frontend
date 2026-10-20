/**
 * HISTORIAL.JS - Consulta inmutable de ventas registradas
 * Cumple Ejercicio 5:
 * - Muestra identificador, fecha, cliente y total de cada venta.
 * - Permite consultar los renglones de la venta seleccionada.
 * - Los valores mostrados corresponden al precio unitario histórico y subtotal congelados.
 * - Las ventas confirmadas no se editan ni eliminan desde la interfaz.
 */

const HistorialModule = {
  elements: {},

  init() {
    this.elements = {
      tableBody: document.getElementById('tabla-historial-body'),
      badgeTotal: document.getElementById('badge-total-ventas'),
      emptyState: document.getElementById('historial-empty'),

      // Panel de detalle
      panelDetalle: document.getElementById('panel-detalle-venta'),
      btnCerrarDetalle: document.getElementById('btn-cerrar-detalle'),
      detalleId: document.getElementById('detalle-id'),
      detalleFecha: document.getElementById('detalle-fecha'),
      detalleCliente: document.getElementById('detalle-cliente'),
      detalleEmail: document.getElementById('detalle-email'),
      detalleTotal: document.getElementById('detalle-total'),
      detalleRenglonesBody: document.getElementById('tabla-detalle-renglones-body')
    };

    this.bindEvents();
    this.render();
  },

  bindEvents() {
    this.elements.btnCerrarDetalle.addEventListener('click', () => {
      this.cerrarDetalle();
    });
  },

  cerrarDetalle() {
    this.elements.panelDetalle.hidden = true;
  },

  /**
   * Renderiza el listado principal de ventas en orden cronológico descendente
   */
  render() {
    const ventas = StorageService.getVentas();
    this.elements.badgeTotal.textContent = `${ventas.length} venta${ventas.length === 1 ? '' : 's'}`;
    this.elements.tableBody.replaceChildren();

    if (ventas.length === 0) {
      this.elements.emptyState.hidden = false;
      this.cerrarDetalle();
      return;
    }

    this.elements.emptyState.hidden = true;

    // Mostramos las ventas más recientes primero
    const ventasOrdenadas = [...ventas].reverse();

    ventasOrdenadas.forEach(venta => {
      const tr = document.createElement('tr');

      // ID Venta
      const tdId = document.createElement('td');
      tdId.textContent = venta.id;
      tdId.style.fontFamily = 'var(--font-mono)';
      tdId.style.fontWeight = 'bold';

      // Fecha
      const tdFecha = document.createElement('td');
      tdFecha.textContent = venta.fecha;

      // Cliente
      const tdCliente = document.createElement('td');
      tdCliente.textContent = venta.cliente ? venta.cliente.nombre : 'Cliente no especificado';

      // Total
      const tdTotal = document.createElement('td');
      tdTotal.className = 'text-right font-bold';
      tdTotal.textContent = `$${Number(venta.total).toFixed(2)}`;

      // Botón Ver Detalle
      const tdAcciones = document.createElement('td');
      tdAcciones.className = 'text-center';

      const btnVer = document.createElement('button');
      btnVer.type = 'button';
      btnVer.className = 'btn btn-secondary btn-sm';
      btnVer.textContent = 'Ver detalle';
      btnVer.setAttribute('aria-label', `Ver detalle del comprobante ${venta.id}`);

      btnVer.addEventListener('click', () => {
        this.mostrarDetalle(venta.id);
      });

      tdAcciones.appendChild(btnVer);

      tr.appendChild(tdId);
      tr.appendChild(tdFecha);
      tr.appendChild(tdCliente);
      tr.appendChild(tdTotal);
      tr.appendChild(tdAcciones);

      this.elements.tableBody.appendChild(tr);
    });
  },

  /**
   * Muestra el detalle inmutable de una venta seleccionada
   */
  mostrarDetalle(ventaId) {
    const venta = StorageService.getVentaById(ventaId);
    if (!venta) return;

    this.elements.detalleId.textContent = venta.id;
    this.elements.detalleFecha.textContent = venta.fecha;
    this.elements.detalleCliente.textContent = venta.cliente ? venta.cliente.nombre : '-';
    this.elements.detalleEmail.textContent = venta.cliente ? venta.cliente.email : '-';
    this.elements.detalleTotal.textContent = `$${Number(venta.total).toFixed(2)}`;

    // Renglones históricos congelados
    this.elements.detalleRenglonesBody.replaceChildren();

    venta.renglones.forEach(renglon => {
      const tr = document.createElement('tr');

      const tdLibro = document.createElement('td');
      tdLibro.textContent = renglon.titulo;
      tdLibro.className = 'font-bold';

      const tdCant = document.createElement('td');
      tdCant.className = 'text-center';
      tdCant.textContent = String(renglon.cantidad);

      const tdPrecioHist = document.createElement('td');
      tdPrecioHist.className = 'text-right';
      // Importante: Lee el precio histórico congelado, nunca el precio actual del catálogo
      tdPrecioHist.textContent = `$${Number(renglon.precioUnitarioHistorico).toFixed(2)}`;

      const tdSubtotal = document.createElement('td');
      tdSubtotal.className = 'text-right font-bold';
      tdSubtotal.textContent = `$${Number(renglon.subtotalHistorico).toFixed(2)}`;

      tr.appendChild(tdLibro);
      tr.appendChild(tdCant);
      tr.appendChild(tdPrecioHist);
      tr.appendChild(tdSubtotal);

      this.elements.detalleRenglonesBody.appendChild(tr);
    });

    this.elements.panelDetalle.hidden = false;
    this.elements.panelDetalle.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

