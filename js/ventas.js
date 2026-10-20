/**
 * VENTAS.JS - Emisión de ventas simuladas
 * Cumple Ejercicio 5:
 * - Selección de cliente existente.
 * - Composición de renglones con libros y cantidades enteras > 0.
 * - No admite libros duplicados: incrementa la cantidad en el renglón existente e informa al usuario.
 * - Permite modificar cantidades y eliminar renglones antes de confirmar.
 * - Subtotal = cantidad * precio unitario; Total = suma de subtotales, presentados con 2 decimales.
 * - Impide confirmar sin cliente, sin renglones o con cantidades inválidas.
 * - Al confirmar, congela el precio unitario histórico en el renglón y guarda la venta.
 * - Limpia el formulario y notifica el resultado.
 */

const VentasModule = {
  // Estado local del borrador de la venta en curso
  borradorRenglones: [], // Array de { libroId, titulo, precioUnitario, cantidad, subtotal }

  elements: {},

  init() {
    this.elements = {
      selectCliente: document.getElementById('venta-cliente'),
      selectLibro: document.getElementById('venta-libro'),
      inputCantidad: document.getElementById('venta-cantidad'),
      libroInfo: document.getElementById('venta-libro-info'),
      formRenglon: document.getElementById('form-renglon'),
      feedback: document.getElementById('form-venta-feedback'),

      // Errores de entrada
      errorCliente: document.getElementById('error-venta-cliente'),
      errorLibro: document.getElementById('error-venta-libro'),
      errorCantidad: document.getElementById('error-venta-cantidad'),

      // Tabla y resumen de la orden
      tableBody: document.getElementById('tabla-venta-renglones-body'),
      emptyState: document.getElementById('venta-renglones-empty'),
      resumenItems: document.getElementById('resumen-total-items'),
      resumenMonto: document.getElementById('resumen-total-monto'),

      // Acciones
      btnVaciar: document.getElementById('btn-vaciar-carrito'),
      btnConfirmar: document.getElementById('btn-confirmar-venta')
    };

    this.populateClientesSelector();
    this.populateLibrosSelector();
    this.bindEvents();
    this.renderRenglones();
  },

  populateClientesSelector() {
    const clientes = StorageService.getClientes();
    const valorSeleccionado = this.elements.selectCliente.value;

    this.elements.selectCliente.replaceChildren();
    const optDefault = document.createElement('option');
    optDefault.value = '';
    optDefault.textContent = '-- Elige un cliente registrado --';
    this.elements.selectCliente.appendChild(optDefault);

    clientes.forEach(cli => {
      const opt = document.createElement('option');
      opt.value = cli.id;
      opt.textContent = `${cli.nombre} (${cli.email})`;
      this.elements.selectCliente.appendChild(opt);
    });

    if (valorSeleccionado) {
      this.elements.selectCliente.value = valorSeleccionado;
    }
  },

  populateLibrosSelector() {
    const libros = StorageService.getLibros();
    const valorSeleccionado = this.elements.selectLibro.value;

    this.elements.selectLibro.replaceChildren();
    const optDefault = document.createElement('option');
    optDefault.value = '';
    optDefault.textContent = '-- Seleccionar libro --';
    this.elements.selectLibro.appendChild(optDefault);

    libros.forEach(libro => {
      const opt = document.createElement('option');
      opt.value = libro.id;
      opt.textContent = `${libro.titulo} - $${Number(libro.precio).toFixed(2)}`;
      this.elements.selectLibro.appendChild(opt);
    });

    if (valorSeleccionado) {
      this.elements.selectLibro.value = valorSeleccionado;
    }
  },

  bindEvents() {
    // Cambio en el selector de libros para informar precio
    this.elements.selectLibro.addEventListener('change', () => {
      const libroId = this.elements.selectLibro.value;
      if (libroId) {
        const libro = StorageService.getLibroById(libroId);
        if (libro) {
          this.elements.libroInfo.textContent = `Precio unitario actual: $${Number(libro.precio).toFixed(2)}`;
        }
      } else {
        this.elements.libroInfo.textContent = 'Elige un libro para visualizar su precio actual.';
      }
    });

    // Agregar renglón
    this.elements.formRenglon.addEventListener('submit', (e) => {
      e.preventDefault();
      this.agregarRenglon();
    });

    // Vaciar borrador
    this.elements.btnVaciar.addEventListener('click', () => {
      if (this.borradorRenglones.length === 0) return;
      this.borradorRenglones = [];
      this.renderRenglones();
      this.mostrarFeedback('Se han quitado todos los renglones de la orden actual.', false);
    });

    // Confirmar venta
    this.elements.btnConfirmar.addEventListener('click', () => {
      this.confirmarVenta();
    });
  },

  limpiarErrores() {
    this.elements.errorCliente.textContent = '';
    this.elements.errorLibro.textContent = '';
    this.elements.errorCantidad.textContent = '';
    this.elements.selectCliente.classList.remove('has-error');
    this.elements.selectLibro.classList.remove('has-error');
    this.elements.inputCantidad.classList.remove('has-error');
  },

  mostrarFeedback(mensaje, esError = false) {
    this.elements.feedback.hidden = false;
    this.elements.feedback.className = `form-feedback ${esError ? 'is-error' : 'is-success'}`;
    this.elements.feedback.textContent = mensaje;
  },

  ocultarFeedback() {
    this.elements.feedback.hidden = true;
    this.elements.feedback.className = 'form-feedback';
    this.elements.feedback.textContent = '';
  },

  agregarRenglon() {
    this.limpiarErrores();
    this.ocultarFeedback();

    const libroId = this.elements.selectLibro.value;
    const cantidadStr = this.elements.inputCantidad.value.trim();
    const cantidadNum = Number(cantidadStr);

    let esValido = true;

    if (!libroId) {
      this.elements.errorLibro.textContent = 'Debes seleccionar un libro.';
      this.elements.selectLibro.classList.add('has-error');
      esValido = false;
    }

    if (!cantidadStr || !Number.isInteger(cantidadNum) || cantidadNum <= 0) {
      this.elements.errorCantidad.textContent = 'La cantidad debe ser un número entero mayor que cero.';
      this.elements.inputCantidad.classList.add('has-error');
      esValido = false;
    }

    if (!esValido) return;

    const libro = StorageService.getLibroById(libroId);
    if (!libro) {
      this.elements.errorLibro.textContent = 'El libro seleccionado no existe en el catálogo.';
      return;
    }

    // Regla: No se admiten libros repetidos; se incrementa la cantidad en el renglón existente
    const indexExistente = this.borradorRenglones.findIndex(r => r.libroId === libroId);

    if (indexExistente !== -1) {
      this.borradorRenglones[indexExistente].cantidad += cantidadNum;
      this.borradorRenglones[indexExistente].subtotal = Number(
        (this.borradorRenglones[indexExistente].cantidad * this.borradorRenglones[indexExistente].precioUnitario).toFixed(2)
      );
      this.mostrarFeedback(
        `El libro "${libro.titulo}" ya estaba en la orden. Se actualizaron sus unidades a ${this.borradorRenglones[indexExistente].cantidad}.`,
        false
      );
    } else {
      const subtotal = Number((cantidadNum * Number(libro.precio)).toFixed(2));
      this.borradorRenglones.push({
        libroId: libro.id,
        titulo: libro.titulo,
        isbn: libro.isbn,
        precioUnitario: Number(libro.precio), // Precio unitario actual que se congelará
        cantidad: cantidadNum,
        subtotal: subtotal
      });
      this.mostrarFeedback(`✓ "${libro.titulo}" agregado al detalle de la venta.`, false);
    }

    // Restablecer inputs de agregar renglón
    this.elements.selectLibro.value = '';
    this.elements.inputCantidad.value = '1';
    this.elements.libroInfo.textContent = 'Elige un libro para visualizar su precio actual.';

    this.renderRenglones();
  },

  modificarCantidad(libroId, nuevaCantidad) {
    const cant = Number(nuevaCantidad);
    if (!Number.isInteger(cant) || cant <= 0) {
      this.mostrarFeedback('La cantidad debe ser un entero mayor a cero.', true);
      this.renderRenglones();
      return;
    }

    const renglon = this.borradorRenglones.find(r => r.libroId === libroId);
    if (renglon) {
      renglon.cantidad = cant;
      renglon.subtotal = Number((cant * renglon.precioUnitario).toFixed(2));
      this.renderRenglones();
    }
  },

  quitarRenglon(libroId) {
    this.borradorRenglones = this.borradorRenglones.filter(r => r.libroId !== libroId);
    this.mostrarFeedback('Renglón eliminado de la orden actual.', false);
    this.renderRenglones();
  },

  renderRenglones() {
    this.elements.tableBody.replaceChildren();

    if (this.borradorRenglones.length === 0) {
      this.elements.emptyState.hidden = false;
      this.elements.resumenItems.textContent = '0';
      this.elements.resumenMonto.textContent = '$0.00';
      return;
    }

    this.elements.emptyState.hidden = true;

    let totalItems = 0;
    let totalMonto = 0;

    this.borradorRenglones.forEach(r => {
      totalItems += r.cantidad;
      totalMonto += r.subtotal;

      const tr = document.createElement('tr');

      // Título de libro
      const tdLibro = document.createElement('td');
      tdLibro.textContent = r.titulo;
      tdLibro.className = 'font-bold';

      // Cantidad editable
      const tdCant = document.createElement('td');
      tdCant.className = 'text-center';

      const qtyWrapper = document.createElement('div');
      qtyWrapper.className = 'table-qty-control';

      const inputQty = document.createElement('input');
      inputQty.type = 'number';
      inputQty.className = 'input-table-qty';
      inputQty.min = '1';
      inputQty.step = '1';
      inputQty.value = r.cantidad;
      inputQty.setAttribute('aria-label', `Modificar cantidad de ${r.titulo}`);

      inputQty.addEventListener('change', () => {
        this.modificarCantidad(r.libroId, inputQty.value);
      });

      qtyWrapper.appendChild(inputQty);
      tdCant.appendChild(qtyWrapper);

      // Precio unitario
      const tdPrecio = document.createElement('td');
      tdPrecio.className = 'text-right';
      tdPrecio.textContent = `$${r.precioUnitario.toFixed(2)}`;

      // Subtotal
      const tdSubtotal = document.createElement('td');
      tdSubtotal.className = 'text-right font-bold';
      tdSubtotal.textContent = `$${r.subtotal.toFixed(2)}`;

      // Botón Quitar
      const tdAccion = document.createElement('td');
      tdAccion.className = 'text-center';

      const btnQuitar = document.createElement('button');
      btnQuitar.type = 'button';
      btnQuitar.className = 'btn btn-outline-danger btn-sm';
      btnQuitar.textContent = 'Quitar';
      btnQuitar.setAttribute('aria-label', `Quitar ${r.titulo} de la venta`);

      btnQuitar.addEventListener('click', () => {
        this.quitarRenglon(r.libroId);
      });

      tdAccion.appendChild(btnQuitar);

      tr.appendChild(tdLibro);
      tr.appendChild(tdCant);
      tr.appendChild(tdPrecio);
      tr.appendChild(tdSubtotal);
      tr.appendChild(tdAccion);

      this.elements.tableBody.appendChild(tr);
    });

    this.elements.resumenItems.textContent = String(totalItems);
    this.elements.resumenMonto.textContent = `$${totalMonto.toFixed(2)}`;
  },

  confirmarVenta() {
    this.limpiarErrores();
    this.ocultarFeedback();

    const clienteId = this.elements.selectCliente.value;
    let esValido = true;

    // Regla: Se impide confirmar sin cliente
    if (!clienteId) {
      this.elements.errorCliente.textContent = 'Debes seleccionar un cliente para emitir la venta.';
      this.elements.selectCliente.classList.add('has-error');
      esValido = false;
    }

    const cliente = StorageService.getClienteById(clienteId);
    if (clienteId && !cliente) {
      this.elements.errorCliente.textContent = 'El cliente seleccionado no es válido.';
      this.elements.selectCliente.classList.add('has-error');
      esValido = false;
    }

    // Regla: Se impide confirmar sin renglones
    if (this.borradorRenglones.length === 0) {
      this.mostrarFeedback('No se puede confirmar la venta: debes agregar al menos un libro a la orden.', true);
      esValido = false;
    }

    // Regla: Se comprueba que todas las cantidades sean válidas (enteras > 0)
    const tieneCantidadesInvalidas = this.borradorRenglones.some(
      r => !Number.isInteger(r.cantidad) || r.cantidad <= 0
    );
    if (tieneCantidadesInvalidas) {
      this.mostrarFeedback('Hay cantidades inválidas en la orden. Corrige los valores.', true);
      esValido = false;
    }

    if (!esValido) return;

    // Calcular total final como suma de subtotales
    const totalVenta = Number(
      this.borradorRenglones.reduce((acc, curr) => acc + curr.subtotal, 0).toFixed(2)
    );

    // Formatear fecha legible y timestamp
    const now = new Date();
    const fechaFormateada = now.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Copiar y congelar datos históricos inmutables
    const renglonesCongelados = this.borradorRenglones.map(r => ({
      libroId: r.libroId,
      titulo: r.titulo,
      isbn: r.isbn,
      precioUnitarioHistorico: Number(r.precioUnitario.toFixed(2)), // Valor histórico congelado
      cantidad: r.cantidad,
      subtotalHistorico: Number((r.cantidad * r.precioUnitario).toFixed(2))
    }));

    const ventaId = `VNT-${Date.now()}`;

    const nuevaVenta = {
      id: ventaId,
      fecha: fechaFormateada,
      timestamp: now.getTime(),
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        email: cliente.email
      },
      renglones: renglonesCongelados,
      total: totalVenta
    };

    // Persistir venta
    StorageService.saveVenta(nuevaVenta);

    // Limpiar formulario y orden para una nueva venta
    this.borradorRenglones = [];
    this.elements.selectCliente.value = '';
    this.renderRenglones();

    // Mensaje de éxito
    this.mostrarFeedback(
      `✓ Venta #${nuevaVenta.id} confirmada exitosamente por un total de $${totalVenta.toFixed(2)}. Registrada en el historial.`,
      false
    );

    // Actualizar vista de historial si está disponible
    if (window.HistorialModule) {
      window.HistorialModule.render();
    }
  }
};

