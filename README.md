# Parcial 1: Frontend de una Librería — Programación III UTN

Sistema frontend integral para catálogo, administración y simulación de ventas de una librería editorial. Desarrollado exclusivamente con **HTML5 semántico**, **CSS3 nativo adaptable** y **JavaScript (ES6+) nativo**, sin frameworks, librerías externas ni herramientas de compilación.

---

## 1. Identificación del Trabajo y Autores

* **Institución:** Universidad Tecnológica Nacional (UTN)
* **Carrera:** Tecnicatura Universitaria en Programación
* **Materia:** Programación III
* **Evaluación:** Parcial 1 — Unidad HTML, CSS y JavaScript
* **Docente / Revisor:** Prof. Matías Torres
* **Integrantes / Autores:** 
  * Estudiante: *(Completar con Nombre y Apellido)*
  * Legajo: *(Completar con N° de Legajo)*

---

## 2. Pasos para abrir el proyecto sin npm

El proyecto no requiere Node.js, `npm`, servidores locales ni empaquetadores. Para ejecutarlo:

1. Clonar o descomprimir la carpeta del proyecto en su equipo local.
2. Localizar el archivo principal [index.html](file:///c:/Users/Administrador/Documents/Trabajos%20UTN/HTML%20UTN/parcial_1/index.html).
3. Abrirlo directamente con cualquier navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari):
   * Haciendo doble clic sobre `index.html`, o
   * Clic derecho > *Abrir con* > su navegador habitual.

---

## 3. Navegación entre Vistas (Arquitectura SPA)

