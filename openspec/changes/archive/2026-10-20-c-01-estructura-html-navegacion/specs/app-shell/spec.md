# Spec Delta

## Purpose

Define la estructura base navegable de la aplicación frontend de la librería: un shell HTML semántico con las 5 vistas del sistema y navegación entre ellas sin recargar la página, sobre la cual se construyen el resto de las capacidades (catálogo, altas, ventas, historial).

## ADDED Requirements

### Requirement: Estructura semántica del shell
The system SHALL presentar un `index.html` con `lang="es"`, y etiquetas semánticas `header`, `nav` y `main` como esqueleto de la aplicación.

#### Scenario: Carga inicial del shell
- **WHEN** el usuario abre `index.html` en el navegador
- **THEN** el documento tiene `lang="es"`, un `header` con `h1`, una `nav` y un `main` presentes

### Requirement: Cinco vistas identificables
The system SHALL contener cinco secciones identificables como vistas: catálogo, libros, clientes, ventas e historial.

#### Scenario: Presencia de las cinco vistas
- **WHEN** se inspecciona el HTML del shell
- **THEN** existen cinco secciones con identificadores `vista-catalogo`, `vista-libros`, `vista-clientes`, `vista-ventas` y `vista-historial`

### Requirement: Navegación entre vistas sin recargar
The system SHALL permitir alternar la vista visible mediante los botones de navegación, sin recargar la página, mostrando solo una vista a la vez.

#### Scenario: Cambio de vista por clic
- **WHEN** el usuario hace clic en el botón de navegación con `data-target` igual al identificador de otra vista
- **THEN** la vista target se muestra y la vista anterior se oculta, sin recargar la página

#### Scenario: Solo una vista visible
- **WHEN** el usuario navega a cualquier vista
- **THEN** únicamente la sección target está visible; las demás están ocultas

### Requirement: Labels asociados en formularios
The system SHALL asociar cada campo de formulario (`input`, `select`, `textarea`) con un `<label>` mediante `for`/`id`.

#### Scenario: Asociación label-campo
- **WHEN** se inspecciona cualquier formulario del shell
- **THEN** cada campo tiene un `<label>` con `for` que apunta al `id` del campo

### Requirement: Botones con texto descriptivo
The system SHALL mostrar en cada `<button>` un texto que describa su acción.

#### Scenario: Texto de botones
- **WHEN** se inspeccionan los botones del shell (navegación y formularios)
- **THEN** cada botón tiene contenido de texto que describe la acción (no está vacío ni es solo un icono sin `aria-label`)

### Requirement: Tablas con encabezados
The system SHALL incluir en cada `<table>` un `<thead>` con `<th>` que describan las columnas.

#### Scenario: Encabezados de tablas
- **WHEN** se inspeccionan las tablas de listados e historial
- **THEN** cada tabla tiene un `<thead>` con al menos un `<th>` por columna visible

### Requirement: Mensajes de estado base
The system SHALL dejar nodos de mensaje en cada vista pertinente para estados: lista vacía, búsqueda sin resultados, operación correcta y operación rechazada.

#### Scenario: Nodos de estado disponibles
- **WHEN** se inspecciona el HTML de las vistas
- **THEN** existen elementos identificables (con clase o id) para los mensajes de estado de cada vista, listos para ser poblados por JavaScript

### Requirement: Sin datos de ejemplo hardcodeados
The system SHALL NO incluir en el HTML datos de ejemplo de libros, clientes o ventas en los contenedores de catálogo/listados; dichos contenidos se renderizarán dinámicamente.

#### Scenario: Listados sin datos estáticos
- **WHEN** se inspeccionan los contenedores de catálogo, listado de libros, listado de clientes e historial
- **THEN** no hay filas ni artículos de ejemplo precargados en el HTML
