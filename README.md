# Tienda Online — Marca Propia

Ver `PLAN.md` para la arquitectura completa, el modelo de base de datos y el plan de desarrollo por etapas.

## Cómo correr el proyecto localmente

Requisitos: Docker y Docker Compose instalados.

```bash
# 1. Clona/copia este proyecto y entra a la carpeta
cd tienda-online

# 2. Copia las variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Levanta todo (Postgres, Redis, backend, frontend)
docker compose up --build
```

- Frontend (tienda): http://localhost:3000
- Backend (API): http://localhost:3001/api
- Base de datos: PostgreSQL en el puerto 5432

En desarrollo, `synchronize: true` en TypeORM crea las tablas automáticamente a partir de las entidades — no necesitas escribir SQL a mano para empezar a probar.

## Cargar el catálogo real (1Hora — 51 productos, 13 categorías)

Con `docker compose up` ya corriendo (déjalo en su propia terminal), abre una segunda terminal en la misma carpeta y ejecuta:

```bash
docker compose exec backend npm run seed
```

Esto carga el catálogo completo tomado de la lista de precios de 1Hora (Enero 2026): Audífonos Bluetooth, Audífonos Gamer, Audífonos Alámbricos, Bocinas Bluetooth, Power Bank, Cargadores Qi, Cargadores para Auto, Cargadores 30W/65W, Cargadores Duo 20W, Cargadores PD 20W, Combo Cargadores, Cables y Accesorios (mouse, regleta, dispensador de agua, soporte para teléfono) — **62 productos en total**, cada uno con su código, descripción, precio en RD$, stock inicial y foto real del catálogo. Puedes correrlo las veces que quieras: si un producto ya existe, lo salta en vez de duplicarlo.

Los precios cargados son el precio "desde 3/6 unidades" del catálogo mayorista (el precio por unidad individual, no el de compra por caja completa). 11 de los 62 productos no traían precio impreso en el PDF original — quedaron marcados con `estimatedPrice: true` en `backend/src/seed.ts` y con la nota "(Precio estimado)" en su descripción, para que los identifiques y ajustes fácilmente.

Las fotos están en `frontend/public/products/<SKU>.jpg`, extraídas directamente del PDF del catálogo.

Después de sembrar, recarga http://localhost:3000 y el catálogo ya tendrá los 62 productos.

## Panel administrativo

Entra en http://localhost:3000/admin/login con las credenciales definidas en `backend/.env`:

```
ADMIN_EMAIL=admin@mitienda.com
ADMIN_PASSWORD=cambia_esta_clave
```

El usuario administrador se crea automáticamente la primera vez que arranca el backend. Cambia `ADMIN_PASSWORD` en `backend/.env` antes de usar esto en producción.

Desde el panel puedes:
- **Productos** — crear, editar, activar/desactivar, y crear categorías nuevas al vuelo.
- **Pedidos** — ver todos los pedidos, filtrar por estado, y cambiar el estado de cada uno (recibido → preparando → listo/en camino → entregado, o cancelado).
- **Inventario** — ver el stock de cada producto, cuáles están agotados o con poco stock, y registrar entradas, salidas o ajustes de mercancía.
- **Resumen** — pedidos pendientes, productos con poco stock y los más vendidos, de un vistazo.

La subida de fotos desde el panel todavía no está implementada — por ahora, para darle foto a un producto nuevo, copia la imagen a `frontend/public/products/<SKU>.jpg` (mismo código que le pusiste al producto).

## Qué está construido en este scaffold (Etapa 0-3 del plan)

**Backend (NestJS + PostgreSQL)**
- Módulos completos: `products`, `categories`, `inventory`, `orders`, `auth`.
- Autenticación de administrador con JWT — usuario se crea automáticamente desde variables de entorno.
- Rutas de administración protegidas (crear/editar productos y categorías, ver y actualizar pedidos, todo el módulo de inventario).
- Lógica transaccional: al confirmar un pedido, se valida y descuenta el stock en la misma transacción — nunca se vende algo que no hay.
- Endpoints REST documentados en el código (`/api/products`, `/api/categories`, `/api/orders`, `/api/inventory`, `/api/store-config`, `/api/auth/login`).

**Frontend (Next.js + Tailwind)**
- Tienda: Inicio, Catálogo (con búsqueda y filtro por categoría), Página de producto, Carrito.
- Carrito persistente en el navegador (Zustand + localStorage).
- Checkout que crea el pedido en el backend y abre WhatsApp con el resumen ya armado.
- Panel admin (`/admin`): login, resumen, productos (crear/editar/activar-desactivar), pedidos (filtrar y cambiar estado), inventario (ver stock y registrar movimientos).
- Diseño responsive base con Tailwind, listo para pulir estilos de marca.

## Qué falta (siguientes etapas, ver `PLAN.md`)

- Subida de imágenes desde el panel (hoy se guardan como URL/ruta; hay que agregar el endpoint de upload de archivos).
- Páginas de contenido público: Marca, Contacto, Envíos, FAQ, Promociones.
- Migraciones de base de datos (hoy usa `synchronize` de desarrollo — cambiar antes de producción).
- Registro de clientes con Google/Apple/Facebook/Microsoft, pagos online, facturación automática, app móvil — arquitectura ya preparada, ver `PLAN.md`.
