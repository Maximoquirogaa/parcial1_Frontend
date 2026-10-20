# Visión y Objetivos

## Propósito del sistema

Frontend estático de una librería que presenta su catálogo y registra libros, clientes y ventas, con todos los datos y operaciones simulados en el navegador. El proyecto corresponde al **Parcial 1 de Programación III (UTN)** — unidad HTML, CSS y JavaScript — y busca demostrar interfaces semánticas, estilos propios, JavaScript nativo, validaciones de entrada, persistencia local y casos de prueba manuales reproducibles.

## Objetivos por actor

| Actor | Objetivo principal | Objetivos secundarios |
|---|---|---|
| Visitante / usuario de la librería | Consultar el catálogo de libros y buscar por título | Navegar entre vistas de forma clara |
| Registrador (operador del formulario) | Dar de alta libros y clientes validando los datos | Ver los listados actualizados sin recargar |
| Vendedor (operador de ventas) | Componer una venta con cliente y renglones | Verificar el historial con precios históricos |
| Evaluador (docente) | Verificar funcionamiento, accesibilidad y documentación | Reproducir los casos manuales del README |

## Alcance v1.0 (Parcial 1)

- 5 vistas con navegación clara: Catálogo, Libros, Clientes, Ventas, Historial (SPA por secciones o múltiples páginas).
- HTML semántico, CSS propio en archivos externos, JavaScript nativo (sin frameworks, librerías ni CDNs).
- Catálogo con buscador por título (parcial, case-insensitive, trim).
- Alta de libros (título, ISBN, precio, editorial, género opcional, ≥1 autor) y de clientes (nombre completo, email) con validaciones.
- Venta simulada: cliente + renglones (libro, cantidad), sin duplicados, subtotales y total con 2 decimales, precio unitario histórico.
- Historial de ventas con detalle inmutable.
- Persistencia en `localStorage` (libros, clientes, ventas) con seed inicial sin duplicación.
- README de entrega con casos manuales y límites de `localStorage`.

## Fuera de alcance

- API, base de datos, servidor, backend o conexión real.
- Autenticación / inicio de sesión real.
- Gestión (alta/baja/modificación) de editoriales, géneros y autores: son datos locales fijos.
- Editar o eliminar libros, clientes o ventas desde la interfaz.
- Stock, cobros, facturación fiscal, envíos.
- Librerías, frameworks, CDNs o herramientas de compilación (`npm`, bundlers).

## Métricas de éxito

- Los 6 ejercicios de la consiga cubiertos (100 puntos): HTML 20, CSS 20, Datos/catálogo 15, Altas 15, Ventas 20, Cierre 10.
- Los 8 casos manuales del Ejercicio 6 pasan y quedan registrados en el README.
- Interfaz usable a 320 px y 1280 px, con foco visible y navegación por teclado.
