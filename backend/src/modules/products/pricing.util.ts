import { Product } from './entities/product.entity';

type PricedProduct = Pick<
  Product,
  'retailPriceInCents' | 'priceInCents' | 'wholesaleMinQty' | 'boxQuantity' | 'boxPriceInCents'
>;

// Precio por unidad según la cantidad que se está comprando:
// caja completa (si la cantidad la alcanza) < por mayor (desde wholesaleMinQty) < al detalle (por debajo de eso).
export function unitPriceForQuantity(product: PricedProduct, quantity: number): number {
  if (product.boxQuantity && product.boxPriceInCents && quantity >= product.boxQuantity) {
    return Math.round(product.boxPriceInCents / product.boxQuantity);
  }
  if (quantity >= product.wholesaleMinQty) {
    return product.priceInCents;
  }
  return product.retailPriceInCents ?? product.priceInCents;
}

// El catálogo mayorista no trae precio "al detalle" (1-2 unidades) — se sugiere
// aplicando un margen del 30% sobre el precio por mayor, redondeado a un número
// limpio (RD$5 si es menor a RD$200, RD$10 si es menor a RD$1,000, RD$50 en adelante).
export function suggestRetailPriceInCents(wholesalePriceInCents: number): number {
  const wholesale = wholesalePriceInCents / 100;
  const step = wholesale >= 1000 ? 50 : wholesale >= 200 ? 10 : 5;
  const rounded = Math.ceil((wholesale * 1.3) / step) * step;
  return Math.round(rounded * 100);
}
