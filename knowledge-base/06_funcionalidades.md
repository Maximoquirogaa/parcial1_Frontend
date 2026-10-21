# Funcionalidades

Organizadas por épica (alineada a los 6 ejercicios de la consiga) con historias de usuario.

## Épica 1: Estructura y pantallas (Ejercicio 1 — 20 pts)

### US-001 — Navegación entre vistas
**Como** visitante
**Quiero** acceder por navegación clara a Catálogo, Libros, Clientes, Ventas e Historial
**Para** realizar cada operación en su pantalla

**Criterios de aceptación**:
- [ ] `index.html` es la entrada; existen las 5 vistas identificables
- [ ] Encabezado, navegación y contenido principal usan etiquetas semánticas
- [ ] La navegación funciona (botones `data-target` o enlaces)

**Reglas relacionadas**: RN-UI-01

### US-002 — Catálogo con datos de libros
**Como** visitante
**Quiero** ver título, ISBN, editorial, género, autores y precio de cada libro
**Para** evaluar el catálogo

**Criterios de aceptación**:
- [ ] Cada libro muestra los 6 campos
- [ ] Sin género se muestra «Sin clasificar»
- [ ] Listas vacías y estados tienen mensajes

**Reglas relacionadas**: RN-CAT-04, RN-CAT-05, RN-UI-02, RN-UI-03

## Épica 2: Presentación CSS (Ejercicio 2 — 20 pts)

### US-003 — Identidad visual coherente
**Como** evaluador
**Quiero** una interfaz con identidad propia (borgoña + crema), CSS externo y clases reutilizables
**Para** verificar coherencia y organización

**Criterios de aceptación**:
- [ ] CSS en archivos externos; colores/tipografía/espaciado consistentes
- [ ] Clases reutilizables para tarjetas, formularios y botones
- [ ] Flexbox o Grid en el layout

**Reglas relacionadas**: RN-UI-04

### US-004 — Uso adaptable y accesible
**Como** usuario con distintos dispositivos o necesidades de accesibilidad
**Quiero** que la interfaz sea legible a 320 px y 1280 px, con foco visible y errores en texto
**Para** poder usarla con teclado y en pantallas chicas

**Criterios de aceptación**:
- [ ] Sin desplazamiento horizontal de la página a 320 px; tablas con scroll propio
- [ ] Foco visible; controles recorribles con teclado
- [ ] Errores en texto, no solo color; `alt` correcto en imágenes

**Reglas relacionadas**: RN-UI-05, RN-UI-06, RN-UI-07, RN-UI-08

## Épica 3: Datos locales, catálogo y filtro (Ejercicio 3 — 15 pts)

### US-005 — Datos seed e identificadores estables
**Como** sistema
**Quiero** arrays de libros, editoriales, géneros, autores y clientes con ids estables y mínimos (6/2/2/3/3)
**Para** que todas las vistas y relaciones funcionen

**Criterios de aceptación**:
- [ ] ≥6 libros, 2 editoriales, 2 géneros, 3 autores, 3 clientes
- [ ] Cada libro referencia editorial y autores existentes; género opcional válido

**Reglas relacionadas**: RN-CAT-05

### US-006 — Búsqueda por título
**Como** visitante
**Quiero** buscar libros por título con coincidencia parcial e insensible a mayúsculas
**Para** encontrar un libro rápido

**Criterios de aceptación**:
- [ ] Trim + case-insensitive + parcial
- [ ] Vacío ⇒ catálogo completo; sin coincidencias ⇒ mensaje claro

**Reglas relacionadas**: RN-CAT-01, RN-CAT-02, RN-CAT-03

## Épica 4: Alta de libros y clientes (Ejercicio 4 — 15 pts)

### US-007 — Alta de libro validada
**Como** registrador
**Quiero** registrar un libro con título, ISBN, precio, editorial, género opcional y ≥1 autor
**Para** incorporarlo al catálogo

**Criterios de aceptación**:
- [ ] Selectores generados desde datos locales; género con «Sin clasificar»
- [ ] Validaciones: título/ISBN no vacíos, ISBN único (sin espacios/guiones), precio > 0, editorial y autores existentes, ≥1 autor
- [ ] Errores cerca del formulario; alta correcta actualiza listado y selectores sin recargar

**Reglas relacionadas**: RN-LIB-01…RN-LIB-08

### US-008 — Alta de cliente validada
**Como** registrador
**Quiero** registrar un cliente con nombre completo y email válido y único
**Para** poder usarlo en ventas

**Criterios de aceptación**:
- [ ] Validaciones: campos no vacíos, formato de email, email único (trim + case-insensitive)
- [ ] Alta correcta actualiza listado y selección de ventas sin recargar

**Reglas relacionadas**: RN-CLI-01…RN-CLI-04

## Épica 5: Venta simulada e historial (Ejercicio 5 — 20 pts)

### US-009 — Composición de venta
**Como** vendedor
**Quiero** seleccionar cliente, agregar renglones (libro + cantidad), editar cantidades y quitar renglones
**Para** armar la venta antes de confirmarla

**Criterios de aceptación**:
- [ ] Sin libros repetidos (modifica cantidad o informa duplicado)
- [ ] Cantidades enteras > 0; sin confirmar sin cliente/renglones inválidos
- [ ] Subtotales y total con 2 decimales

**Reglas relacionadas**: RN-VTA-01…RN-VTA-06

### US-010 — Confirmación con precio histórico
**Como** consultor de historial
**Quiero** que al confirmar se copie el precio unitario al renglón
**Para** que el historial no cambie si luego cambia el precio de catálogo

**Criterios de aceptación**:
- [ ] Se registran id, fecha, cliente, renglones y total
- [ ] Precio unitario histórico; formulario limpiado; mensaje de resultado

**Reglas relacionadas**: RN-VTA-07, RN-VTA-08

### US-011 — Historial inmutable
**Como** consultor
**Quiero** ver el listado de ventas y el detalle de renglones
**Para** auditar ventas pasadas

**Criterios de aceptación**:
- [ ] Lista: id, fecha, cliente, total + acción «Ver detalle»
- [ ] Detalle con renglones; sin edición ni eliminación

**Reglas relacionadas**: RN-VTA-09

## Épica 6: Persistencia y documentación (Ejercicio 6 — 10 pts)

### US-012 — Persistencia sin duplicados
**Como** usuario
**Quiero** que al recargar se conserven libros, clientes y ventas sin duplicar el seed
**Para** no perder el trabajo

**Criterios de aceptación**:
- [ ] `localStorage` con claves documentadas
- [ ] Seed solo en primer inicio

**Reglas relacionadas**: RN-PER-01, RN-PER-02

### US-013 — README de entrega
**Como** evaluador
**Quiero** un README con autores, pasos para abrir sin npm, navegación, funcionalidades, ubicación de datos iniciales, límites de `localStorage` y resultados de los 8 casos manuales
**Para** evaluar y reproducir la verificación

**Criterios de aceptación**:
- [ ] Los 8 casos manuales ejecutados y registrados con resultado real (sin fingir aprobaciones)
- [ ] Se identifica la ubicación del catálogo guardado para la comprobación guiada de precio histórico

**Reglas relacionadas**: RN-PER-03
