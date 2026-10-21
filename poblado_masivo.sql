-- ============================================================================
-- poblado_masivo.sql — Poblado masivo puro SQL para PostgreSQL
-- Tablas: cliente, producto, pedido, detalle_pedido (ver Script.sql)
-- Técnica: INSERT INTO ... SELECT generate_series() + random()
-- Sin PL/pgSQL.
-- ============================================================================

BEGIN;

-- Limpieza para hacer el script re-ejecutable y garantizar IDs contiguos
-- (RESTART IDENTITY deja cliente 1..20000, producto 1..50000, pedido 1..200000,
--  lo que permite usar (1 + floor(random() * N)) para las FK aleatorias).
TRUNCATE TABLE detalle_pedido, pedido, producto, cliente RESTART IDENTITY CASCADE;

-- ----------------------------------------------------------------------------
-- 1) 20.000 clientes con emails únicos tipo 'clienteN@test.com'
-- ----------------------------------------------------------------------------
INSERT INTO cliente (nombre, email, telefono, activo)
SELECT
    'Cliente ' || g,
    'cliente' || g || '@test.com',
    '09' || lpad((floor(random() * 9000000) + 1000000)::int::text, 7, '0'),
    (random() < 0.95)
FROM generate_series(1, 20000) AS g;

-- ----------------------------------------------------------------------------
-- 2) 50.000 productos con precios entre 500 y 5000 y stock entre 0 y 200
-- ----------------------------------------------------------------------------
INSERT INTO producto (nombre, precio, stock, activo)
SELECT
    'Producto ' || g,
    round((500 + random() * 4500)::numeric, 2),
    (floor(random() * 201))::int,
    (random() < 0.95)
FROM generate_series(1, 50000) AS g;

-- ----------------------------------------------------------------------------
-- 3) 200.000 pedidos vinculados a clientes aleatorios, fechas último año
-- ----------------------------------------------------------------------------
INSERT INTO pedido (cliente_id, fecha, total, estado, forma_pago)
SELECT
    (1 + floor(random() * 20000))::bigint,
    now() - (random() * INTERVAL '365 days'),
    0.00,
    (ARRAY['pendiente', 'pagado', 'enviado', 'cancelado'])[1 + floor(random() * 4)]::estado_pedido,
    (ARRAY['efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia'])[1 + floor(random() * 4)]::metodo_pago
FROM generate_series(1, 200000) AS g;

-- ----------------------------------------------------------------------------
-- 4) 400.000 registros en detalle_pedido: pedidos y productos aleatorios,
--    cantidad entre 1 y 5.
--    ON CONFLICT evita el fallo por la PK compuesta (pedido_id, producto_id)
--    ante una colisión aleatoria (espacio de 200000 x 50000, ~8 colisiones
--    esperadas en 400k filas); las filas colisionadas se omiten.
--    precio_unitario se copia del catálogo para un dato realista (> 0).
-- ----------------------------------------------------------------------------
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
SELECT
    s.pedido_id,
    s.producto_id,
    s.cantidad,
    p.precio
FROM (
    SELECT
        (1 + floor(random() * 200000))::bigint AS pedido_id,
        (1 + floor(random() * 50000))::bigint  AS producto_id,
        (1 + floor(random() * 5))::int         AS cantidad
    FROM generate_series(1, 400000) AS g
) AS s
JOIN producto AS p ON p.id = s.producto_id
ON CONFLICT (pedido_id, producto_id) DO NOTHING;

-- Recalcula el total de cada pedido a partir de sus líneas
-- (los pedidos sin líneas conservan total = 0.00).
UPDATE pedido AS p
SET total = s.total
FROM (
    SELECT pedido_id, SUM(cantidad * precio_unitario)::numeric(12, 2) AS total
    FROM detalle_pedido
    GROUP BY pedido_id
) AS s
WHERE p.id = s.pedido_id;

COMMIT;

-- ----------------------------------------------------------------------------
-- Estadísticas para el planificador tras la carga masiva
-- ----------------------------------------------------------------------------
ANALYZE cliente;
ANALYZE producto;
ANALYZE pedido;
ANALYZE detalle_pedido;
