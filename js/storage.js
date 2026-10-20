/**
 * STORAGE.JS - Capa de persistencia con localStorage y resolución de entidades
 * Cumple Ejercicio 6:
 * - Conserva libros, clientes y ventas en localStorage.
 * - En el primer inicio carga las semillas; al volver a abrir recupera los registros sin duplicar.
 * - Permite la verificación de precio histórico modificando únicamente el catálogo en localStorage.
 */

const STORAGE_KEYS = {
  LIBROS: 'libreria_borgona_libros_v1',
  CLIENTES: 'libreria_borgona_clientes_v1',
  VENTAS: 'libreria_borgona_ventas_v1'
};

const StorageService = {
  /**
   * Inicializa el almacenamiento cargando las semillas si es el primer arranque.
   */
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.LIBROS)) {
      localStorage.setItem(STORAGE_KEYS.LIBROS, JSON.stringify(INITIAL_LIBROS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTES)) {
      localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(INITIAL_CLIENTES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VENTAS)) {
      localStorage.setItem(STORAGE_KEYS.VENTAS, JSON.stringify([]));
    }
  },

  // --------------------------------------------------------------------------
  // Libros
  // --------------------------------------------------------------------------
  getLibros() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIBROS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al leer libros de localStorage:', e);
      return [];
    }
  },

  saveLibro(nuevoLibro) {
    const libros = this.getLibros();
    libros.push(nuevoLibro);
    localStorage.setItem(STORAGE_KEYS.LIBROS, JSON.stringify(libros));
    return nuevoLibro;
  },

  getLibroById(id) {
    return this.getLibros().find(l => l.id === id) || null;
  },

  // --------------------------------------------------------------------------
  // Clientes
  // --------------------------------------------------------------------------
  getClientes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLIENTES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al leer clientes de localStorage:', e);
      return [];
    }
  },

  saveCliente(nuevoCliente) {
    const clientes = this.getClientes();
    clientes.push(nuevoCliente);
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
    return nuevoCliente;
  },

  getClienteById(id) {
    return this.getClientes().find(c => c.id === id) || null;
  },

  // --------------------------------------------------------------------------
  // Ventas (Historial Inmutable)
  // --------------------------------------------------------------------------
  getVentas() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VENTAS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al leer ventas de localStorage:', e);
      return [];
    }
  },

  saveVenta(nuevaVenta) {
    const ventas = this.getVentas();
    ventas.push(nuevaVenta);
    localStorage.setItem(STORAGE_KEYS.VENTAS, JSON.stringify(ventas));
    return nuevaVenta;
  },

  getVentaById(id) {
    return this.getVentas().find(v => v.id === id) || null;
  },

  // --------------------------------------------------------------------------
  // Entidades estáticas (Editoriales, Géneros, Autores)
  // --------------------------------------------------------------------------
  getEditoriales() {
    return INITIAL_EDITORIALES;
  },

  getEditorialById(id) {
    return INITIAL_EDITORIALES.find(e => e.id === id) || null;
  },

  getGeneros() {
    return INITIAL_GENEROS;
  },

  getGeneroById(id) {
    return INITIAL_GENEROS.find(g => g.id === id) || null;
  },

  getAutores() {
    return INITIAL_AUTORES;
  },

  getAutorById(id) {
    return INITIAL_AUTORES.find(a => a.id === id) || null;
  },

  getAutoresByIds(idsArray) {
    if (!Array.isArray(idsArray)) return [];
    return idsArray
      .map(id => this.getAutorById(id))
      .filter(autor => autor !== null);
  },

  // --------------------------------------------------------------------------
  // Normalizaciones y utilidades de unicidad
  // --------------------------------------------------------------------------
  /**
   * Normaliza ISBN eliminando guiones y espacios para comprobación de duplicados.
   */
  normalizarIsbn(isbn) {
    if (typeof isbn !== 'string') return '';
    return isbn.replace(/[-\s]/g, '').trim().toUpperCase();
  },

  /**
   * Normaliza email eliminando espacios en extremos y convirtiendo a minúsculas.
   */
  normalizarEmail(email) {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase();
  }
};

