# Spec Delta

## Purpose

Define la identidad visual y la presentación adaptable de la aplicación: paleta borgoña + crema, tipografía y espaciado consistentes, layout Flexbox o Grid responsive, clases reutilizables de UI y criterios de accesibilidad (foco visible, contraste, errores en texto) verificables a 320 px y 1280 px.

## ADDED Requirements

### Requirement: Identidad visual borgoña + crema
The system SHALL aplicar una identidad visual coherente con CSS en archivo externo, usando borgoña como color primario y crema como fondo/base, definida mediante custom properties y aplicada de forma consistente en toda la interfaz.

#### Scenario: CSS externo con variables
- **WHEN** se carga la aplicación
- **THEN** el estilo proviene de un archivo CSS externo y los colores primario/fondo se declaran como custom properties (variables CSS)

#### Scenario: Coherencia de paleta en las vistas
- **WHEN** se navega por las cinco vistas
- **THEN** los colores de encabezado, navegación, botones y fondos reflejan la paleta borgoña + crema de manera consistente

### Requirement: Layout con Flexbox o Grid
The system SHALL organizar el layout de header, navegación y contenido principal con Flexbox o Grid.

#### Scenario: Uso de Flexbox o Grid en el layout
- **WHEN** se inspecciona el CSS del layout
- **THEN** header, nav y main se posicionan con Flexbox o Grid (no solo con posicionamiento absoluto o flotantes)

### Requirement: Clases reutilizables de UI
The system SHALL definir clases CSS reutilizables para los elementos equivalentes entre vistas: tarjetas, formularios, botones, tablas y mensajes de estado.

#### Scenario: Tarjetas de catálogo con clase común
- **WHEN** se renderizan artículos del catálogo
- **THEN** cada tarjeta usa una clase CSS compartida para estilo de borde, fondo, padding y radio

#### Scenario: Botones y formularios consistentes
- **WHEN** se comparan los formularios y botones de distintas vistas
- **THEN** los elementos equivalentes comparten clases CSS y se ven iguales

### Requirement: Foco visible y recorrido por teclado
The system SHALL mostrar un indicador de foco visible en todos los controles interactivos y permitir recorrerlos con el teclado.

#### Scenario: Indicador de foco visible
- **WHEN** un control (botón, input, select, textarea, enlace) recibe foco mediante el teclado
- **THEN** el CSS aplica un estilo de foco visible (por ejemplo `:focus-visible` con outline o sombra) distinguible del estado normal

#### Scenario: Recorrido de teclado
- **WHEN** el usuario presiona Tab / Shift+Tab
- **THEN** el foco avanza/retrocede entre los controles de la vista visible en orden lógico y cada uno muestra el indicador de foco

### Requirement: Responsive a 320 px y 1280 px
The system SHALL presentar textos y controles legibles sin desplazamiento horizontal de la página a 320 px y a 1280 px de ancho.

#### Scenario: Sin scroll horizontal a 320 px
- **WHEN** el viewport mide 320 px de ancho
- **THEN** el cuerpo de la página no genera scroll horizontal; el contenido se adapta (por ejemplo apilando o reduciendo espacios)

#### Scenario: Tablas con scroll propio
- **WHEN** una tabla es más ancha que su contenedor
- **THEN** solo el contenedor de la tabla se desplaza horizontalmente (`overflow-x: auto`), sin afectar el ancho de la página

### Requirement: Errores expresados con texto
The system SHALL expresar los mensajes de error con texto y no depender únicamente del color para su identificación.

#### Scenario: Mensaje de error legible sin color
- **WHEN** se muestra un mensaje de error de validación o de operación
- **THEN** el mensaje contiene texto descriptivo (no es solo un ícono o un color); el estilo puede usar color además del texto, nunca solo el color

### Requirement: Imágenes con alt apropiado
The system SHALL incluir en cada imagen informativa un atributo `alt` descriptivo; las imágenes decorativas usarán `alt` vacío o serán decorativas por CSS.

#### Scenario: Imagen informativa
- **WHEN** existe una imagen que aporta información
- **THEN** tiene un `alt` con texto que describe su contenido

#### Scenario: Imagen decorativa
- **WHEN** existe una imagen puramente decorativa
- **THEN** su `alt` está vacío o no se repite información ya presente en el texto
