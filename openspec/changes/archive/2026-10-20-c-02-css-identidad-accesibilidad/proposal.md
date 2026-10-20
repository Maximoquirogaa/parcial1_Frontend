# Proposal

## Why

El shell HTML (C-01) carece de estilos: sin `css/styles.css` la interfaz no expresa la identidad visual borgoña + crema decidida por el usuario (DD-01), no es responsive a 320 px y no garantiza foco visible ni errores en texto — requisitos del Ejercicio 2 de la consiga (RN-UI-04 a RN-UI-08, US-003, US-004).

## What Changes

- Se crea `css/styles.css` con CSS custom properties: borgoña (`--color-primario`) + crema (`--color-fondo`), tipografía, espaciado y sombras.
- Layout con Flexbox o Grid para header, nav y main, responsive.
- Clases reutilizables: tarjetas (`article`), formularios, botones, tablas, mensajes de error/éxito.
- Accesibilidad: foco visible (`:focus-visible`), contraste suficiente, recorrido por teclado.
- Responsive: sin scroll horizontal de la página a 320 px; tablas con `overflow-x: auto` en su propio contenedor.
- Estados de error expresados con texto (no solo color); `alt` correcto en imágenes informativas.

## Capabilities

### New Capabilities
- `visual-identity`: identidad visual y presentación adaptable de la aplicación: paleta borgoña + crema, tipografía/espaciado, layout Flexbox o Grid, clases reutilizables de UI, foco visible, contraste, responsive a 320/1280 px y mensajes de error en texto.

### Modified Capabilities
<!-- ninguna: app-shell no cambia requerimientos -->

## Impact

- Archivos: nuevo `css/styles.css`; `index.html` solo si alguna clase o `alt` necesita ajuste.
- Sin cambios en JS ni en la capability `app-shell`.
- Dependencias: ninguna nueva (CSS nativo, sin frameworks ni CDNs).
