'use strict';

// Helper de tests para scripts clásicos (sin ES modules).
// Crea un contexto VM con shim de window/document y carga scripts vía runInContext.
// No usa npm, frameworks ni CDNs (solo node:fs y node:vm, built-ins de Node).
//
// Extendido en C-04: formularios de libros/clientes, selectores con options /
// selectedOptions / multiple, option.selected, form.reset(), focus y remove().

const fs = require('node:fs');
const vm = require('node:vm');

function crearElemento(tagName) {
    var _ownText = '';
    var _value = '';
    const el = {
        tagName: String(tagName).toUpperCase(),
        id: '',
        className: '',
        innerHTML: '',
        children: [],
        firstChild: null,
        parent: null,
        hidden: false,
        multiple: false,
        selected: false,
        type: '',
        name: '',
        _document: null,
        _focused: false,
        _listeners: {},
        get textContent() {
            var partes = [];
            if (_ownText) { partes.push(_ownText); }
            el.children.forEach(function (c) { partes.push(c.textContent); });
            return partes.join('');
        },
        set textContent(v) { _ownText = String(v); },
        get value() {
            if (el.tagName === 'SELECT') {
                var seleccionada = el.options.filter(function (o) { return o.selected; })[0];
                return seleccionada ? String(seleccionada.value) : '';
            }
            return _value;
        },
        set value(v) {
            if (el.tagName === 'SELECT') {
                var buscado = String(v);
                el.options.forEach(function (o) { o.selected = String(o.value) === buscado; });
                return;
            }
            _value = String(v);
        },
        get options() {
            return el.children.filter(function (c) { return c.tagName === 'OPTION'; });
        },
        get selectedOptions() {
            return el.options.filter(function (o) { return o.selected; });
        },
        setAttribute: function (k, v) { this[k] = v; },
        getAttribute: function (k) { return this[k]; },
        removeAttribute: function (k) { delete this[k]; },
        appendChild: function (child) {
            this.children.push(child);
            child.parent = this;
            this.firstChild = this.children[0] || null;
            return child;
        },
        removeChild: function (child) {
            this.children = this.children.filter(function (c) { return c !== child; });
            if (this.firstChild === child) {
                this.firstChild = this.children[0] || null;
            }
            child.parent = null;
            return child;
        },
        remove: function () {
            if (this.parent) { this.parent.removeChild(this); }
        },
        addEventListener: function (type, listener) {
            this._listeners[type] = this._listeners[type] || [];
            this._listeners[type].push(listener);
        },
        removeEventListener: function () {},
        dispatchEvent: function (event) {
            event = event || {};
            event.type = event.type || '';
            (this._listeners[event.type] || []).forEach(function (l) { l.call(this, event); }, this);
            return true;
        },
        focus: function () {
            this._focused = true;
            if (this._document) { this._document.activeElement = this; }
        },
        reset: function () { resetElemento(this); },
        classList: {
            add: function () { var c = Array.prototype.slice.call(arguments); this.owner.className = c.join(' '); },
            remove: function () {},
            contains: function () { return false; }
        },
        style: {}
    };
    el.classList.owner = el;
    return el;
}

function resetElemento(el) {
    el.children.forEach(function (c) {
        if (c.tagName === 'INPUT' || c.tagName === 'TEXTAREA') {
            c.value = '';
        } else if (c.tagName === 'SELECT') {
            c.options.forEach(function (o) { o.selected = false; });
            var placeholder = c.options.filter(function (o) { return String(o.value) === ''; })[0];
            if (placeholder) { placeholder.selected = true; }
        }
        resetElemento(c);
    });
}

