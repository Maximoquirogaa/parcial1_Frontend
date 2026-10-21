# Librería UTN — Base de Conocimiento

Base de conocimiento generada a partir de la consiga del Parcial 1 de Programación III (UTN) y el HTML base provisto.

## Índice de Archivos

| Archivo | Contenido |
|---------|-----------|
| [01_vision_y_objetivos.md](01_vision_y_objetivos.md) | Propósito, actores, alcance v1.0, fuera de alcance, métricas de éxito |
| [02_descripcion_general.md](02_descripcion_general.md) | Stack (HTML/CSS/JS nativo), arquitectura de módulos, identidad visual borgoña+crema |
| [03_actores_y_roles.md](03_actores_y_roles.md) | Actores funcionales, matriz de permisos por vista, rutas públicas |
| [04_modelo_de_datos.md](04_modelo_de_datos.md) | Entidades (Libro, Cliente, Venta, Renglón…), ERD, seed data, claves localStorage |
| [05_reglas_de_negocio.md](05_reglas_de_negocio.md) | Reglas codificadas RN-CAT/LIB/CLI/VTA/PER/UI/TEC de la consiga |
| [06_funcionalidades.md](06_funcionalidades.md) | 13 historias de usuario en 6 épicas (una por ejercicio) |
| [07_flujos_principales.md](07_flujos_principales.md) | 7 flujos extremo a extremo con casos de error |
| [08_arquitectura_propuesta.md](08_arquitectura_propuesta.md) | Patrones, estructura de directorios, seguridad, carga de scripts |
| [09_decisiones_y_supuestos.md](09_decisiones_y_supuestos.md) | 8 decisiones documentadas (DD-01…08) + supuestos (SU-01…03) |
| [10_preguntas_abiertas.md](10_preguntas_abiertas.md) | 1 inconsistencia menor + preguntas abiertas no bloqueantes |

## Quick Start para Desarrolladores

1. Entender el dominio → [01](01_vision_y_objetivos.md), [03](03_actores_y_roles.md)
2. Entender los datos → [04](04_modelo_de_datos.md)
3. Entender las reglas → [05](05_reglas_de_negocio.md)
4. Entender la arquitectura → [02](02_descripcion_general.md), [08](08_arquitectura_propuesta.md)
5. Implementar → [07](07_flujos_principales.md), [06](06_funcionalidades.md)
6. Antes de codificar → [10](10_preguntas_abiertas.md)

## Resumen Ejecutivo

Frontend estático de librería para el Parcial 1 de Programación III: 5 vistas (Catálogo, Libros, Clientes, Ventas, Historial) construidas con HTML semántico, CSS propio (paleta borgoña + crema) y JavaScript nativo. Datos ficticios en arrays + `localStorage`, sin frameworks, CDNs, API ni backend. Identidad visual y HTML base definidos por el usuario. Evaluación: 100 puntos en 6 ejercicios.
