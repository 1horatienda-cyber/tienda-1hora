// Datos tomados directo del catálogo mayorista de 1Hora (Enero 2026):
// wholesale = precio "desde X unidades" ya impreso en el catálogo (X = minQty).
// box/boxQty = precio y cantidad de la subcaja completa, cuando el catálogo lo trae.
// El precio "al detalle" (1-2 unidades) NO viene en el catálogo — se calcula solo
// con suggestRetailPriceInCents() aplicando un margen sobre el precio por mayor
// (ver modules/products/pricing.util.ts). Todo se puede editar después desde /admin/productos.
// Lo usan tanto seed.ts (instalaciones nuevas) como update-pricing.ts (recalcular una BD existente).
export interface PricingRow {
  sku: string;
  minQty: number;
  wholesale: number; // RD$
  boxQty?: number;
  box?: number; // RD$, precio total de la caja
}

export const CATALOG_PRICING: PricingRow[] = [
  // Audífonos Bluetooth — desde 3 unidades, subcaja x20
  { sku: 'AUT210', minQty: 3, wholesale: 595, boxQty: 20, box: 10800 },
  { sku: 'AUT209', minQty: 3, wholesale: 595, boxQty: 20, box: 10800 },
  { sku: 'AUT208', minQty: 3, wholesale: 545, boxQty: 20, box: 9840 },
  { sku: 'AUT207', minQty: 3, wholesale: 550, boxQty: 20, box: 9900 },
  { sku: 'AUT205', minQty: 3, wholesale: 595, boxQty: 20, box: 10800 },
  { sku: 'AUT203', minQty: 3, wholesale: 595, boxQty: 20, box: 10800 },
  { sku: 'AUT114', minQty: 3, wholesale: 495, boxQty: 20, box: 8900 },
  { sku: 'AUT201', minQty: 3, wholesale: 595, boxQty: 20, box: 10800 },
  { sku: 'AUT119', minQty: 3, wholesale: 495, boxQty: 20, box: 8900 },

  // Audífonos Gamer — desde 3, subcaja x10
  { sku: 'AUT250', minQty: 3, wholesale: 780, boxQty: 10, box: 7200 },
  { sku: 'AUT202', minQty: 3, wholesale: 650, boxQty: 10, box: 5850 }, // caja estimada (no impresa)

  // Audífonos Alámbricos — desde 6, subcaja x50
  { sku: 'AUT117', minQty: 6, wholesale: 75, boxQty: 50, box: 3400 },
  { sku: 'AUT123', minQty: 6, wholesale: 75, boxQty: 50, box: 3400 },
  { sku: 'AUT124', minQty: 6, wholesale: 100, boxQty: 50, box: 4400 },

  // Bocinas Bluetooth
  { sku: 'BOC250', minQty: 2, wholesale: 1440, boxQty: 5, box: 7440 },
  { sku: 'BOC241', minQty: 3, wholesale: 760, boxQty: 10, box: 6900 },
  { sku: 'BOC242', minQty: 3, wholesale: 660, boxQty: 10, box: 6100 },
  { sku: 'BOC243', minQty: 3, wholesale: 550, boxQty: 10, box: 5000 },
  { sku: 'BOC060', minQty: 3, wholesale: 550, boxQty: 10, box: 5050 },
  { sku: 'BOC062', minQty: 3, wholesale: 450, boxQty: 10, box: 4050 },

  // Power Bank — subcaja x10 estimada (el catálogo no trae caja para estos, salvo GAR276)
  { sku: 'GAR158', minQty: 3, wholesale: 1200, boxQty: 10, box: 10800 },
  { sku: 'GAR264', minQty: 3, wholesale: 950, boxQty: 10, box: 8550 },
  { sku: 'GAR148', minQty: 3, wholesale: 750, boxQty: 10, box: 6750 },
  { sku: 'GAR276', minQty: 3, wholesale: 900, boxQty: 10, box: 8300 },

  // Cargadores Inalámbricos Qi — subcaja x10
  { sku: 'GAR281', minQty: 3, wholesale: 445, boxQty: 10, box: 4000 },
  { sku: 'GAR157', minQty: 3, wholesale: 445, boxQty: 10, box: 4000 },
  { sku: 'GAR151', minQty: 3, wholesale: 460, boxQty: 10, box: 4150 },

  // Cargadores para Auto — subcaja x20
  { sku: 'GAR241', minQty: 3, wholesale: 250, boxQty: 20, box: 4500 },
  { sku: 'GAR156', minQty: 3, wholesale: 185, boxQty: 20, box: 3360 },
  { sku: 'GAR116', minQty: 3, wholesale: 175, boxQty: 20, box: 3200 },
  { sku: 'GAR128', minQty: 3, wholesale: 62, boxQty: 20, box: 1120 },

  // Cargadores 30W / 65W
  { sku: 'GAR322', minQty: 3, wholesale: 650, boxQty: 10, box: 5850 }, // caja estimada (no impresa)
  { sku: 'GAR165', minQty: 3, wholesale: 320, boxQty: 8, box: 2320 },
  { sku: 'GAR164', minQty: 3, wholesale: 270, boxQty: 10, box: 2450 },

  // Cargadores Duo 20W — subcaja x10
  { sku: 'GAR161', minQty: 3, wholesale: 185, boxQty: 10, box: 1650 },
  { sku: 'GAR162', minQty: 3, wholesale: 210, boxQty: 10, box: 1900 },
  { sku: 'GAR163', minQty: 3, wholesale: 210, boxQty: 10, box: 1900 },

  // Cargadores PD 20W — subcaja x10
  { sku: 'GAR152', minQty: 3, wholesale: 147, boxQty: 10, box: 1350 },
  { sku: 'GAR153', minQty: 3, wholesale: 200, boxQty: 10, box: 1830 },
  { sku: 'GAR154', minQty: 3, wholesale: 205, boxQty: 10, box: 1880 },

  // Combo Cargadores — subcaja x50
  { sku: 'GAR092', minQty: 3, wholesale: 92, boxQty: 50, box: 4350 },
  { sku: 'GAR124', minQty: 3, wholesale: 90, boxQty: 50, box: 4350 },
  { sku: 'GAR142', minQty: 3, wholesale: 90, boxQty: 50, box: 4500 },
  { sku: 'GAR143', minQty: 3, wholesale: 95, boxQty: 50, box: 4500 },

  // Cables 3A — desde 6, subcaja x50
  { sku: 'CAB251', minQty: 6, wholesale: 40, boxQty: 50, box: 1850 },
  { sku: 'CAB272', minQty: 6, wholesale: 80, boxQty: 50, box: 3650 },
  { sku: 'CAB258', minQty: 6, wholesale: 74, boxQty: 50, box: 3400 },
  { sku: 'CAB252', minQty: 6, wholesale: 77, boxQty: 50, box: 3550 },
  { sku: 'CAB273', minQty: 6, wholesale: 80, boxQty: 50, box: 3400 },

  // Cables 2.4A Nylon — desde 3, subcaja x50
  { sku: 'CAB248', minQty: 3, wholesale: 65, boxQty: 50, box: 3000 },
  { sku: 'CAB249', minQty: 3, wholesale: 65, boxQty: 50, box: 3000 },
  { sku: 'CAB250', minQty: 3, wholesale: 67, boxQty: 50, box: 3100 },

  // Cables 2.1A — desde 6, subcaja x50
  { sku: 'CAB236', minQty: 6, wholesale: 37, boxQty: 50, box: 1700 },
  { sku: 'CAB237', minQty: 6, wholesale: 40, boxQty: 50, box: 1850 },
  { sku: 'CAB238', minQty: 6, wholesale: 42, boxQty: 50, box: 1950 },

  // Cables 2.1A 100cm — el catálogo no trae precio "desde X", solo caja x100
  { sku: 'CAB242', minQty: 6, wholesale: 28, boxQty: 100, box: 2800 },
  { sku: 'CAB244', minQty: 6, wholesale: 29, boxQty: 100, box: 2900 },

  // Otros productos
  { sku: 'RAT001', minQty: 3, wholesale: 210, boxQty: 50, box: 9500 },
  { sku: 'MCT002', minQty: 3, wholesale: 690, boxQty: 10, box: 6300 },
  { sku: 'DPA002', minQty: 3, wholesale: 300, boxQty: 10, box: 2700 },
  { sku: 'PJ098', minQty: 3, wholesale: 105, boxQty: 50, box: 4750 },
  { sku: 'PJ033', minQty: 3, wholesale: 105, boxQty: 50, box: 4750 },
];
