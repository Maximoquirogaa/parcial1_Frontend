/**
 * APP.JS - Orquestador general del sistema, navegación SPA y alertas
 * Integra los ejercicios 1 a 6 de la evaluación parcial.
 */

const App = {
  views: ['catalogo', 'libros', 'clientes', 'ventas', 'historial'],
  currentView: 'catalogo',

  init() {
    // 1. Inicializar almacenamiento persistente
    StorageService.init();

    // 2. Exponer módulos globalmente para sincronización de interfaces
    window.CatalogoModule = CatalogoModule;
    window.LibrosModule = LibrosModule;
    window.ClientesModule = ClientesModule;
    window.VentasModule = VentasModule;
    window.HistorialModule = HistorialModule;

    // 3. Inicializar módulos funcionales
    CatalogoModule.init();
    LibrosModule.init();
    ClientesModule.init();
    VentasModule.init();
    HistorialModule.init();

    // 4. Configurar navegación SPA y eventos globales
    this.setupNavigation();
    this.setupGlobalAlerts();

    // 5. Cargar vista inicial según hash o por defecto catálogo
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (this.views.includes(hash)) {
      this.switchView(hash);
    } else {
      this.switchView('catalogo');
    }
  },

  setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-link');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.dataset.view;
        if (targetView && this.views.includes(targetView)) {
          this.switchView(targetView);
          window.location.hash = targetView;
        }
      });
    });

    // Soporte para botones de navegación del historial del navegador (atrás/adelante)
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (this.views.includes(hash) && hash !== this.currentView) {
        this.switchView(hash);
      }
    });
  },

  /**
   * Cambia la vista visible de forma accesible (aria-current, hidden y clases activas)
   */
  switchView(viewName) {
    if (!this.views.includes(viewName)) return;

    this.currentView = viewName;

    // Actualizar botones de navegación
    const navButtons = document.querySelectorAll('.nav-link');
    navButtons.forEach(btn => {
      const isTarget = btn.dataset.view === viewName;
      if (isTarget) {
        btn.classList.add('active');
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.classList.remove('active');
        btn.removeAttribute('aria-current');
      }
    });

    // Actualizar paneles de secciones
    this.views.forEach(v => {
      const section = document.getElementById(`view-${v}`);
      if (!section) return;

      if (v === viewName) {
        section.hidden = false;
        section.classList.add('active');
      } else {
        section.hidden = true;
        section.classList.remove('active');
      }
    });

    // Refrescar datos de la vista activada
    switch (viewName) {
      case 'catalogo':
        CatalogoModule.render(document.getElementById('search-input').value);
        break;
      case 'libros':
        LibrosModule.populateSelectors();
        LibrosModule.renderTabla();
        break;
      case 'clientes':
        ClientesModule.renderTabla();
        break;
      case 'ventas':
        VentasModule.populateClientesSelector();
        VentasModule.populateLibrosSelector();
        break;
      case 'historial':
        HistorialModule.render();
        break;
    }
  },

  setupGlobalAlerts() {
    const btnCloseAlert = document.getElementById('btn-close-alert');
    if (btnCloseAlert) {
      btnCloseAlert.addEventListener('click', () => {
        this.hideAlert();
      });
    }
  },

  showAlert(message, type = 'info') {
    const alertBox = document.getElementById('global-alert');
    const alertMsg = document.getElementById('global-alert-message');
    if (!alertBox || !alertMsg) return;

    alertBox.className = `alert alert-${type}`;
    alertMsg.textContent = message;
    alertBox.hidden = false;
  },

  hideAlert() {
    const alertBox = document.getElementById('global-alert');
    if (alertBox) {
      alertBox.hidden = true;
    }
  }
};

// Arranque al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

