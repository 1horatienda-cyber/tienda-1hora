// Catálogo central de permisos disponibles en el sistema.
// Para agregar un permiso nuevo en el futuro: solo hay que sumar una entrada aquí.
// El resto (guard de permisos, editor de roles en el panel admin) lo toma de esta lista automáticamente.
export const PERMISSIONS = [
  { key: 'products.create', label: 'Crear productos', group: 'Productos' },
  { key: 'products.edit', label: 'Editar productos', group: 'Productos' },
  { key: 'products.delete', label: 'Eliminar productos', group: 'Productos' },
  { key: 'banners.manage', label: 'Administrar banners de la portada', group: 'Banners' },
  { key: 'inventory.manage', label: 'Administrar inventario', group: 'Inventario' },
  { key: 'orders.manage', label: 'Administrar pedidos', group: 'Pedidos' },
  { key: 'chat.respond', label: 'Responder el chat de la página', group: 'Chat' },
  { key: 'customers.view', label: 'Ver clientes', group: 'Clientes' },
  { key: 'customers.edit', label: 'Editar clientes', group: 'Clientes' },
  { key: 'whatsapp.manage', label: 'Administrar números de WhatsApp', group: 'WhatsApp' },
  { key: 'whatsapp.respond', label: 'Atender conversaciones de WhatsApp', group: 'WhatsApp' },
  { key: 'reports.view', label: 'Ver reportes', group: 'Reportes' },
  { key: 'settings.access', label: 'Acceder a configuraciones', group: 'Configuración' },
  { key: 'users.create', label: 'Crear usuarios', group: 'Usuarios' },
  { key: 'users.edit', label: 'Editar usuarios', group: 'Usuarios' },
  { key: 'users.delete', label: 'Eliminar usuarios', group: 'Usuarios' },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]['key'];

export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSIONS.map((p) => p.key);

export const DEFAULT_ROLES: { name: string; description: string; permissions: PermissionKey[] }[] = [
  {
    name: 'Administrador',
    description: 'Acceso completo al sistema, incluyendo usuarios, permisos y configuración.',
    permissions: ALL_PERMISSION_KEYS,
  },
  {
    name: 'Operador',
    description: 'Crea y edita productos, actualiza inventario, gestiona pedidos y responde el chat.',
    permissions: ['products.create', 'products.edit', 'inventory.manage', 'orders.manage', 'chat.respond'],
  },
  {
    name: 'Atención al Cliente',
    description: 'Responde el chat, atiende WhatsApp y consulta pedidos de clientes.',
    permissions: ['chat.respond', 'whatsapp.respond', 'orders.manage', 'customers.view'],
  },
];
