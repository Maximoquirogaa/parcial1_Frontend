# Decisiones y Supuestos

## Decisiones documentadas

### DD-01 — Paleta borgoña + crema
**Decisión**: identidad visual con borgoña como primario y crema como fondo/base, vía CSS custom properties.
**Contexto**: preferencia explícita del usuario al iniciar el proyecto.
**Alternativas consideradas**: paleta genérica neutral; tema oscuro.
**Justificación**: gusto del usuario; coherente con una librería clásica.
**Trade-offs aceptados**: contraste debe cuidarse (borgoña oscuro sobre crema da buen contraste; validar foco y estados de error).

### DD-02 — HTML base como punto de partida
**Decisión**: partir de `docs/base-index.html` (5 secciones `vista-*`, navegación `data-target`, formularios y tablas de ejemplo), modificándolo lo necesario.
**Contexto**: el usuario pidió no empezar de cero.
**Alternativas consideradas**: generar desde cero; usar múltiples HTML.
**Justificación**: la estructura base ya cubre vistas, formularios y tablas de la consiga.
**Trade-offs aceptados**: hay que pulir semántica, accesibilidad y estado del HTML base (ej. `lang`, ids, mensajes).

### DD-03 — Cambio de vista SPA por secciones
**Decisión**: un solo `index.html` con secciones alternadas por JS.
**Contexto**: patrón del HTML base; la consiga lo permite.
**Alternativas consideradas**: una página HTML por vista con enlaces.
**Justificación**: simple, sin servidor, coherente con el base.
**Trade-offs aceptados**: el «atrás» del navegador no cambia de vista (no es exigido).

### DD-04 — Scripts clásicos, sin módulos ES
**Decisión**: scripts con `defer`/al final del body, sin `type="module"`, exponiendo funciones en un espacio de nombres o global controlado.
**Contexto**: apertura vía file:// donde los módulos ES pueden fallar por CORS.
**Alternativas consideradas**: módulos ES; un solo bundle.
**Justificación**: máxima compatibilidad sin tooling.
**Trade-offs aceptados**: hay que cuidar nombres globales (prefijo `libreria*` o IIFE por archivo).

### DD-05 — ISBN normalizado sin espacios ni guiones
**Decisión**: al validar unicidad se comparan ISBN removiendo espacios y guiones.
**Contexto**: la consiga lo exige y omite dígito de control.
**Alternativas consideradas**: validar solo trim; implementar módulo 10/13.
**Justificación**: explícito en la consiga.
**Trade-offs aceptados**: ISBNs mal escritos pero sin guiones pueden colisionar; aceptado para el parcial.

### DD-06 — Precio unitario histórico copiado en la venta
**Decisión**: al confirmar, cada renglón guarda `precioUnitario` (y datos descriptivos) dentro de la venta.
**Contexto**: la comprobación guiada del docente modifica el precio del catálogo en `localStorage` y verifica que el historial no cambie.
**Alternativas consideradas**: guardar solo `libroId` y leer precio actual (INCORRECTO para la consiga).
**Justificación**: requisito explícito Ej. 5 y caso manual 6.
**Trade-offs aceptados**: redundancia de datos; aceptada a propósito.

### DD-07 — Duplicado de libro en venta: modificar cantidad
**Decisión**: ante libro repetido en la misma venta, se **suma/actualiza la cantidad** del renglón existente y se informa al usuario.
**Contexto**: la consiga permite "modificar la cantidad o informar el duplicado".
**Alternativas consideradas**: solo informar y bloquear.
**Justificación**: UX más fluida cumpliendo la consiga.
**Trade-offs aceptados**: ninguno significativo.

### DD-08 — Alcance de entrega: sin tooling
**Decisión**: la entrega es HTML/CSS/JS/README estáticos; docs/, knowledge-base/ y openspec/ no se incluyen en el zip.
**Contexto**: formato de entrega de la consiga.
**Trade-offs aceptados**: el proceso spec-driven vive fuera del entregable.

## Supuestos inferidos

### SU-01 — Navegador moderno
**Supuesto**: se usa un navegador actual (ES6+, `localStorage`).
**Origen**: consiga no define compatibilidad con navegadores viejos.
**Riesgo si es bajo**: `localStorage` podría no existir (mitigado en 07 con degradación).
**Cómo validar**: probar en el navegador del evaluador.

### SU-02 — Sin imágenes obligatorias
**Supuesto**: el diseño puede resolverse con CSS (borgoña/crema) sin imágenes; si las hay, son locales.
**Origen**: consiga solo pide `alt` si existen imágenes.
**Riesgo si es bajo**: ninguno.
**Cómo validar**: revisar `img/` antes de entregar.

### SU-03 — Moneda arbitraria
**Supuesto**: los precios se muestran con dos decimales y signo `$` (pesos ficticios), sin formatos locales complejos.
**Origen**: ejemplos de la consiga (`$1500.00`).
**Cómo validar**: alinear con lo que muestre el HTML base.