function crearDocumentoMinimo() {
    var elements = {};
    var doc;

    function nuevo(tag) {
        var el = crearElemento(tag);
        el._document = doc;
        return el;
    }

    function campo(form, tag, id, props) {
        var el = nuevo(tag);
        el.id = id;
        Object.keys(props || {}).forEach(function (k) { el[k] = props[k]; });
        form.appendChild(el);
        elements[id] = el;
        return el;
    }

    doc = {
        getElementById: function (id) {
            if (elements[id]) { return elements[id]; }
            var el = nuevo('div');
            el.id = id;
            elements[id] = el;
            return el;
        },
        createElement: function (tag) { return nuevo(tag); },
        querySelector: function (selector) {
            if (selector === '#vista-catalogo form' || selector === 'form') { return elements._form; }
            if (selector === '#vista-libros form') { return elements._formLibros; }
            if (selector === '#vista-clientes form') { return elements._formClientes; }
            if (selector === '#vista-ventas form') { return elements._formVentas; }
            if (selector.indexOf('#') === 0) {
                var id = selector.slice(1);
                return elements[id] || (elements[id] = nuevo('div'));
            }
            return nuevo('div');
        },
        querySelectorAll: function () { return []; },
        body: null,
        documentElement: null,
        activeElement: null,
        addEventListener: function () {},
        _elements: elements
    };

    doc.body = nuevo('body');
    doc.documentElement = nuevo('html');

    // Catálogo (C-03)
    var form = nuevo('form');
    form.appendChild(campo(form, 'input', 'buscar-titulo', { value: '' }));
    form.appendChild(campo(form, 'button', 'buscar-boton', { type: 'submit' }));
    elements._form = form;
    doc._form = form;

    elements['contenedor-catalogo'] = nuevo('div');
    elements['catalogo-estado'] = nuevo('p');
    elements['catalogo-sin-resultados'] = nuevo('p');
    elements['catalogo-sin-resultados'].hidden = true;

    // Formulario de libros (C-04)
    var formLibros = nuevo('form');
    campo(formLibros, 'input', 'libro-titulo', { type: 'text' });
    campo(formLibros, 'input', 'libro-isbn', { type: 'text' });
    campo(formLibros, 'input', 'libro-precio', { type: 'number' });
    campo(formLibros, 'select', 'libro-editorial', {});
    campo(formLibros, 'select', 'libro-genero', {});
    campo(formLibros, 'select', 'libro-autores', { multiple: true });
    campo(formLibros, 'button', 'libros-submit', { type: 'submit' });
    elements._formLibros = formLibros;

    elements['libros-exito'] = nuevo('p');
    elements['libros-exito'].hidden = true;
    elements['libros-error'] = nuevo('p');
    elements['libros-error'].hidden = true;
    elements['libros-vacio'] = nuevo('p');
    elements['libros-vacio'].hidden = true;
    elements['tabla-libros'] = nuevo('tbody');

    // Formulario de clientes (C-04)
    var formClientes = nuevo('form');
    campo(formClientes, 'input', 'cliente-nombre', { type: 'text' });
    campo(formClientes, 'input', 'cliente-email', { type: 'email' });
    campo(formClientes, 'button', 'clientes-submit', { type: 'submit' });
    elements._formClientes = formClientes;

    elements['clientes-exito'] = nuevo('p');
    elements['clientes-exito'].hidden = true;
    elements['clientes-error'] = nuevo('p');
    elements['clientes-error'].hidden = true;
    elements['clientes-vacio'] = nuevo('p');
    elements['clientes-vacio'].hidden = true;
    elements['tabla-clientes'] = nuevo('tbody');

    // Selectores de venta y formulario de ventas (C-04/C-05)
    var formVentas = nuevo('form');
    campo(formVentas, 'select', 'venta-cliente', {});
    campo(formVentas, 'select', 'venta-libro', {});
    campo(formVentas, 'input', 'venta-cantidad', { type: 'number', value: '1' });
    campo(formVentas, 'button', 'agregar-renglon', { type: 'button' });
    campo(formVentas, 'button', 'confirmar-venta', { type: 'submit' });
    elements._formVentas = formVentas;

    elements['tabla-renglones'] = nuevo('tbody');
    elements['tabla-historial'] = nuevo('tbody');
    elements['historial-detalle'] = nuevo('div');
    elements['historial-detalle'].hidden = true;
    elements['tabla-detalle-venta'] = nuevo('tbody');
    elements['ventas-exito'] = nuevo('p');
    elements['ventas-exito'].hidden = true;
    elements['ventas-error'] = nuevo('p');
    elements['ventas-error'].hidden = true;
    elements['ventas-total'] = nuevo('p');
    elements['historial-vacio'] = nuevo('p');
    elements['historial-vacio'].hidden = true;
    elements['ventas-vacio'] = nuevo('p');
    elements['ventas-vacio'].hidden = true;

    return doc;
}

function crearLocalStorageShim() {
    var almacenamiento = {};
    return {
        getItem: function (clave) {
            return almacenamiento[clave] === undefined ? null : almacenamiento[clave];
        },
        setItem: function (clave, valor) {
            almacenamiento[clave] = String(valor);
        },
        removeItem: function (clave) {
            delete almacenamiento[clave];
        },
        clear: function () {
            almacenamiento = {};
        }
    };
}

function crearSandbox() {
    var sandbox = Object.create(globalThis);
    sandbox.window = sandbox;
    sandbox.document = crearDocumentoMinimo();
    sandbox.localStorage = crearLocalStorageShim();
    var context = vm.createContext(sandbox);
    return { sandbox: sandbox, context: context };
}

function cargarScript(context, ruta) {
    var codigo = fs.readFileSync(ruta, 'utf8');
    vm.runInContext(codigo, context, { filename: ruta });
}

module.exports = {
    crearSandbox: crearSandbox,
    crearDocumentoMinimo: crearDocumentoMinimo,
    cargarScript: cargarScript,
    crearElemento: crearElemento
};
