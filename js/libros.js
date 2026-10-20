/**
 * LIBROS.JS - Alta y listado de inventario de libros
 * Cumple Ejercicio 4:
 * - Formulario con título, ISBN, precio, editorial, género («Sin clasificar») y autores.
 * - Validación: título e ISBN no vacíos, ISBN único sin guiones ni espacios.
 * - Precio numérico > 0.
 * - Editorial existente en datos locales.
 * - Al menos un autor seleccionado, existentes en datos locales.
 * - Género opcional (si se indica, debe existir).
 * - Control de envío con preventDefault(), errores visibles cerca del formulario.
 * - Actualización reactiva sin recargar la página.
 */

const LibrosModule = {
  elements: {},

  init() {
    this.elements = {
      form: document.getElementById('form-libro'),
      inputTitulo: document.getElementById('libro-titulo'),
      inputIsbn: document.getElementById('libro-isbn'),
      inputPrecio: document.getElementById('libro-precio'),
      selectEditorial: document.getElementById('libro-editorial'),
      selectGenero: document.getElementById('libro-genero'),
      autoresContainer: document.getElementById('libro-autores-container'),
      feedback: document.getElementById('form-libro-feedback'),
      btnReset: document.getElementById('btn-reset-libro'),

      // Errores individuales
      errorTitulo: document.getElementById('error-libro-titulo'),
      errorIsbn: document.getElementById('error-libro-isbn'),
      errorPrecio: document.getElementById('error-libro-precio'),
      errorEditorial: document.getElementById('error-libro-editorial'),
      errorGenero: document.getElementById('error-libro-genero'),
      errorAutores: document.getElementById('error-libro-autores'),

      // Tabla y estado
      tableBody: document.getElementById('tabla-libros-body'),
      badgeTotal: document.getElementById('badge-total-libros'),
      emptyState: document.getElementById('tabla-libros-empty')
    };

    this.populateSelectors();
    this.bindEvents();
    this.renderTabla();
  },

  populateSelectors() {
    // 1. Editoriales
    const editoriales = StorageService.getEditoriales();
    this.elements.selectEditorial.replaceChildren();
    const optEdDefault = document.createElement('option');
    optEdDefault.value = '';
    optEdDefault.textContent = '-- Seleccionar editorial --';
    this.elements.selectEditorial.appendChild(optEdDefault);

    editoriales.forEach(ed => {
      const opt = document.createElement('option');
      opt.value = ed.id;
      opt.textContent = ed.nombre;
      this.elements.selectEditorial.appendChild(opt);
    });

    // 2. Géneros (incluye «Sin clasificar»)
    const generos = StorageService.getGeneros();
    this.elements.selectGenero.replaceChildren();
    const optGenDefault = document.createElement('option');
    optGenDefault.value = '';
    optGenDefault.textContent = '«Sin clasificar»';
    this.elements.selectGenero.appendChild(optGenDefault);

    generos.forEach(gen => {
      const opt = document.createElement('option');
      opt.value = gen.id;
      opt.textContent = gen.nombre;
      this.elements.selectGenero.appendChild(opt);
    });

    // 3. Autores (Checkboxes accesibles para selección múltiple)
    const autores = StorageService.getAutores();
    this.elements.autoresContainer.replaceChildren();

    autores.forEach(autor => {
      const label = document.createElement('label');
      label.className = 'checkbox-item';

      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.name = 'autores';
      chk.value = autor.id;
      chk.id = `chk-autor-${autor.id}`;

      const spanText = document.createElement('span');
      spanText.textContent = autor.nombre;

      label.appendChild(chk);
      label.appendChild(spanText);
      this.elements.autoresContainer.appendChild(label);
    });
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
    const errorSpans = [
      this.elements.errorTitulo,
      this.elements.errorIsbn,
      this.elements.errorPrecio,
      this.elements.errorEditorial,
      this.elements.errorGenero,
      this.elements.errorAutores
    ];
    errorSpans.forEach(span => {
      if (span) span.textContent = '';
    });

    const inputs = [
      this.elements.inputTitulo,
      this.elements.inputIsbn,
      this.elements.inputPrecio,
      this.elements.selectEditorial,
      this.elements.selectGenero
    ];
    inputs.forEach(input => {
      if (input) input.classList.remove('has-error');
    });
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

  handleSubmit() {
    this.limpiarErrores();
    this.ocultarFeedback();

    const titulo = this.elements.inputTitulo.value.trim();
    const isbn = this.elements.inputIsbn.value.trim();
    const precioStr = this.elements.inputPrecio.value.trim();
    const editorialId = this.elements.selectEditorial.value;
    const generoId = this.elements.selectGenero.value || null;

    // Obtener autores seleccionados
    const checkboxes = this.elements.autoresContainer.querySelectorAll('input[type="checkbox"]:checked');
    const autoresIds = Array.from(checkboxes).map(c => c.value);

    let esValido = true;

    // Validación 1: Título no vacío
    if (!titulo) {
      this.elements.errorTitulo.textContent = 'El título de la obra es obligatorio.';
      this.elements.inputTitulo.classList.add('has-error');
      esValido = false;
    }

    // Validación 2: ISBN no vacío y no duplicado (comparado sin guiones ni espacios)
    if (!isbn) {
      this.elements.errorIsbn.textContent = 'El código ISBN es obligatorio.';
      this.elements.inputIsbn.classList.add('has-error');
      esValido = false;
    } else {
      const isbnNormalizado = StorageService.normalizarIsbn(isbn);
      if (isbnNormalizado.length === 0) {
        this.elements.errorIsbn.textContent = 'El formato de ISBN no contiene caracteres válidos.';
        this.elements.inputIsbn.classList.add('has-error');
        esValido = false;
      } else {
        const librosExistentes = StorageService.getLibros();
        const isbnDuplicado = librosExistentes.some(l => StorageService.normalizarIsbn(l.isbn) === isbnNormalizado);
        if (isbnDuplicado) {
          this.elements.errorIsbn.textContent = 'El ISBN ingresado ya se encuentra registrado en el sistema.';
          this.elements.inputIsbn.classList.add('has-error');
          esValido = false;
        }
      }
    }

    // Validación 3: Precio numérico mayor a cero
    const precioNum = Number(precioStr);
    if (!precioStr || isNaN(precioNum) || precioNum <= 0) {
      this.elements.errorPrecio.textContent = 'El precio debe ser un número positivo mayor que cero.';
      this.elements.inputPrecio.classList.add('has-error');
      esValido = false;
    }

    // Validación 4: Editorial seleccionada y existente
    if (!editorialId || !StorageService.getEditorialById(editorialId)) {
      this.elements.errorEditorial.textContent = 'Debes seleccionar una editorial válida de la lista.';
      this.elements.selectEditorial.classList.add('has-error');
      esValido = false;
    }

    // Validación 5: Género (opcional, pero si se asigna debe existir)
    if (generoId && !StorageService.getGeneroById(generoId)) {
      this.elements.errorGenero.textContent = 'El género seleccionado no es válido.';
      this.elements.selectGenero.classList.add('has-error');
      esValido = false;
    }

    // Validación 6: Autores (al menos uno seleccionado y existentes)
    if (autoresIds.length === 0) {
      this.elements.errorAutores.textContent = 'Debes marcar al menos un autor para la obra.';
      esValido = false;
    } else {
      const autoresValidos = autoresIds.every(id => StorageService.getAutorById(id) !== null);
      if (!autoresValidos) {
        this.elements.errorAutores.textContent = 'Uno o más autores seleccionados no son válidos.';
        esValido = false;
      }
    }

    if (!esValido) {
      this.mostrarFeedback('Por favor revisa y corrige los campos señalados antes de continuar.', true);
      return;
    }

    // Crear y persistir nuevo libro
    const nuevoLibro = {
      id: `LIB-${Date.now()}`,
      titulo,
      isbn,
      precio: parseFloat(precioNum.toFixed(2)),
      editorialId,
      generoId,
      autoresIds
    };

    StorageService.saveLibro(nuevoLibro);

    // Feedback de éxito
    this.mostrarFeedback(`✓ Libro "${titulo}" registrado exitosamente en el catálogo.`, false);
    this.elements.form.reset();

    // Actualizar interfaces relacionadas sin recargar página
    this.renderTabla();
    if (window.CatalogoModule) {
      window.CatalogoModule.render();
    }
    if (window.VentasModule) {
      window.VentasModule.populateLibrosSelector();
    }
  },

  /**
   * Renderiza la tabla de inventario de libros con inserción segura.
   */
  renderTabla() {
    const libros = StorageService.getLibros();
    this.elements.badgeTotal.textContent = `${libros.length} libro${libros.length === 1 ? '' : 's'}`;
    this.elements.tableBody.replaceChildren();

    if (libros.length === 0) {
      this.elements.emptyState.hidden = false;
      return;
    }

    this.elements.emptyState.hidden = true;

    libros.forEach(libro => {
      const tr = document.createElement('tr');

      // Título
      const tdTitulo = document.createElement('td');
      tdTitulo.textContent = libro.titulo;
      tdTitulo.className = 'font-bold';

      // ISBN
      const tdIsbn = document.createElement('td');
      tdIsbn.textContent = libro.isbn;

      // Editorial
      const ed = StorageService.getEditorialById(libro.editorialId);
      const tdEd = document.createElement('td');
      tdEd.textContent = ed ? ed.nombre : 'No asignada';

      // Género
      const gen = libro.generoId ? StorageService.getGeneroById(libro.generoId) : null;
      const tdGen = document.createElement('td');
      tdGen.textContent = gen ? gen.nombre : '«Sin clasificar»';
      if (!gen) {
        tdGen.style.fontStyle = 'italic';
      }

      // Autores
      const autores = StorageService.getAutoresByIds(libro.autoresIds || []);
      const tdAutores = document.createElement('td');
      tdAutores.textContent = autores.map(a => a.nombre).join(', ') || 'No asignado';

      // Precio
      const tdPrecio = document.createElement('td');
      tdPrecio.className = 'text-right font-bold';
      tdPrecio.textContent = `$${Number(libro.precio).toFixed(2)}`;

      tr.appendChild(tdTitulo);
      tr.appendChild(tdIsbn);
      tr.appendChild(tdEd);
      tr.appendChild(tdGen);
      tr.appendChild(tdAutores);
      tr.appendChild(tdPrecio);

      this.elements.tableBody.appendChild(tr);
    });
  }
};

