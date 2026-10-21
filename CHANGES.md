# CHANGES — Secuencia de Implementación

> Índice canónico de todos los changes del proyecto **Librería UTN — Parcial 1 Frontend**.
> Cada change es atómico: un agente puede implementarlo en una sesión (~4-6 horas).
> **Leer este archivo antes de ejecutar cualquier `/opsx-propose`.**

---

## Cómo usar este documento

1. **Identificar el change**: empezar por el primero pendiente (`[ ]`) que sus dependencias estén completas (`[x]`).
2. **Leer la KB**: abrir los archivos listados en **Leer antes** de ese change.
3. **Proponer**: correr `/opsx-propose` describiendo el change (usando la plantilla de prompt SPEC→PLAN→IMPLEMENT si se desea).
4. **Implementar**: una vez aprobado el SPEC, completar el PLAN y ejecutar `/opsx-apply`.
5. **Archivar y marcar**: al cerrar, archivar el change y cambiar `[ ]` → `[x]` en este archivo.

---

## Árbol de dependencias

```
C-01 estructura-html-navegacion
├── C-02 css-identidad-accesibilidad
└── C-03 datos-catalogo-filtro
    └── C-04 altas-libros-clientes
        └── C-05 venta-historial
            └── C-06 persistencia-readme
```

### Paralelismo por fase

```
GATE 0: inicio
  → C-01 estructura-html-navegacion          [único — base de todo]

GATE 1: C-01 ✓                                ← PRIMER FORK
  → C-02 css-identidad-accesibilidad          [paralelo con C-03]
  → C-03 datos-catalogo-filtro                [paralelo con C-02]

GATE 2: C-03 ✓
  → C-04 altas-libros-clientes

GATE 3: C-04 ✓
  → C-05 venta-historial

GATE 4: C-05 ✓
  → C-06 persistencia-readme
```

### Camino crítico (5 changes — mínimo irreducible)

`C-01 → C-03 → C-04 → C-05 → C-06`

### Plan óptimo (1 estudiante — contexto: parcial individual)

| Paso | Estudiante |
|------|-----------|
| 1 | C-01 estructura-html-navegacion |
| 2 | C-02 css-identidad-accesibilidad (o C-03, según preferencia) |
| 3 | C-03 datos-catalogo-filtro (si se hizo C-02 en paso 2) |
| 4 | C-04 altas-libros-clientes |
| 5 | C-05 venta-historial |
| 6 | C-06 persistencia-readme |

---

## FASE 1 — Estructura y presentación

### [C-01] `estructura-html-navegacion`
- **Estado**: `[ ]` pendiente
- **Scope**:
  - `index.html` con header, nav y main semánticos.
  - 5 secciones `vista-*`: catálogo, libros, clientes, ventas, historial.
  - Navegación por botones `data-target` (o enlaces) con JS en `js/navegacion.js`.
  - Cada campo con `<label>` asociado; botones con texto descriptivo; tablas con `<thead>`.
  - Mensajes base para listas vacías y estados (placeholders que JS completará luego).
  - Partir de `docs/base-index.html` y pulir: `lang="es"`, ids consistentes, quitar datos hardcodeados de ejemplo (se renderizarán desde JS en C-03).
- **Dependencias**: ninguna
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §Épica 1 (US-001, US-002)
  - `knowledge-base/08_arquitectura_propuesta.md` §Estructura de directorios
  - `docs/base-index.html` (HTML de partida)
  - `knowledge-base/05_reglas_de_negocio.md` §RN-UI-01, RN-UI-02, RN-UI-03

### [C-02] `css-identidad-accesibilidad`
- **Estado**: `[ ]` pendiente
- **Scope**:
  - `css/styles.css` con CSS custom properties: borgoña (`--color-primario`) + crema (`--color-fondo`), tipografía, espaciado.
  - Layout con Flexbox o Grid: header/nav/main responsive.
  - Clases reutilizables: tarjetas (`article`), formularios, botones, tablas, mensajes de error/éxito.
  - Foco visible (`:focus-visible`), contraste suficiente.
  - Responsive: sin scroll horizontal a 320px; tablas con `overflow-x: auto` en su contenedor.
  - Estados de error con texto (no solo color).
- **Dependencias**: `C-01`
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/02_descripcion_general.md` §Identidad visual
  - `knowledge-base/06_funcionalidades.md` §Épica 2 (US-003, US-004)
  - `knowledge-base/05_reglas_de_negocio.md` §RN-UI-04…RN-UI-08
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-01

---

## FASE 2 — Datos y catálogo

### [C-03] `datos-catalogo-filtro`
- **Estado**: `[x]` completado
- **Scope**:
  - `js/datos.js`: arrays seed con ids estables — 2 editoriales, 2 géneros, 3 autores, ≥6 libros (1 sin género), 3 clientes.
  - `js/catalogo.js`: render del catálogo desde `libros[]` con `textContent` (sin innerHTML con datos crudos).
  - Filtro por título: `trim` + case-insensitive + coincidencia parcial.
  - Estados: vacío ⇒ catálogo completo; sin coincidencias ⇒ mensaje claro.
  - Cada tarjeta muestra: título, ISBN, editorial, género («Sin clasificar» si no tiene), autores, precio.
- **Dependencias**: `C-01`
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/04_modelo_de_datos.md` §Entidades, §Seed data
  - `knowledge-base/06_funcionalidades.md` §Épica 3 (US-005, US-006)
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CAT-01…RN-CAT-05, §RN-TEC-02
  - `knowledge-base/07_flujos_principales.md` §Flujo 2

