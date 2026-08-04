import { Product } from './types';

type PricedProduct = Pick<
  Product,
  'retailPriceInCents' | 'priceInCents' | 'wholesaleMinQty' | 'boxQuantity' | 'boxPriceInCents'
>;

// Espejo de backend/src/modules/products/pricing.util.ts — el precio final siempre
// lo recalcula el servidor al confirmar el pedido; esto es solo para mostrarlo en vivo.
export function unitPriceForQuantity(product: PricedProduct, quantity: number): number {
  if (product.boxQuantity && product.boxPriceInCents && quantity >= product.boxQuantity) {
    return Math.round(product.boxPriceInCents / product.boxQuantity);
  }
  if (quantity >= product.wholesaleMinQty) {
    return product.priceInCents;
  }
  return product.retailPriceInCents ?? product.priceInCents;
}

export interface PriceTier {
  label: string;
  priceInCents: number;
  active: boolean;
}

// Para mostrar la tabla "1-2 unidades / desde 3 / caja de 50" en la página de producto.
export function priceTiers(product: PricedProduct, currentQuantity: number): PriceTier[] {
  const tiers: PriceTier[] = [];

  const retailLabel = product.wholesaleMinQty > 2 ? `1-${product.wholesaleMinQty - 1} unidades` : '1 unidad';
  tiers.push({
    label: retailLabel,
    priceInCents: product.retailPriceInCents ?? product.priceInCents,
    active: currentQuantity < product.wholesaleMinQty,
  });

  tiers.push({
    label:
      product.boxQuantity && currentQuantity < product.boxQuantity
        ? `${product.wholesaleMinQty}-${product.boxQuantity - 1} unidades`
        : `Desde ${product.wholesaleMinQty} unidades`,
    priceInCents: product.priceInCents,
    active: currentQuantity >= product.wholesaleMinQty && (!product.boxQuantity || currentQuantity < product.boxQuantity),
  });

  if (product.boxQuantity && product.boxPriceInCents) {
    tiers.push({
      label: `Caja x${product.boxQuantity}`,
      priceInCents: Math.round(product.boxPriceInCents / product.boxQuantity),
      active: currentQuantity >= product.boxQuantity,
    });
  }

  return tiers;
}
