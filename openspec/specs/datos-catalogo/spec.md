# datos-catalogo Specification

## Purpose

Provee datos locales estables (editoriales, géneros, autores, libros y clientes) con ids estables, renderiza el catálogo de forma imperativa con `textContent`, y permite filtrar libros por título (`trim` + case-insensitive + coincidencia parcial) con estados de vacío y sin resultados.

## Requirements

### Requirement: Datos seed con ids estables
The system SHALL mantener arrays seed globales de editoriales (2), géneros (2), autores (3), libros (≥6, al menos uno sin género) y clientes (3), todos con ids estables enteros secuenciales a partir de 1.

#### Scenario: Arrays de entidades con ids estables
- **WHEN** se inspecciona `js/datos.js`
- **THEN** existen los arrays `editoriales`, `generos`, `autores`, `libros` y `clientes` con ids enteros secuenciales desde 1

### Requirement: Estructura y relaciones válidas de las entidades
The system SHALL definir `libro.generoId` como número o `null`, `libro.autoresIds` como `number[]` con ≥1 autor existente, `libro.isbn` único, `libro.precio` numérico > 0, y `generoId` null se muestra como «Sin clasificar».

#### Scenario: Libro sin género muestra «Sin clasificar»
- **WHEN** se renderiza un libro con `generoId` igual a `null`
- **THEN** su tarjeta muestra «Sin clasificar» en el campo género

#### Scenario: ISBN único y precio mayor a cero
- **WHEN** se inspecciona el array `libros[]`
- **THEN** cada libro tiene `isbn` único y `precio` > 0

### Requirement: Render imperativo del catálogo con textContent
The system SHALL renderizar cada libro como `<article class="tarjeta">` creado con `document.createElement`, rellenando título, ISBN, editorial, género, autores y precio con `textContent`, sin usar `innerHTML` con datos crudos.

#### Scenario: Tarjeta con los 6 campos por textContent
- **WHEN** se renderiza el catálogo desde `libros[]`
- **THEN** cada tarjeta `<article class="tarjeta">` muestra título, ISBN, editorial, género, autores y precio usando `textContent` y no se usa `innerHTML` con datos crudos

### Requirement: Filtro de búsqueda por título
The system SHALL filtrar libros por título aplicando `trim`, coincidencia parcial e insensible a mayúsculas/minúsculas sobre `libro.titulo`; texto vacío tras trim devuelve el catálogo completo.

#### Scenario: Búsqueda parcial e insensible a mayúsculas
- **WHEN** el usuario busca un fragmento del título con cualquier combinación de mayúsculas y minúsculas
- **THEN** se muestran solo los libros cuyo título contiene ese texto

#### Scenario: Búsqueda vacía devuelve catálogo completo
- **WHEN** el campo de búsqueda está vacío (tras `trim`)
- **THEN** se renderiza el catálogo completo (`libros[]`)

### Requirement: Estado sin resultados y estado de catálogo completo
The system SHALL mostrar `#catalogo-sin-resultados` con mensaje claro cuando hay texto de búsqueda pero no hay coincidencias, y `#catalogo-estado` con «Mostrando catálogo completo» cuando la búsqueda está vacía.

#### Scenario: Búsqueda sin coincidencias muestra mensaje claro
- **WHEN** el texto de búsqueda no coincide con ningún libro
- **THEN** se muestra `#catalogo-sin-resultados` con un mensaje claro y se oculta `#catalogo-estado`

#### Scenario: Búsqueda vacía muestra estado de catálogo completo
- **WHEN** el campo de búsqueda está vacío
- **THEN** se muestra `#catalogo-estado` con «Mostrando catálogo completo» y se oculta `#catalogo-sin-resultados`

### Requirement: Scripts clásicos con defer y sin módulos ES
The system SHALL cargar `js/datos.js` y `js/catalogo.js` en `index.html` con el atributo `defer`, en orden (datos antes que catálogo), sin usar `type="module"`.

#### Scenario: Scripts con defer sin módulos ES
- **WHEN** se inspecciona `index.html`
- **THEN** existen `<script src="js/datos.js" defer>` y `<script src="js/catalogo.js" defer>` sin `type="module"`