---

## FASE 3 — Altas

### [C-04] `altas-libros-clientes`
- **Estado**: `[ ]` pendiente
- **Scope**:
  - `js/libros.js`: formulario de alta con selectores generados desde datos locales (editorial, género con «Sin clasificar», autores múltiple).
  - Validaciones libro (RN-LIB-01…08): título/ISBN no vacíos, ISBN único (sin espacios/guiones), precio > 0, editorial/autores existentes, ≥1 autor, género opcional válido.
  - `js/clientes.js`: alta de cliente con validaciones (RN-CLI-01…04): campos no vacíos, email válido, email único (trim + case-insensitive).
  - `preventDefault`, errores cerca del formulario, actualización de listados y selectores sin recargar.
  - Render de tablas de listado libros y clientes.
- **Dependencias**: `C-03`
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/04_modelo_de_datos.md` §Libro, §Cliente
  - `knowledge-base/06_funcionalidades.md` §Épica 4 (US-007, US-008)
  - `knowledge-base/05_reglas_de_negocio.md` §RN-LIB-01…08, §RN-CLI-01…04
  - `knowledge-base/07_flujos_principales.md` §Flujo 3, §Flujo 4

---

## FASE 4 — Ventas

### [C-05] `venta-historial`
- **Estado**: `[ ]` pendiente
- **Scope**:
  - `js/ventas.js`: selector de cliente, agregar renglones (libro + cantidad entera > 0), sin duplicados (modifica cantidad del existente), editar cantidades y quitar renglones antes de confirmar.
  - Cálculos: subtotal = cantidad × precio; total = suma subtotales; formato 2 decimales.
  - Bloqueo de confirmación sin cliente/renglones/cantidades inválidas.
  - Al confirmar: copiar precio unitario al renglón (valor histórico), registrar id/fecha/cliente/renglones/total, limpiar formulario, mensaje de éxito.
  - `js/historial.js`: lista de ventas (id, fecha, cliente, total) + detalle inmutable de renglones.
- **Dependencias**: `C-04`
- **Governance**: ALTO
- **Leer antes**:
  - `knowledge-base/04_modelo_de_datos.md` §Venta, §Renglón
  - `knowledge-base/06_funcionalidades.md` §Épica 5 (US-009, US-010, US-011)
  - `knowledge-base/05_reglas_de_negocio.md` §RN-VTA-01…09
  - `knowledge-base/07_flujos_principales.md` §Flujo 5, §Flujo 6
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-06, §DD-07

---

## FASE 5 — Cierre

### [C-06] `persistencia-readme`
- **Estado**: `[ ]` pendiente
- **Scope**:
  - `js/storage.js`: cargar/guardar `localStorage` (claves: `libreria_libros`, `libreria_clientes`, `libreria_ventas`), seed idempotente (solo primer inicio), sin duplicar al reabrir.
  - Integrar storage en módulos existentes (cargar al inicio, guardar tras cada mutación).
  - `README.md` de entrega: autores, pasos para abrir sin npm, navegación, funcionalidades, ubicación de datos iniciales, límites de `localStorage`, resultados de los 8 casos manuales (ejecutados de verdad), procedencia de imágenes si existen.
  - Verificación final: casos manuales de la consiga Ej. 6.
- **Dependencias**: `C-05`
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §Épica 6 (US-012, US-013)
  - `knowledge-base/05_reglas_de_negocio.md` §RN-PER-01…03
  - `knowledge-base/07_flujos_principales.md` §Flujo 7
  - `knowledge-base/04_modelo_de_datos.md` §Persistencia

---

## Resumen

| Change | Nombre | Deps | Governance | Ejercicio |
|--------|--------|------|------------|-----------|
| C-01 | estructura-html-navegacion | — | BAJO | Ej. 1 (20 pts) |
| C-02 | css-identidad-accesibilidad | C-01 | BAJO | Ej. 2 (20 pts) |
| C-03 | datos-catalogo-filtro | C-01 | MEDIO | Ej. 3 (15 pts) |
| C-04 | altas-libros-clientes | C-03 | MEDIO | Ej. 4 (15 pts) |
| C-05 | venta-historial | C-04 | ALTO | Ej. 5 (20 pts) |
| C-06 | persistencia-readme | C-05 | MEDIO | Ej. 6 (10 pts) |

**Primer change recomendado**: `C-01` (estructura-html-navegacion)

Para arrancar: `/opsx-propose` describiendo C-01 (o usar la plantilla de prompt SPEC→PLAN→IMPLEMENT con el scope de este change).
