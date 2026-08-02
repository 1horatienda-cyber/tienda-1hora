# Tienda Online — Arquitectura y Plan de Desarrollo

Marca propia, un solo vendedor, catálogo con pedidos vía WhatsApp (sin pagos online por ahora), República Dominicana, precios en RD$.

---

## 1. Visión general de la arquitectura

Monorepo con dos aplicaciones independientes que se comunican por API REST:

```
tienda-online/
├── backend/     → NestJS + TypeScript + PostgreSQL (API)
├── frontend/    → Next.js + TypeScript + Tailwind (tienda + panel admin)
└── docker-compose.yml
```

**Por qué esta separación:** el frontend (catálogo público + panel admin) y el backend (API, reglas de negocio, base de datos) escalan y se despliegan de forma independiente. Cuando más adelante quieras una app móvil, esta ya podrá consumir la misma API sin tocar el backend.

### 1.1 Backend (NestJS)

Arquitectura modular, un módulo por dominio de negocio:

- `users` — usuarios del sistema (por ahora solo tú como admin; preparado para clientes registrados en el futuro).
- `auth` — autenticación del panel admin con JWT. Preparado para agregar OAuth (Google/Apple/Facebook/Microsoft) después.
- `categories` — categorías de productos.
- `products` — catálogo de productos, imágenes, precios.
- `inventory` — entradas/salidas de mercancía, stock, alertas de bajo inventario.
- `orders` — pedidos, estados, historial.
- `config` — configuración general de la tienda (datos del negocio, WhatsApp, zonas de envío).

Cada módulo sigue el mismo patrón: `entity` (tabla) → `dto` (validación de entrada) → `service` (lógica) → `controller` (rutas HTTP).

### 1.2 Frontend (Next.js)

- **Tienda pública**: Inicio, Catálogo, Categorías, Producto, Carrito, Marca, Contacto, Envíos, FAQ.
- **Panel admin** (`/admin`, protegido): productos, categorías, inventario, pedidos, estadísticas.
- Carrito manejado en el cliente (estado global con Zustand), sin necesidad de cuenta de usuario para comprar.
- Al finalizar el pedido: se guarda en el backend y se abre WhatsApp con un mensaje pre-armado con el resumen del pedido.

### 1.3 Base de datos: PostgreSQL

Elegida por robustez, soporte de relaciones fuertes (pedidos↔productos↔inventario) e integridad transaccional, clave para no vender lo que no hay en stock.

---

## 2. Modelo de datos (entidades principales)

**users**
`id, name, email, password_hash, role (admin|customer), phone, created_at`
→ Hoy solo se usa `role=admin`. `customer` queda listo para cuando actives registro de clientes.

**categories**
`id, name, slug, description, image_url, is_active, created_at`

**products**
`id, name, slug, description, price, sku (código), category_id, is_active, is_featured, is_new, created_at, updated_at`

**product_images**
`id, product_id, url, order, is_primary`
→ Tabla separada (no un solo campo) porque cada producto tendrá varias fotos.

**inventory**
`id, product_id, quantity_available, low_stock_threshold, updated_at`
→ Una fila por producto: la cantidad "actual". Se actualiza automáticamente cuando se registran movimientos.

**inventory_movements**
`id, product_id, type (entrada|salida|ajuste), quantity, reason, created_by, created_at`
→ Historial completo de movimientos, base para trazabilidad y futura integración con facturación.

**orders**
`id, customer_name, customer_phone, customer_whatsapp, delivery_type (retiro|negocio|domicilio), delivery_address, status, total, notes, created_at, updated_at`

**order_items**
`id, order_id, product_id, product_name (snapshot), quantity, unit_price, subtotal`
→ Se guarda una "foto" del nombre/precio al momento de comprar, para que si cambias el precio después, los pedidos viejos no se alteren.

**store_config**
`id, business_name, whatsapp_number, address, business_hours, shipping_info, social_links (json)`
→ Una sola fila; controla los textos/datos que hoy pondrías "a mano" en el código.

### Relaciones clave
- `category (1) → products (N)`
- `product (1) → product_images (N)`
- `product (1) ↔ inventory (1)`
- `product (1) → inventory_movements (N)`
- `order (1) → order_items (N)`
- `product (1) → order_items (N)`

---

## 3. Estados de pedido

`recibido → preparando → listo_para_retirar / en_camino → entregado`
con posibilidad de pasar a `cancelado` en cualquier punto antes de `entregado`.

---

## 4. Preparado para el futuro (sin implementarlo aún)

| Función futura | Cómo queda preparada la arquitectura hoy |
|---|---|
| Login con Google/Apple/Facebook/Microsoft | Módulo `auth` ya separado de `users`; solo se agregan estrategias OAuth adicionales. |
| Pagos online | `orders` ya tiene `total` y `status`; se añade tabla `payments` y un estado `pagado` sin romper nada. |
| Facturación automática | `inventory_movements` y `order_items` ya guardan todo el detalle necesario para generar facturas. |
| App móvil | Backend ya es una API REST independiente del frontend web. |
| Chat interno / IA / clientes frecuentes | Se agregan como módulos nuevos (`chat`, `loyalty`) sin tocar los existentes. |
| Redis | Ya incluido en `docker-compose.yml`, listo para cache o colas cuando se necesite. |

---

## 5. Plan de desarrollo por etapas

**Etapa 0 — Fundación (hecho en este scaffold)**
Estructura de carpetas, entidades de base de datos, `docker-compose`, configuración base de NestJS y Next.js.

**Etapa 1 — Backend core**
CRUD de `categories` y `products` + subida de imágenes, `inventory` con movimientos y alertas de stock bajo.

**Etapa 2 — Frontend público**
Home, Catálogo (con búsqueda y filtros), página de Producto, Carrito, flujo de pedido con selección de entrega + generación de mensaje de WhatsApp.

**Etapa 3 — Panel admin**
Login admin (JWT), CRUD visual de productos/categorías, gestión de inventario, gestión de pedidos con cambio de estado.

**Etapa 4 — Contenido y pulido**
Páginas: Marca, Contacto, Envíos, FAQ, Promociones, Destacados/Nuevos. Animaciones, responsive fino, SEO básico, optimización de imágenes.

**Etapa 5 — Estadísticas y cierre**
Dashboard con productos más vendidos, historial de movimientos, pruebas finales y despliegue.

---

## 6. Stack técnico confirmado

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Zustand (carrito).
- **Backend**: NestJS, TypeScript, TypeORM.
- **DB**: PostgreSQL 16.
- **Infra local**: Docker Compose (postgres + redis + backend + frontend).
- **Control de versiones**: Git.
