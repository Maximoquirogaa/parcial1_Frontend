# Tasks

## 1. Preparación del HTML base

- [x] 1.1 Copiar `docs/base-index.html` a `index.html` en la raíz del proyecto y verificar que el archivo existe
- [x] 1.2 Corregir `lang="en"` a `lang="es"` y verificar el atributo en el tag `<html>`
- [x] 1.3 Unificar el texto «Sin clasificar» (quitar `<< >>` duplicados) en el select de género y verificar que aparece solo con comillas latinas

## 2. Semántica y estructura de vistas

- [x] 2.1 Asegurar que `header`, `nav` y `main` envuelven correctamente encabezado, navegación y contenido; verificar con inspección de DOM
- [x] 2.2 Verificar que existen las 5 secciones con ids `vista-catalogo`, `vista-libros`, `vista-clientes`, `vista-ventas`, `vista-historial`
- [x] 2.3 Quitar los artículos/filas de ejemplo hardcodeados del catálogo, listados de libros/clientes e historial; verificar que los tbody y `.contenedor-catalogo` quedan vacíos

## 3. Labels, botones y tablas

- [x] 3.1 Verificar que cada `input`, `select` y `textarea` tiene un `<label for>` apuntando a su `id`; agregar los que falten
- [x] 3.2 Verificar que todos los `<button>` tienen texto descriptivo (navegación, buscar, guardar, agregar, confirmar, ver detalle)
- [x] 3.3 Verificar que cada `<table>` tiene `<thead>` con `<th>` por columna visible

## 4. Nodos de mensajes de estado

- [x] 4.1 Agregar en la vista catálogo nodos para «catálogo completo», «sin resultados» y estado de búsqueda; verificar que existen y están ocultos por defecto
- [x] 4.2 Agregar en las vistas de libros y clientes nodos para «lista vacía», «éxito» y «error»; verificar presencia y estado oculto
- [x] 4.3 Agregar en la vista de ventas nodo para error de validación y mensaje de venta confirmada; verificar presencia y estado oculto

## 5. Navegación JS

- [x] 5.1 Crear `js/navegacion.js` con escucha de clics en `nav [data-target]` que oculta `.vista` y muestra `#<target>`; verificar que al hacer clic en cada botón la vista correspondiente se muestra sin recargar
- [x] 5.2 Marcar la vista catálogo como visible por defecto al cargar y las demás ocultas; verificar el estado inicial en el navegador
- [x] 5.3 Actualizar el estado activo del botón de navegación (clase o `aria-current`) al cambiar de vista; verificar accesibilidad con teclado

## 6. Integración y verificación final

- [x] 6.1 Enlazar `js/navegacion.js` desde `index.html` con `defer` (o al final del body); verificar que no hay errores de consola
- [x] 6.2 Abrir `index.html` en el navegador y recorrer las 5 vistas por navegación; verificar que solo una está visible a la vez y no hay recarga
- [x] 6.3 Verificar que no quedan datos de ejemplo hardcodeados en catálogo/listados/historial
