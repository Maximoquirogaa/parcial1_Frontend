# Tasks

## 1. Variables y base

- [x] 1.1 Crear `css/styles.css` con sección `:root` que declare custom properties de paleta (borgoña `--color-primario`, crema `--color-fondo`, superficie, texto, error, éxito), espaciado y tipografía del sistema; verificar que `index.html` lo carga y el fondo/encabezado reflejan borgoña + crema
- [x] 1.2 Agregar estilos base (reset ligero de márgenes, `box-sizing`, tipografía legible, `body` con `--color-fondo` y `--color-texto`); verificar texto legible sin estilos de navegador inconsistentes

## 2. Layout Flexbox y Grid responsive

- [x] 2.1 Estilizar `header`, `nav` y `main` con Flexbox mobile-first (bandas apiladas en móvil, nav horizontal en desktop vía media query ~768 px); verificar en 320 px sin scroll horizontal de la página
- [x] 2.2 Estilizar `.contenedor-catalogo` con CSS Grid `auto-fill/minmax` para tarjetas; verificar que las tarjetas se acomodan solas en 320 px y en 1280 px
- [x] 2.3 Revisar reglas de overflow (`min-width: 0` en hijos flex, sin anchos fijos fuera de breakpoints); verificar que a 320 px no hay desplazamiento horizontal del `body`

## 3. Componentes reutilizables

- [x] 3.1 Definir clases de formulario (labels, inputs, selects, textarea: ancho, padding, borde, foco) y aplicarlas verificando consistencia entre los formularios de las vistas libros/clientes/ventas; verificar que todos los campos se ven iguales
- [x] 3.2 Definir clases de botón (primario borgoña con texto crema, secundario, hover/focus) y aplicar a navegación y formularios; verificar que los botones equivalentes comparten estilo
- [x] 3.3 Definir `.tarjeta` para artículos del catálogo (borde, fondo superficie, padding, radio, sombra sutil); verificar visualmente con el contenedor vacío (el render de datos llega en C-03)
- [x] 3.4 Definir `.tabla-contenedor` con `overflow-x: auto` y estilo de tablas (thead borgoña, filas alternadas crema/superficie); envolver cada `<table>` de `index.html` en un `<div class="tabla-contenedor">`; verificar que las tablas siguen presentes con thead y el wrapper existe
- [x] 3.5 Definir `.mensaje-error` y `.mensaje-exito` (fondo, borde, color + indicador textual, padding); verificar que los nodos de estado de `index.html` tienen sus clases y al poblarse con texto se leen como error/éxito sin depender solo del color

## 4. Accesibilidad y ajustes HTML

- [x] 4.1 Agregar regla `:focus-visible` global con outline visible usando `--color-primario`; verificar recorriendo con Tab que cada control muestra el foco
- [x] 4.2 Verificar/ajustar contraste de pares principales (texto oscuro sobre crema, texto crema sobre borgoña, estados hover/focus); documentar verificación rápida en la revisión manual
- [x] 4.3 Revisar `index.html`: imágenes informativas con `alt` descriptivo, decorativas con `alt` vacío (o sin imágenes); verificar que no queda ninguna imagen sin `alt`

## 5. Verificación final

- [x] 5.1 Abrir la app a 320 px: recorrer las 5 vistas, formularios y tablas; verificar legibilidad y cero scroll horizontal de la página (tablas solo dentro de su contenedor)
- [x] 5.2 Abrir a 1280 px: verificar layout de escritorio (nav horizontal, grilla de tarjetas, formularios cómodos)
- [x] 5.3 Recorrer con teclado (Tab/Shift+Tab) una vista con formulario; verificar foco visible en todos los controles
- [x] 5.4 Provocar visualmente un estado de error y uno de éxito (poblar nodos o inspeccionar estilos); verificar que el texto del mensaje es suficiente sin el color
