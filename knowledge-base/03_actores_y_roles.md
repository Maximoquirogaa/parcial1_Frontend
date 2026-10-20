# Actores y Roles

## Actores del sistema

No hay autenticación real: todos los actores usan la misma interfaz pública. Se describen por rol funcional.

| Actor | Descripción | Cómo interactúa |
|---|---|---|
| Visitante | Quien consulta el catálogo | Busca por título, navega entre vistas |
| Registrador de libros | Da de alta libros en la vista Libros | Completa el formulario de alta; ve el listado |
| Registrador de clientes | Da de alta clientes en la vista Clientes | Completa nombre y email; ve el listado |
| Vendedor | Compone y confirma ventas | Selecciona cliente, agrega renglones, confirma |
| Consultor de historial | Revisa ventas pasadas | Lista ventas y abre el detalle (inmutable) |
| Evaluador (docente) | Verifica la entrega | Ejecuta casos manuales, revisa README y código |

## RBAC — Matriz de permisos

No hay roles técnicos (sin login). Permisos funcionales esperados por vista:

| Vista | Consultar | Crear | Editar | Eliminar |
|---|---|---|---|---|
| Catálogo | ✅ (filtro) | ❌ | ❌ | ❌ |
| Libros (listado) | ✅ | ✅ (alta) | ❌ | ❌ |
| Clientes (listado) | ✅ | ✅ (alta) | ❌ | ❌ |
| Ventas (composición) | ✅ | ✅ (confirmar) | Cantidades/renglones antes de confirmar | Quitar renglón antes de confirmar |
| Historial | ✅ (lista + detalle) | ❌ | ❌ | ❌ |

## Rutas públicas

Todas las vistas son públicas (todo el `index.html`). No hay rutas protegidas.
