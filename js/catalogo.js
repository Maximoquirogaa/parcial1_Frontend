/**
 * CATALOGO.JS - Renderizado y filtrado dinámico del catálogo de libros
 * Cumple Ejercicio 3:
 * - Genera el catálogo a partir del array de libros.
 * - Cada libro muestra título, ISBN, editorial, género («Sin clasificar» si es nulo), autores y precio.
 * - Filtro insensible a mayúsculas/minúsculas, con coincidencias parciales y trim().
 * - Búsqueda vacía muestra todo; sin coincidencias muestra mensaje claro.
 * - Inserción segura de datos como texto en el DOM para evitar XSS.
 */

const CatalogoModule = {
  elements: {},

  init() {
    this.elements = {
      list: document.getElementById('catalogo-list'),
      emptyState: document.getElementById('catalogo-empty'),
      formSearch: document.getElementById('form-search'),
      inputSearch: document.getElementById('search-input'),
      btnClear: document.getElementById('btn-search-clear'),
      btnReset: document.getElementById('btn-empty-reset'),
      status: document.getElementById('search-status')
    };

    this.bindEvents();
    this.render();
  },

  bindEvents() {
    // Envío del formulario de búsqueda
    this.elements.formSearch.addEventListener('submit', (e) => {
      e.preventDefault();
      this.aplicarFiltro();
    });

    // Búsqueda reactiva mientras se escribe (opcional y complementaria al botón submit)
    this.elements.inputSearch.addEventListener('input', () => {
      this.aplicarFiltro();
    });

    // Botones para limpiar filtro y restaurar
    this.elements.btnClear.addEventListener('click', () => {
      this.limpiarFiltro();
    });

    this.elements.btnReset.addEventListener('click', () => {
      this.limpiarFiltro();
    });
  },

  aplicarFiltro() {
    const query = this.elements.inputSearch.value;
    this.render(query);
  },

  limpiarFiltro() {
    this.elements.inputSearch.value = '';
    this.render('');
    this.elements.inputSearch.focus();
  },

  /**
   * Renderiza el catálogo según el término de búsqueda.
   * Inserta todo dato de usuario mediante textContent para seguridad total.
   */
  render(searchTerm = '') {
    const todosLosLibros = StorageService.getLibros();
    const query = searchTerm.trim().toLowerCase();

    // Filtro por título insensible a mayúsculas y espacios en extremos
    let librosFiltrados = todosLosLibros;
    if (query.length > 0) {
      librosFiltrados = todosLosLibros.filter(libro => {
        return libro.titulo && libro.titulo.toLowerCase().includes(query);
      });
      this.elements.status.textContent = `Mostrando ${librosFiltrados.length} resultado(s) para "${searchTerm.trim()}".`;
    } else {
      this.elements.status.textContent = '';
    }

    // Limpiar contenedor de forma segura
    this.elements.list.replaceChildren();

    // Manejo de estado vacío (sin coincidencias o sin libros)
    if (librosFiltrados.length === 0) {
      this.elements.emptyState.hidden = false;
      return;
    }

    this.elements.emptyState.hidden = true;

    // Crear tarjetas usando la API del DOM nativa (evita innerHTML con datos no sanitizados)
    librosFiltrados.forEach(libro => {
      const card = this.crearTarjetaLibro(libro);
      this.elements.list.appendChild(card);
    });
  },

  /**
   * Construye el nodo DOM de una tarjeta de libro.
   */
  crearTarjetaLibro(libro) {
    const article = document.createElement('article');
    article.className = 'book-card';
    article.setAttribute('aria-labelledby', `libro-card-title-${libro.id}`);

    // Encabezado
    const header = document.createElement('header');
    header.className = 'book-card-header';

    const title = document.createElement('h3');
    title.id = `libro-card-title-${libro.id}`;
    title.className = 'book-card-title';
    title.textContent = libro.titulo;

    const generoObj = libro.generoId ? StorageService.getGeneroById(libro.generoId) : null;
    const badgeGenero = document.createElement('span');
    badgeGenero.className = 'book-badge-genre';
    if (generoObj) {
      badgeGenero.textContent = generoObj.nombre;
    } else {
      badgeGenero.textContent = '«Sin clasificar»';
      badgeGenero.classList.add('is-unclassified');
    }

    header.appendChild(title);
    header.appendChild(badgeGenero);

    // Cuerpo con metadata
    const body = document.createElement('div');
    body.className = 'book-card-body';

    // ISBN
    const pIsbn = document.createElement('p');
    pIsbn.className = 'book-meta-item';
    const labelIsbn = document.createElement('span');
    labelIsbn.className = 'book-meta-label';
    labelIsbn.textContent = 'ISBN: ';
    const valIsbn = document.createElement('span');
    valIsbn.textContent = libro.isbn;
    pIsbn.appendChild(labelIsbn);
    pIsbn.appendChild(valIsbn);

    // Editorial
    const editorialObj = StorageService.getEditorialById(libro.editorialId);
    const pEd = document.createElement('p');
    pEd.className = 'book-meta-item';
    const labelEd = document.createElement('span');
    labelEd.className = 'book-meta-label';
    labelEd.textContent = 'Editorial: ';
    const valEd = document.createElement('span');
    valEd.textContent = editorialObj ? editorialObj.nombre : 'No asignada';
    pEd.appendChild(labelEd);
    pEd.appendChild(valEd);

    // Autores (uno o más)
    const autoresObjs = StorageService.getAutoresByIds(libro.autoresIds || []);
    const nombresAutores = autoresObjs.map(a => a.nombre).join(', ') || 'No asignado';
    const pAutores = document.createElement('p');
    pAutores.className = 'book-meta-item';
    const labelAutores = document.createElement('span');
    labelAutores.className = 'book-meta-label';
    labelAutores.textContent = autoresObjs.length > 1 ? 'Autores: ' : 'Autor: ';
    const valAutores = document.createElement('span');
    valAutores.textContent = nombresAutores;
    pAutores.appendChild(labelAutores);
    pAutores.appendChild(valAutores);

    body.appendChild(pIsbn);
    body.appendChild(pEd);
    body.appendChild(pAutores);

    // Pie de tarjeta con precio
    const footer = document.createElement('footer');
    footer.className = 'book-card-footer';

    const labelPrecio = document.createElement('span');
    labelPrecio.className = 'book-price-label';
    labelPrecio.textContent = 'Precio unitario:';

    const valPrecio = document.createElement('span');
    valPrecio.className = 'book-price-amount';
    valPrecio.textContent = `$${Number(libro.precio).toFixed(2)}`;

    footer.appendChild(labelPrecio);
    footer.appendChild(valPrecio);

    // Componer artículo completo
    article.appendChild(header);
    article.appendChild(body);
    article.appendChild(footer);

    return article;
  }
};

