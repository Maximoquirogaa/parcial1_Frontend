/**
 * CLIENTES.JS - Alta y listado de clientes
 * Cumple Ejercicio 4:
 * - Registra nombre completo y email (sin campo de apellido separado).
 * - Validación: nombre y email no vacíos.
 * - Validación: formato de email válido.
 * - Validación: email único (comparado sin espacios en extremos y sin distinguir mayúsculas de minúsculas).
 * - Envío controlado con preventDefault(), errores visibles cerca del formulario.
 * - Actualización reactiva sin recargar la página.
 */

const ClientesModule = {
  elements: {},

  init() {
    this.elements = {
      form: document.getElementById('form-cliente'),
      inputNombre: document.getElementById('cliente-nombre'),
      inputEmail: document.getElementById('cliente-email'),
      feedback: document.getElementById('form-cliente-feedback'),
      btnReset: document.getElementById('btn-reset-cliente'),

      // Errores específicos
      errorNombre: document.getElementById('error-cliente-nombre'),
      errorEmail: document.getElementById('error-cliente-email'),

      // Tabla y estado
      tableBody: document.getElementById('tabla-clientes-body'),
      badgeTotal: document.getElementById('badge-total-clientes'),
      emptyState: document.getElementById('tabla-clientes-empty')
    };

    this.bindEvents();
    this.renderTabla();
  },

  bindEvents() {
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    this.elements.btnReset.addEventListener('click', () => {
      this.limpiarErrores();
      this.ocultarFeedback();
    });
  },

  limpiarErrores() {
    if (this.elements.errorNombre) this.elements.errorNombre.textContent = '';
    if (this.elements.errorEmail) this.elements.errorEmail.textContent = '';

    this.elements.inputNombre.classList.remove('has-error');
    this.elements.inputEmail.classList.remove('has-error');
  },

  ocultarFeedback() {
    this.elements.feedback.hidden = true;
    this.elements.feedback.className = 'form-feedback';
    this.elements.feedback.textContent = '';
  },

  mostrarFeedback(mensaje, esError = false) {
    this.elements.feedback.hidden = false;
    this.elements.feedback.className = `form-feedback ${esError ? 'is-error' : 'is-success'}`;
    this.elements.feedback.textContent = mensaje;
  },

  validarFormatoEmail(email) {
    // Expresión regular estándar y robusta para formato de email
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
    return re.test(email);
  },

  handleSubmit() {
    this.limpiarErrores();
    this.ocultarFeedback();

    const nombre = this.elements.inputNombre.value.trim();
    const emailRaw = this.elements.inputEmail.value;
    const emailNormalizado = StorageService.normalizarEmail(emailRaw);

    let esValido = true;

    // Validación 1: Nombre no vacío
    if (!nombre) {
      this.elements.errorNombre.textContent = 'El nombre completo del cliente es obligatorio.';
      this.elements.inputNombre.classList.add('has-error');
      esValido = false;
    }

    // Validación 2: Email no vacío
    if (!emailRaw.trim()) {
      this.elements.errorEmail.textContent = 'La dirección de correo electrónico es obligatoria.';
      this.elements.inputEmail.classList.add('has-error');
      esValido = false;
    } else if (!this.validarFormatoEmail(emailNormalizado)) {
      // Validación 3: Formato de email
      this.elements.errorEmail.textContent = 'El formato del correo electrónico ingresado no es válido.';
      this.elements.inputEmail.classList.add('has-error');
      esValido = false;
    } else {
      // Validación 4: Email único (sin espacios y sin distinguir mayúsculas/minúsculas)
      const clientesExistentes = StorageService.getClientes();
      const emailDuplicado = clientesExistentes.some(c => StorageService.normalizarEmail(c.email) === emailNormalizado);
      if (emailDuplicado) {
        this.elements.errorEmail.textContent = 'Ya existe un cliente registrado con esa dirección de correo electrónico.';
        this.elements.inputEmail.classList.add('has-error');
        esValido = false;
      }
    }

    if (!esValido) {
      this.mostrarFeedback('Por favor corrige los datos del cliente indicados en el formulario.', true);
      return;
    }

    // Crear nuevo cliente
    const nuevoCliente = {
      id: `CLI-${Date.now()}`,
      nombre,
      email: emailNormalizado
    };

    StorageService.saveCliente(nuevoCliente);

    // Feedback de éxito
    this.mostrarFeedback(`✓ Cliente "${nombre}" registrado con éxito.`, false);
    this.elements.form.reset();

    // Actualizar interfaces
    this.renderTabla();
    if (window.VentasModule) {
      window.VentasModule.populateClientesSelector();
    }
  },

  /**
   * Renderiza la tabla de clientes de forma segura
   */
  renderTabla() {
    const clientes = StorageService.getClientes();
    this.elements.badgeTotal.textContent = `${clientes.length} cliente${clientes.length === 1 ? '' : 's'}`;
    this.elements.tableBody.replaceChildren();

    if (clientes.length === 0) {
      this.elements.emptyState.hidden = false;
      return;
    }

    this.elements.emptyState.hidden = true;

    clientes.forEach(cliente => {
      const tr = document.createElement('tr');

      const tdId = document.createElement('td');
      tdId.textContent = cliente.id;
      tdId.style.fontFamily = 'var(--font-mono)';
      tdId.style.fontSize = '0.85rem';

      const tdNombre = document.createElement('td');
      tdNombre.textContent = cliente.nombre;
      tdNombre.className = 'font-bold';

      const tdEmail = document.createElement('td');
      tdEmail.textContent = cliente.email;

      tr.appendChild(tdId);
      tr.appendChild(tdNombre);
      tr.appendChild(tdEmail);

      this.elements.tableBody.appendChild(tr);
    });
  }
};

