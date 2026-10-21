Este documento fija los estándares de diseño, codificación, validación y revisión para cualquier agente que opere en este proyecto. Las reglas aquí definidas son de cumplimiento estricto e innegociable ante cualquier cambio, extensión o refactorización.

El proyecto consiste en utilidades críticas de seguridad y validación de credenciales en Python. Toda función desarrollada debe ser determinista, libre de efectos secundarios y adherir rigurosamente al principio de diseño defensivo: \*\*Fallar rápido (Fail-Fast)\*\*.

Type Hints: Obligatorios en todos los parámetros de entrada y valores de retorno. No usar tipos genéricos (`Any`); especificar tipos primitivos o uniones explícitas si aplica.

Documentación: Toda función debe incluir docstring con formato \*\*Google Style\*\*, documentando de manera exhaustiva las secciones:

`Args:` descripción y tipo de cada parámetro.

`Returns:` descripción del tipo retornado y su semántica.

`Raises:` cada una de las excepciones que la función puede disparar y bajo qué condición.

Constantes: Toda regla fija o umbral numérico (longitudes mínimas/máximas, listas de caracteres prohibidos, expresiones regulares base) debe declararse a nivel de módulo con nombres en formato `UPPER\_SNAKE\_CASE`. Jamás utilizar "números mágicos" dentro del cuerpo de la función.

Nombres: Variables y funciones deben seguir `snake\_case` descriptivo en idioma español (o el estándar del proyecto).



Antes de procesar la lógica de negocio, se deben validar las entradas al inicio de la ejecución respetando la siguiente jerarquía de excepciones:



Siempre verificar explícitamente el tipo de dato recibido mediante `isinstance()`.

Si la entrada es `None` o un tipo incompatible, disparar inmediatamente `TypeError`.

Mensaje estándar: `"El valor ingresado debe ser una cadena de texto"`.



Las validaciones deben ejecutarse en orden secuencial lógico (longitudes antes que inspección de contenido).

Cada fallo debe lanzar un `ValueError` con un mensaje descriptivo, claro e inequívoco para debugging y trazabilidad.

Restricciones base mínimas requeridas:

Longitud inferior al mínimo permitido: `"La contraseña es demasiado corta: debe tener al menos {MIN} caracteres"`.

Longitud superior al máximo permitido: `"La contraseña es demasiado larga: no debe superar los {MAX} caracteres"`.

Presencia de espacios en blanco (`" " in password`): `"La contraseña no debe contener espacios en blanco"`.

Ausencia de caracteres obligatorios (por ejemplo, dígitos numéricos): `"La contraseña debe incluir al menos un número"`.



Al modificar código existente o agregar nuevas reglas:

No omitir validaciones preexistentes: Cualquier extensión solicitada (ej. caracteres especiales, mayúsculas) debe sumarse como una validación adicional sin relajar ni eliminar los chequeos de tipo o longitud previos.

Cobertura de Casos Límite: Todo cambio debe contemplar explícitamente casos borde:

Cadenas vacías (`""`).

Entradas compuestas únicamente por espacios o caracteres de control (`\\t`, `\\n`).

Cadenas en los límites exactos de longitud (`MIN - 1`, `MIN`, `MAX`, `MAX + 1`).

Entradas nulas (`None`) y tipos numéricos pasados erróneamente (`12345678`).

Verificación: Siempre se debe verificar que las excepciones no queden atrapadas en bloques `try/except` internos vacíos o genéricos. La función debe fallar de forma ruidosa y explícita ante cualquier violación de las reglas.

