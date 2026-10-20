# Arquitectura Propuesta

## Patrones aplicados

| Patrón | Dónde se usa | Por qué |
|---|---|---|
| SPA por secciones | `index.html` con `vista-*` + navegación JS | Consiga permite varias páginas o secciones; el HTML base usa este patrón |
| Separación de capas | HTML / CSS / JS en archivos distintos | Exigido: separación entre estructura, estilos y comportamiento |
| Módulos por dominio | `js/*.js` (catálogo, libros, ventas…) | Funciones acotadas y nombres comprensibles (criterio de evaluación) |
| Render desde datos | Arrays → DOM con `textContent` | RN-TEC-02: datos de usuario como texto, evita inyección |
| Capa de storage | `js/storage.js` centraliza `localStorage` | Un solo punto de persistencia; seed idempotente |

## Estructura de directorios

```
Parcial1_Frontend/
├── index.html
├── css/
│   └── styles.css          (variables borgoña+crema, layout, componentes)
├── js/
│   ├── datos.js            (seed: editoriales, géneros, autores, libros, clientes)
│   ├── storage.js          (cargar/guardar localStorage, seed idempotente)
│   ├── navegacion.js       (cambio de vista)
│   ├── catalogo.js         (render + filtro)
│   ├── libros.js           (alta + listado + selectores)
│   ├── clientes.js         (alta + listado)
│   ├── ventas.js           (renglones, cálculos, confirmación)
│   └── historial.js        (lista + detalle)
├── img/                    (si aplica; locales con alt)
├── README.md               (entrega)
├── docs/                   (consiga, HTML base, preferencias — no se entrega)
├── knowledge-base/         (no se entrega)
└── openspec/               (no se entrega)
```

Orden de carga de scripts (sin módulos ES para máxima compatibilidad file://): `datos → storage → navegacion → catalogo → libros → clientes → ventas → historial` al final de `<body>`.

## Seguridad

- **Autenticación**: no aplica (sin login por consiga).
- **Autorización**: no aplica.
- **Validación de input**: siempre en el cliente antes de mutar estado; validaciones de la consiga (RN-LIB-*, RN-CLI-*, RN-VTA-*).
- **Inyección DOM**: datos de usuario insertados con `textContent`/`createElement`, nunca `innerHTML` con input crudo.
- **Secrets management**: no aplica (sin claves ni backend).

## Variables de entorno

Ninguna. Proyecto 100% estático.

## Decisiones de estructura abiertas

- Cambio de vista por JS vs múltiples HTML: el HTML base usa secciones + `data-target`; se puede cambiar si el equipo lo prefiere (quedó registrado como decisión en 09).
- Scripts sin `type="module"`: file:// + CORS de módulos; se usan scripts clásicos con orden de carga definido.
