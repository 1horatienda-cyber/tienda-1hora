// Los precios se manejan en centavos en el backend para evitar errores de redondeo.
export function formatRD(cents: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
