# Descripción General

## Stack tecnológico

| Capa | Tecnologías | Versión mínima |
|---|---|---|
| Estructura | HTML5 semántico | Navegador moderno (Chrome/Firefox/Edge) |
| Estilos | CSS3 propio (Flexbox/Grid), archivos externos | — |
| Comportamiento | JavaScript nativo (ES6+: arrays, objetos, `localStorage`, eventos, `preventDefault`) | — |
| Datos | Arrays/objetos en memoria + `localStorage` | — |

**Restricción dura de la consiga**: no se usan librerías, frameworks ni CDNs de CSS/JavaScript. No hay `npm`, bundlers ni dependencias instaladas. Se abre `index.html` directamente en el navegador (file://).

## Arquitectura general

```
index.html ──► css/styles.css (identidad visual: borgoña + crema)
     │
     ├──► js/datos.js      (modelos, arrays seed, helpers de normalización)
     ├──► js/catalogo.js   (render del catálogo + filtro por título)
     ├──► js/libros.js     (alta de libros + listado + selectores)
     ├──► js/clientes.js   (alta de clientes + listado)
     ├──► js/ventas.js     (composición de venta, renglones, cálculos)
     ├──► js/historial.js  (listado de ventas + detalle)
     ├──► js/navegacion.js (cambio de vista vía botones data-target)
     └──► js/storage.js    (cargar/guardar localStorage, seed sin duplicar)
```

- **SPA por secciones**: `index.html` contiene las 5 secciones `vista-*`; la navegación alterna su visibilidad con JS (patrón del HTML base `docs/base-index.html`). Se permite alternativamente múltiples HTML con enlaces, manteniendo navegación clara.
- **Separación de capas**: estructura (HTML), estilos (CSS) y comportamiento (JS) en archivos separados; funciones con responsabilidades reconocibles.
- **Render imperativo**: el DOM se genera/actualiza desde JS a partir de los arrays; los datos de usuario se insertan como texto (no `innerHTML` con datos crudos para evitar inyección).

## Integraciones externas

| Servicio | Propósito | Tipo |
|---|---|---|
| Ninguno | Datos 100% locales y ficticios | — |

No hay fetch, API ni recursos externos. Imágenes, si existen, son locales y requieren `alt`.

## API REST

No aplica. Todas las operaciones son en memoria + `localStorage`.

## Identidad visual (decisión del usuario)

- Paleta: **borgoña** (tonos vino, ej. `#6B1D2A`, `#8B2942`) como color primario y **crema** (ej. `#F5EFE6`, `#FAF6F0`) como fondo/base; neutros oscuros para texto.
- Definida en CSS con variables (custom properties) y clases reutilizables para tarjetas, formularios, tablas y botones.
