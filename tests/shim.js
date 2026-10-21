'use strict';

// Helper de tests para scripts clásicos (sin ES modules).
// Crea un contexto VM con shim de window/document y carga scripts vía runInContext.
// No usa npm, frameworks ni CDNs (solo node:fs y node:vm, built-ins de Node).

const fs = require('node:fs');
const vm = require('node:vm');

function crearElemento(tagName) {
    var _ownText = '';
    const el = {
        tagName: String(tagName).toUpperCase(),
        id: '',
        className: '',
        innerHTML: '',
        value: '',
        children: [],
        firstChild: null,
        parent: null,
        hidden: false,
        _listeners: {},
        get textContent() {
            var partes = [];
            if (_ownText) { partes.push(_ownText); }
            el.children.forEach(function (c) { partes.push(c.textContent); });
            return partes.join('');
        },
        set textContent(v) { _ownText = String(v); },
        setAttribute: function (k, v) { this[k] = v; },
        getAttribute: function (k) { return this[k]; },
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
            return child;
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

function crearDocumentoMinimo() {
    var elements = {};
    var form = crearElemento('form');
    var input = crearElemento('input');
    input.id = 'buscar-titulo';
    input.value = '';
    form.appendChild(input);
    var button = crearElemento('button');
    button.type = 'submit';
    form.appendChild(button);

    elements['buscar-titulo'] = input;
    elements['contenedor-catalogo'] = crearElemento('div');
    elements['catalogo-estado'] = crearElemento('p');
    elements['catalogo-sin-resultados'] = crearElemento('p');
    elements['catalogo-sin-resultados'].hidden = true;
    elements._form = form;

    return {
        getElementById: function (id) {
            if (elements[id]) { return elements[id]; }
            var el = crearElemento('div');
            el.id = id;
            elements[id] = el;
            return el;
        },
        createElement: crearElemento,
        querySelector: function (selector) {
            if (selector === '#vista-catalogo form' || selector === 'form') { return elements._form; }
            if (selector.indexOf('#') === 0) {
                var id = selector.slice(1);
                return elements[id] || (elements[id] = crearElemento('div'));
            }
            return crearElemento('div');
        },
        querySelectorAll: function () { return []; },
        body: crearElemento('body'),
        documentElement: crearElemento('html'),
        addEventListener: function () {},
        _elements: elements,
        _form: form
    };
}

function crearSandbox() {
    var sandbox = Object.create(globalThis);
    sandbox.window = sandbox;
    sandbox.document = crearDocumentoMinimo();
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
