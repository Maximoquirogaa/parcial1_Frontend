# Preguntas Abiertas

## Inconsistencias detectadas

No se detectaron inconsistencias fuertes entre la consiga y el HTML base. Nota menor:

### IN-01 — Género «Sin clasificar» con corchetes dobles
**HTML base dice**: `&lt;&lt;Sin clasificar&gt;&gt;` (es decir, `<<Sin clasificar>>`).
**Consigna dice**: «Sin clasificar» (comillas latinas simples).
**Impacto**: puramente cosmético; no afecta validaciones ni datos.
**Resolución propuesta**: unificar a «Sin clasificar» (comillas latinas) en toda la interfaz.

## Preguntas abiertas (priorizadas)

| Prioridad | Pregunta | Bloquea | Decisor |
|-----------|----------|---------|---------|
| Baja | ¿Naming exacto de las claves de `localStorage`? (propuesta: `libreria_libros`, `libreria_clientes`, `libreria_ventas`) | Ejercicio 6 (persistencia + README) | Estudiante |
| Baja | ¿Los scripts se cargan con `defer` o al final del `<body>`? (ambos válidos; se propone final de body) | Arquitectura detalle | Estudiante |
| Baja | ¿Formato de fecha en historial: ISO (`2026-10-14`) o local (`14/10/2026`)? El HTML base usa ISO. | Ejercicio 5/6 (historial) | Estudiante |
| Baja | ¿Se implementa cambio de vista por `data-target` (HTML base) o por enlaces `<a href="#...">`? | Ejercicio 1 (navegación) | Estudiante |
| Informativa | La consiga permite "modificar cantidad o informar duplicado" — se decidió modificar cantidad (DD-07). ¿Confirmado? | Ejercicio 5 | Estudiante |

Ninguna pregunta bloquea el arranque de la implementación; todas son decisiones de detalle que se pueden resolver al momento de codificar cada ejercicio.