La aplicación fue estructurada como una **Single Page Application (SPA)** accesible y semántica contenida en [index.html](file:///c:/Users/Administrador/Documents/Trabajos%20UTN/HTML%20UTN/parcial_1/index.html), controlada mediante la barra de navegación superior y el orquestador [js/app.js](file:///c:/Users/Administrador/Documents/Trabajos%20UTN/HTML%20UTN/parcial_1/js/app.js).

Las 5 vistas del sistema son:

1. **Catálogo (`#catalogo`):** Presentación de libros en cuadrícula adaptable, buscador por título y detalles de cada obra (título, ISBN, editorial, autores, precio y género o «Sin clasificar»).
2. **Libros (`#libros`):** Formulario para registrar nuevas obras en el catálogo e inventario general en tabla scrollable.
3. **Clientes (`#clientes`):** Formulario para registrar compradores con validación de nombre y email único, junto a la tabla de clientes activos.
4. **Ventas (`#ventas`):** Emisión y cálculo de órdenes en tiempo real con selección de cliente, adición y edición de renglones, acumulación de unidades de libros repetidos y cálculo con 2 decimales.
5. **Historial (`#historial`):** Registro cronológico de ventas confirmadas con detalle consultable de renglones y valores históricos congelados (inmutables).

*Nota sobre accesibilidad:* Se puede navegar entre vistas utilizando el teclado (`Tab`, `Shift + Tab` y `Enter`/`Espacio`), cuenta con enlace de salto rápido (`skip-link`) y soporte nativo para los botones Atrás / Adelante del historial del navegador mediante sincronización por `#hash`.

---

## 4. Funcionalidades Implementadas y Pendientes

### Implementadas (100% de la consigna)
* [x] **HTML semántico:** Encabezado (`<header>`), navegación (`<nav>`), área de búsqueda (`<search>`), paneles principales (`<main>`, `<section>`), tarjetas (`<article>`), paneles complementarios (`<aside>`), pie (`<footer>`), tablas con encabezados `<th>` y scopes.
* [x] **CSS propio y diseño adaptable (320 px a 1280 px):** Sistema de variables CSS con paleta vino/borgoña (`#581825`) y cremas (`#fcfaf6`, `#f4efe6`), tipografía serif editorial combinada con sans-serif neutra, Flexbox y Grid, contenedores desplazables para tablas estrechas (`.table-responsive`) y foco visible (`:focus-visible`).
* [x] **Manejo de datos locales y catálogo:** Semillas con 6 libros, 3 editoriales, 3 géneros, 4 autores y 3 clientes iniciales. Inserción segura en el DOM mediante nodos y `textContent` (prevención de vulnerabilidades XSS).
* [x] **Buscador en catálogo:** Filtro por título insensible a mayúsculas/minúsculas, insensible a espacios exteriores (`trim()`) y soporte de coincidencias parciales con mensajes de estado y lista vacía.
* [x] **Alta de libros:** Generación dinámica de selectores (editorial, género con «Sin clasificar», checkboxes accesibles para selección múltiple de autores). Validación de título no vacío, ISBN no vacío y no repetido (sin guiones ni espacios), precio numérico mayor a cero y relaciones válidas.
* [x] **Alta de clientes:** Validación de nombre completo no vacío, formato de correo electrónico y unicidad de email insensible a mayúsculas y espacios.
* [x] **Venta simulada:** Selección de cliente, renglones con cantidades enteras > 0, detección de libros repetidos (incremento automático de cantidad), modificación de cantidades y eliminación de renglones en borrador. Cálculo de subtotales y total general redondeados a 2 decimales.
* [x] **Historial y congelamiento de precio histórico:** Al confirmar la venta se clonan y congelan el precio unitario y subtotales en el comprobante. Las ventas confirmadas son inmutables desde la interfaz.
* [x] **Persistencia en `localStorage`:** Los datos se conservan entre recargas sin duplicar las semillas iniciales.

### Pendientes
* Ninguna. Todo el alcance técnico y funcional solicitado en los ejercicios 1 a 6 fue cubierto.

---

## 5. Ubicación de los Datos Iniciales

Los datos semilla iniciales se encuentran estructurados en el archivo [js/data.js](file:///c:/Users/Administrador/Documents/Trabajos%20UTN/HTML%20UTN/parcial_1/js/data.js):

* `INITIAL_EDITORIALES`: 3 editoriales (`ED01`, `ED02`, `ED03`).
* `INITIAL_GENEROS`: 3 géneros (`GEN01`, `GEN02`, `GEN03`).
* `INITIAL_AUTORES`: 4 autores (`AUT01`, `AUT02`, `AUT03`, `AUT04`).
* `INITIAL_CLIENTES`: 3 clientes ficticios con emails válidos (`CLI-001`, `CLI-002`, `CLI-003`).
* `INITIAL_LIBROS`: 6 libros iniciales vinculados con sus editoriales y autores. El libro `LIB-006` posee `generoId: null` para validar la etiqueta «Sin clasificar» y múltiples autores (`AUT01` y `AUT02`) para validar coautoría.

---

## 6. Funcionamiento y Límites de `localStorage`

La persistencia se gestiona a través de [js/storage.js](file:///c:/Users/Administrador/Documents/Trabajos%20UTN/HTML%20UTN/parcial_1/js/storage.js) utilizando la API de `window.localStorage`.

### Claves utilizadas
* `libreria_borgona_libros_v1`: Array JSON con los libros registrados.
* `libreria_borgona_clientes_v1`: Array JSON con los clientes registrados.
* `libreria_borgona_ventas_v1`: Array JSON con las ventas confirmadas.

### Límites y características de `localStorage`
1. **Dependencia del navegador y perfil:** Los datos guardados pertenecen exclusivamente al navegador específico y al perfil de usuario que abrió la aplicación.
2. **Dependencia del origen / ubicación de apertura:** Si el archivo se abre desde una ruta o protocolo diferente (por ejemplo, `file:///C:/ruta1` vs `file:///D:/ruta2` o mediante `localhost`), el navegador genera un espacio de almacenamiento aislado e independiente.
3. **No sincronización entre usuarios:** La información es estrictamente local en el cliente y no se comparte con otros dispositivos, redes ni usuarios remotos.
4. **Capacidad de almacenamiento:** Está restringido por el navegador a aproximadamente 5 MB a 10 MB por origen, capacidad más que suficiente para los registros de catálogo y ventas simuladas.
5. **Modo incógnito:** Si se ejecuta en ventana privada, el almacenamiento se destruye al cerrar la sesión del navegador.

---

## 7. Procedimiento de Comprobación del Precio Histórico

Para verificar de forma guiada que el historial conserva el precio histórico inmutable aunque el catálogo sea modificado posteriormente:

1. **Emitir una venta:**
   * Ir a la pestaña **Ventas**.
   * Seleccionar un cliente (por ejemplo, *Ana Gómez*).
   * Agregar el libro *"Ficciones"* (cuyo precio actual de catálogo es `$1500.00`) con cantidad `2`.
   * Agregar el libro *"Rayuela"* (cuyo precio actual de catálogo es `$2000.00`) con cantidad `1`.
   * Presionar **"✓ Confirmar y registrar venta"**. El total emitido será `$5000.00` (subtotales `$3000.00` y `$2000.00`).
2. **Consultar el comprobante:**
   * Ir a **Historial** y presionar **"Ver detalle"** en la venta generada. Verificar que figuren `$1500.00` y `$2000.00`.
3. **Alterar el precio en el catálogo vía `localStorage`:**
   * Abrir las herramientas de desarrollador del navegador (`F12` o `Ctrl + Shift + I`).
   * Ir a la pestaña **Aplicación** (o *Almacenamiento* / *Application*) > **Almacenamiento Local** (*Local Storage*) > seleccionar el origen actual.
   * Buscar la clave `libreria_borgona_libros_v1`.
   * Hacer doble clic en su valor JSON y buscar el libro con id `"LIB-001"` (*"Ficciones"*).
   * Modificar su `"precio": 1500` a `"precio": 9999.00` (sin tocar la clave `libreria_borgona_ventas_v1`).
   * Guardar el cambio presionando `Enter`.
4. **Comprobar la inmutabilidad:**
   * Recargar la página (`F5`).
   * En el **Catálogo**, observar que *"Ficciones"* ahora figura con precio `$9999.00`.
   * Dirigirse a la vista **Historial** y hacer clic en **"Ver detalle"** de la venta emitida en el paso 1.
   * **Resultado observado:** El precio unitario histórico en el detalle de la venta se mantiene intacto en `$1500.00`, su subtotal en `$3000.00` y el total en `$5000.00`.

---

## 8. Registro de Resultados de Casos de Prueba Manuales

| Caso de prueba | Resultado esperado | Resultado observado | Estado |
| :--- | :--- | :--- | :---: |
| **1. Búsqueda con una parte del título en mayúsculas; luego búsqueda vacía y texto inexistente** | Coincidencias sin distinguir mayúsculas; catálogo completo; mensaje sin resultados. | Al buscar "FICC", lista correctamente *Ficciones*; al buscar en blanco o pulsar "Mostrar todos", restaura los 6 libros; al buscar "Inexistente 123", oculta la lista y presenta el mensaje de búsqueda sin resultados con botón para restablecer. | **Aprobado** |
| **2. Alta de libro con ISBN existente y luego con ISBN nuevo** | El duplicado se rechaza; el válido aparece en catálogo y selección de venta. | Al intentar ingresar un libro con ISBN `978-950-04-0001-1` (incluso variando espacios o guiones), el sistema bloquea el alta y marca el error cerca del campo; al colocar un ISBN nuevo válido (`978-987-00-1111-1`), se añade inmediatamente al catálogo, a la tabla de inventario y al selector de ventas sin recargar. | **Aprobado** |
| **3. Alta de cliente con email inválido, email existente en mayúsculas y email nuevo** | Se rechazan los dos primeros; el nuevo aparece en listado y selección. | Se rechaza `cliente@` por formato inválido; se rechaza `ANA.GOMEZ@GMAIL.COM` por estar ya registrado en minúsculas; al registrar `roberto.perez@empresa.com`, se guarda exitosamente y se actualiza el selector de ventas. | **Aprobado** |
| **4. Venta sin cliente, cantidad cero, negativa o decimal; libro repetido** | No se confirma; el duplicado no crea otro renglón. | Se bloquea la confirmación si no se eligió cliente; los valores `0`, `-2` o `1.5` en cantidad arrojan error de validación; al agregar un libro ya presente en el detalle, se acumulan las unidades en el renglón preexistente sin duplicar filas. | **Aprobado** |
| **5. Venta válida: dos unidades a 1500 y una a 2000** | Subtotales 3000 y 2000; total 5000; detalle conservado en el historial. | La venta calcula subtotal 1 = `$3000.00`, subtotal 2 = `$2000.00`, total general = `$5000.00`. Al presionar confirmar, se limpia el formulario y la venta se lista en Historial con su detalle completo. | **Aprobado** |
| **6. Venta confirmada y cambio exclusivo del precio de catálogo guardado, en una copia de prueba del proyecto** | Al consultar nuevamente el historial después de recargar, el precio unitario, los subtotales y el total de esa venta conservan los valores confirmados. | Tras alterar el precio de catálogo de 1500 a 9999 en `localStorage` y recargar la página, el comprobante histórico sigue mostrando precio unitario de `$1500.00`, subtotal `$3000.00` y total `$5000.00`. | **Aprobado** |
| **7. Recarga después de altas y venta** | Se recuperan datos sin duplicar ejemplos ni ventas. | Al recargar el navegador (`F5`), se mantienen todos los libros, clientes y ventas creados; los elementos iniciales no se duplican. | **Aprobado** |
| **8. Navegación por teclado y anchos de 320 px y 1280 px** | Foco visible, controles utilizables y tabla con desplazamiento propio si lo necesita. | A 320 px no existe desbordamiento horizontal en la página (`overflow-x: hidden` en body); las tablas se desplazan suavemente dentro de su contenedor `.table-responsive`; la navegación por `Tab` presenta un anillo de foco destacado de alto contraste. | **Aprobado** |

---

## 9. Procedencia de Imágenes Ajenas

* **Aclaración:** No se emplearon imágenes externas ni recursos procedentes de terceros.
* Los elementos visuales, iconos informativos e indicadores ornamentales fueron resueltos mediante **tipografía, entidades tipográficas nativas (Unicode / caracteres estándar)** y estilos vectoriales de CSS puro para garantizar portabilidad sin dependencias.

