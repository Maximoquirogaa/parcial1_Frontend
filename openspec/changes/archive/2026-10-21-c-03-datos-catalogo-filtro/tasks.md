# Tasks

## 1. Datos seed (`js/datos.js`)

- [x] 1.1 Crear `js/datos.js` con arrays `editoriales` (2: Sudamericana, Sur), `generos` (2: Realismo Mágico, Ensayo), `autores` (3: Gabriel García Márquez, Jorge Luis Borges, Julio Cortázar) con ids estables enteros desde 1; verificar que el archivo se carga sin errores de consola
- [x] 1.2 Crear array `libros` con ≥6 libros, ids estables, cada uno con `titulo`, `isbn` (único), `precio` (>0), `editorialId` existente, `generoId` (número o null, al menos un libro null), `autoresIds` (≥1, existentes); verificar relaciones válidas inspeccionando el array
- [x] 1.3 Crear array `clientes` con 3 clientes (`nombreCompleto`, `email` único); verificar que no hay emails duplicados
- [x] 1.4 Exponer los 5 arrays en un espacio de nombres global controlado (ej. `window.libreria` o similar) para que `catalogo.js` y cambios futuros (C-04, C-05) los consuman; verificar acceso desde consola del navegador

## 2. Render del catálogo (`js/catalogo.js`)

- [x] 2.1 Implementar `renderCatalogo(librosAFiltrar)` que limpie `#contenedor-catalogo` y cree `<article class="tarjeta">` por libro con `document.createElement`, rellenando título, ISBN, editorial, género («Sin clasificar» si `generoId` es null), autores y precio usando `textContent`; verificar que no se usa `innerHTML` con datos crudos
- [x] 2.2 Verificar que cada tarjeta muestra los 6 campos requeridos (título, ISBN, editorial, género, autores, precio) y que el libro sin género muestra «Sin clasificar»
- [x] 2.3 Al cargar la página, renderizar el catálogo completo (`libros[]`) sin filtro; verificar que se ven todos los libros (≥6) y el mensaje `#catalogo-estado` indica catálogo completo

## 3. Filtro de búsqueda por título

- [x] 3.1 Implementar `filtrarLibros(texto)` que aplique `trim`, luego coincidencia parcial case-insensitive sobre `libro.titulo`; devolver `libros[]` completo si el texto tras trim está vacío; verificar con casos de prueba en consola (vacío, parcial, mayúsculas/minúsculas, sin coincidencias)
- [x] 3.2 Conectar el submit del formulario de búsqueda con `preventDefault`, leer `#buscar-titulo.value`, aplicar `trim`, filtrar y re-renderizar; verificar que el botón Buscar no recarga la página
- [x] 3.3 Estado sin coincidencias: si hay texto y el filtrado está vacío, mostrar `#catalogo-sin-resultados` con mensaje claro y ocultar `#catalogo-estado`; verificar visualmente
- [x] 3.4 Estado vacío/búsqueda sin texto: mostrar `#catalogo-estado` «Mostrando catálogo completo» y ocultar `#catalogo-sin-resultados`; verificar visualmente

## 4. Integración en `index.html`

- [x] 4.1 Agregar `<script src="js/datos.js" defer>` y `<script src="js/catalogo.js" defer>` a `index.html` (datos antes que catálogo); verificar que no se modifiquen ids ni la estructura de vistas
- [x] 4.2 Abrir `index.html` en el navegador y verificar que no hay errores de consola y que `js/datos.js` y `js/catalogo.js` se ejecutan al cargar

## 5. Verificación final (manual)

- [x] 5.1 Carga inicial: catálogo completo renderizado (≥6 tarjetas), mensaje de estado visible, `#catalogo-sin-resultados` oculto
- [x] 5.2 Búsqueda con coincidencia parcial (ej. una palabra del título): se filtran solo los libros que contienen ese texto, independientemente de mayúsculas
- [x] 5.3 Búsqueda vacía (campo limpio + Buscar): vuelve a mostrar el catálogo completo
- [x] 5.4 Búsqueda sin coincidencias: se muestra mensaje claro y no queda una lista vacía muda
- [x] 5.5 Libro sin género: su tarjeta muestra «Sin clasificar» en el campo género
- [x] 5.6 Rollback check: eliminar `js/datos.js`, `js/catalogo.js` y los `<script>`; el shell de C-01/C-02 sigue funcionando (navegación entre vistas sin recarga)
