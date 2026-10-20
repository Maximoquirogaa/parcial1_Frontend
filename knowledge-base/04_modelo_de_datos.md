# Modelo de Datos

## Dominios

- **Catálogo**: libros con editorial, género (opcional) y autores.
- **Clientes**: personas que pueden ser seleccionadas en una venta.
- **Ventas**: composición de renglones con precio histórico + historial inmutable.

## ERD (relaciones)

```
Editorial 1 ──── N Libro N ──── N Autor
                   │
                   │ 0..1 (opcional)
                   ▼
               Genero

Cliente 1 ──── N Venta 1 ──── N Renglón N ──── 1 Libro
                                  (precio unitario copiado)
```

## Entidades

### Editorial
- `id` (number, estable)
- `nombre` (string)
- Seed: 2 editoriales (Sudamericana, Sur).

### Genero
- `id` (number, estable)
- `nombre` (string)
- Seed: 2 géneros (Realismo Mágico, Ensayo).
- **Opcional en el libro**: la ausencia se representa con «Sin clasificar» en la interfaz (no es un género del array).

### Autor
- `id` (number, estable)
- `nombre` (string)
- Seed: 3 autores (Gabriel García Márquez, Jorge Luis Borges, Julio Cortázar).

### Libro
- `id` (number, estable)
- `titulo` (string, requerido, no vacío)
- `isbn` (string, requerido, **único**; se compara sin espacios ni guiones, sin dígito de control)
- `precio` (number, requerido, numérico > 0)
- `editorialId` (number, debe existir en editoriales; requerido)
- `generoId` (number | null, opcional; si existe debe existir en géneros)
- `autoresIds` (number[], ≥1, todos deben existir en autores)
- Seed: ≥6 libros; cada libro referencia una editorial existente y ≥1 autor existente; al menos un libro sin género («Sin clasificar»).

### Cliente
- `id` (number, estable)
- `nombreCompleto` (string, requerido, no vacío; sin campo de apellido separado)
- `email` (string, requerido, formato válido, **único** comparado sin espacios exteriores y case-insensitive)
- Seed: 3 clientes ficticios.

### Venta
- `id` (number | string, generado al confirmar)
- `fecha` (string ISO o `toLocaleDateString`, al confirmar)
- `clienteId` + `clienteNombre` (descriptivo para leer el historial sin dependencias frágiles)
- `renglones` (Renglón[])
- `total` (number, suma de subtotales, 2 decimales al mostrar)

### Renglón (dentro de Venta)
- `libroId`
- `libroTitulo` (descriptivo, copiado)
- `precioUnitario` (**copiado al confirmar — valor histórico**, no se relee del catálogo)
- `cantidad` (integer > 0)
- `subtotal` (= precioUnitario × cantidad, 2 decimales al mostrar)

## Seed data inicial

Conjunto inicial (mínimo de la consiga):

- 2 editoriales, 2 géneros, 3 autores, ≥6 libros (al menos uno sin género), 3 clientes.
- Se carga **solo en el primer inicio**; al reabrir se recuperan los datos guardados sin duplicar ejemplos.
- La ubicación y estructura del catálogo guardado en `localStorage` se documenta en el README (requerido para la comprobación guiada de precio histórico).

## Persistencia (`localStorage`)

| Clave (propuesta) | Contenido |
|---|---|
| `libreria_libros` | array de libros |
| `libreria_clientes` | array de clientes |
| `libreria_ventas` | array de ventas confirmadas |

Depende del navegador, del perfil y de la ubicación de apertura; no comparte información entre usuarios.
