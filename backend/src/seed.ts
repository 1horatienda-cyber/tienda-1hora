import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Category } from './modules/categories/entities/category.entity';
import { Product } from './modules/products/entities/product.entity';
import { ProductImage } from './modules/products/entities/product-image.entity';
import { Inventory } from './modules/inventory/entities/inventory.entity';

dotenv.config();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Catálogo real de 1Hora (RA Cell Technology) — Enero 2026.
// Precio = "Desde X unidades" (precio al detalle más bajo del catálogo, sin comprar por subcaja).
// Imágenes reales extraídas del PDF, servidas desde /products/<SKU>.jpg (frontend/public/products).
interface SeedProduct {
  sku: string;
  name: string;
  description: string;
  price: number; // RD$
  stock: number;
  isFeatured?: boolean;
  isNew?: boolean;
  // true cuando el catálogo original no traía precio al detalle para este producto
  // (solo precio de subcaja completa, o ningún precio impreso) y se estimó a partir
  // de productos similares del mismo catálogo. Edita el precio en este archivo cuando
  // tengas el precio real.
  estimatedPrice?: boolean;
}

interface SeedCategory {
  name: string;
  products: SeedProduct[];
}

const CATALOG: SeedCategory[] = [
  {
    name: 'Audífonos Bluetooth',
    products: [
      { sku: 'AUT210', name: 'Audífonos Bluetooth AUT210', description: 'Bluetooth 5.3. Duración de batería 16H. Batería de auriculares 40mAh, estuche de carga 300mAh. Carga en 2H por Tipo C. Peso 4.37g x2.', price: 595, stock: 20, isNew: true, isFeatured: true },
      { sku: 'AUT209', name: 'Audífonos Bluetooth AUT209', description: 'Bluetooth 5.3. Duración de batería 17H. Batería de auriculares 30mAh, estuche de carga 250mAh. Carga en 2H por Tipo C. Peso 3.11g x2.', price: 595, stock: 20, isNew: true },
      { sku: 'AUT208', name: 'Audífonos Bluetooth AUT208', description: 'Bluetooth 5.3. Duración de batería 19H. Batería de auriculares 40mAh, estuche de carga 300mAh. Carga en 1.5H por Tipo C. Peso 3.6g x2.', price: 545, stock: 20 },
      { sku: 'AUT207', name: 'Audífonos Bluetooth AUT207', description: 'Bluetooth 5.3. Duración de batería 18H. Batería de auriculares 35mAh, estuche de carga 300mAh. Carga en 1.5H por Tipo C. Peso 3.2g x2.', price: 550, stock: 20 },
      { sku: 'AUT205', name: 'Audífonos Bluetooth AUT205', description: 'Bluetooth 5.3. Duración de batería 17H. Batería de auriculares 30mAh, estuche de carga 250mAh. Carga en 1.5H por Tipo C. Peso 3.5g x2.', price: 595, stock: 20 },
      { sku: 'AUT203', name: 'Audífonos Bluetooth AUT203', description: 'Bluetooth 5.3. Duración de batería 17H. Batería de auriculares 30mAh, estuche de carga 250mAh. Carga en 1.5H por Tipo C. Peso 3.5g x2.', price: 595, stock: 20 },
      { sku: 'AUT114', name: 'Audífonos Bluetooth AUT114', description: 'Bluetooth 5.3 con pantalla indicadora de batería. Duración 25H. Batería de auriculares 40mAh, estuche de carga 300mAh. Carga en 1.5H por Tipo C. Peso 3.5g x2.', price: 495, stock: 20, isFeatured: true },
      { sku: 'AUT201', name: 'Audífonos Bluetooth AUT201', description: 'Bluetooth 5.3. Duración de batería 22H. Batería de auriculares 30mAh, estuche de carga 300mAh. Carga en 1.5H por Tipo C. Peso 3.2g x2.', price: 595, stock: 20 },
      { sku: 'AUT119', name: 'Audífonos Bluetooth AUT119 (varios colores)', description: 'Disponible en varios colores. Duración de batería 17H. Batería de auriculares 30mAh, estuche de carga 200mAh. Carga en 1.5H por Tipo C. Peso 2.6g x2.', price: 495, stock: 20, isNew: true },
    ],
  },
  {
    name: 'Audífonos Gamer',
    products: [
      { sku: 'AUT250', name: 'Audífonos Gamer AUT250', description: 'Audífonos over-ear inalámbricos Bluetooth 5.3. Duración de batería 100H. Batería estuche/interna 1000mAh. Carga en 3.8H por Tipo C. Peso 190g.', price: 780, stock: 10, isFeatured: true },
      { sku: 'AUT202', name: 'Audífonos Gamer AUT202', description: 'Audífonos over-ear inalámbricos Bluetooth 5.3. Duración de batería 28H. Batería estuche/interna 1000mAh. Carga en 3.8H por Tipo C. Peso 190g.', price: 650, stock: 10, estimatedPrice: true },
    ],
  },
  {
    name: 'Audífonos Alámbricos',
    products: [
      { sku: 'AUT117', name: 'Audífonos Alámbricos AUT117', description: 'Conector de 3.5mm con botón para contestar y colgar llamadas. Micrófono HD. Longitud de 1200mm. Material plástico blando.', price: 75, stock: 30 },
      { sku: 'AUT123', name: 'Audífonos Alámbricos AUT123', description: 'Conector de 3.5mm con botón para contestar y colgar llamadas. Micrófono HD. Control de volumen y almohadillas de goma. Longitud de 1200mm.', price: 75, stock: 30 },
      { sku: 'AUT124', name: 'Audífonos Alámbricos AUT124 (Tipo C)', description: 'Conector Tipo C con botón para contestar y colgar llamadas. Micrófono HD. Longitud de 1200mm. Material plástico blando.', price: 100, stock: 25, isNew: true },
    ],
  },
  {
    name: 'Bocinas Bluetooth',
    products: [
      { sku: 'BOC250', name: 'Bocina Bluetooth BOC250', description: '20 Watts, radio FM, Bluetooth 5.3. Entradas USB/TF/AUX, carga por Tipo C 5V/2A. Reproducción al 100% por 5H. Batería 2400mAh. Peso 1250g.', price: 1440, stock: 8, isFeatured: true, isNew: true },
      { sku: 'BOC241', name: 'Bocina Bluetooth BOC241 (Luces RGB)', description: '10 Watts, Bluetooth 5.1, luces RGB. Entradas USB/TF/AUX, carga por Tipo C. Reproducción al 100% por 4-5H. Batería 2400mAh. Peso 638g.', price: 760, stock: 10 },
      { sku: 'BOC242', name: 'Bocina Bluetooth BOC242 (Luces RGB)', description: '10 Watts, radio FM, Bluetooth 5.1, luces RGB. Entradas USB/TF/AUX, carga por Tipo C. Reproducción al 100% por 3.5H. Batería 2400mAh. Peso 495g.', price: 660, stock: 10 },
      { sku: 'BOC243', name: 'Bocina Bluetooth BOC243', description: '5 Watts, radio FM, Bluetooth 5.3, control de volumen. Entradas USB/TF/AUX. Reproducción al 100% por 7H. Batería 2000mAh. Peso 330g.', price: 550, stock: 10, isNew: true },
      { sku: 'BOC060', name: 'Bocina Bluetooth Portátil BOC060 (Luces RGB)', description: '10 Watts, radio FM, Bluetooth 5.1, luces RGB, con correa portátil. Entradas USB/TF/AUX, carga por Tipo C. Reproducción al 100% por 4H. Batería 2400mAh. Peso 418g.', price: 550, stock: 12, isFeatured: true },
      { sku: 'BOC062', name: 'Bocina Bluetooth Portátil BOC062', description: '5 Watts, radio FM, Bluetooth 5.1, con correa portátil. Entradas USB/TF/AUX, carga por Tipo C. Reproducción al 100% por 7H. Batería 1500mAh. Peso 286g.', price: 450, stock: 12 },
    ],
  },
  {
    name: 'Power Bank',
    products: [
      { sku: 'GAR158', name: 'Power Bank 20000mAh Carga Rápida', description: 'Batería portátil de 20,000mAh reales. Carga rápida 3A/22.5W. Salida USB 3A/22.5W y doble salida Tipo C 3A/22.5W. Pantalla indicadora de carga, linterna incorporada. Incluye cable Tipo C a Tipo C.', price: 1200, stock: 8, isFeatured: true, estimatedPrice: true },
      { sku: 'GAR264', name: 'Power Bank 10000mAh Carga Rápida', description: 'Batería portátil de 10,000mAh reales. Carga rápida de 22.5W. Salida USB y doble salida Tipo C de 3 amperios. Linterna incorporada, pantalla indicadora de carga. Cable Tipo C a Tipo C incluido.', price: 950, stock: 10, isNew: true, estimatedPrice: true },
      { sku: 'GAR148', name: 'Power Bank 10000mAh', description: 'Batería portátil de 10,000mAh, potencia de 10W. Salida Tipo C, Lightning y Micro USB (V8). Entrada AC 100-240V, salida 5V/2.1A.', price: 750, stock: 10, estimatedPrice: true },
      { sku: 'GAR276', name: 'Power Bank Magnético MagSafe 5000mAh', description: 'Batería portátil de 5000mAh con carga magnética estilo MagSafe. Potencia 15W. Cable Tipo C a Tipo C incluido. Entrada AC 100-240V, salida 5V/2.4A.', price: 900, stock: 10, isFeatured: true },
    ],
  },
  {
    name: 'Cargadores Inalámbricos Qi',
    products: [
      { sku: 'GAR281', name: 'Cargador Inalámbrico Qi GAR281', description: 'Cargador inalámbrico de 15W. Cable Tipo C incluido. Entrada DC 5V/2A o 9V/2A. Cuerpo de aluminio + ABS.', price: 460, stock: 12, estimatedPrice: true },
      { sku: 'GAR157', name: 'Cargador Inalámbrico Qi GAR157', description: 'Cargador inalámbrico de 15W. Cable Tipo C incluido. Entrada DC 5V/2A, 9V/2A o 12V/1.5A. Material ABS.', price: 445, stock: 15 },
      { sku: 'GAR151', name: 'Cargador Inalámbrico Qi GAR151', description: 'Cargador inalámbrico de 15W. Cable Tipo C incluido. Entrada DC 5V/2A, 9V/2A o 12V/1.5A. Cuerpo de aluminio + ABS.', price: 460, stock: 12, estimatedPrice: true },
    ],
  },
  {
    name: 'Cargadores para Auto',
    products: [
      { sku: 'GAR241', name: 'Cargador para Auto 38W GAR241', description: 'Potencia de 38W con salida USB A + Tipo C. Cable Tipo C a Tipo C incluido. Entrada DC 12-24V. Salida USB A hasta 18W y Tipo C hasta 20W. Cuerpo de aluminio.', price: 250, stock: 20 },
      { sku: 'GAR156', name: 'Cargador para Auto 20W GAR156', description: 'Potencia de 20W, salida Tipo C. Cable Tipo C a Tipo C incluido. Entrada DC 12-24V. Cuerpo de aluminio.', price: 185, stock: 20 },
      { sku: 'GAR116', name: 'Cargador para Auto 18W GAR116', description: 'Potencia de 18W, salida USB A. Cable USB a Tipo C incluido. Entrada DC 12-24V, salida hasta 18W. Cuerpo de aluminio.', price: 175, stock: 20 },
      { sku: 'GAR128', name: 'Cargador para Auto 12W GAR128', description: 'Potencia de 12W con doble salida USB. Entrada DC 12-24V, salida 5V/2.4A por puerto.', price: 62, stock: 25 },
    ],
  },
  {
    name: 'Cargadores 30W / 65W (Carga Rápida)',
    products: [
      { sku: 'GAR322', name: 'Cargador GaN 65W GAR322', description: 'Cargador de carga rápida de 65W con tecnología GaN y conector plegable. Salida USB-C1, USB-C2 y USB-A. Cable Tipo C de 2 metros (3A) incluido. Entrada AC 200-240V.', price: 650, stock: 10, isFeatured: true, estimatedPrice: true },
      { sku: 'GAR165', name: 'Cargador Rápido 30W GAR165 (iPhone 15 & 16)', description: 'Potencia de 30W, compatible con iPhone 15 y 16. Salida Tipo C, cable incluido. Entrada AC 100-240V. Salida hasta 5V/3A, 9V/3A, 12V/2.5A, 15V/2A o 20V/1.5A.', price: 320, stock: 15 },
      { sku: 'GAR164', name: 'Cargador Rápido 30W GAR164 (iPhone 15 & 16)', description: 'Potencia de 30W, compatible con iPhone 15 y 16. Salida Tipo C. Entrada AC 100-240V. Salida hasta 5V/3A, 9V/3A, 12V/2.5A, 15V/2A o 20V/1.5A.', price: 270, stock: 15 },
    ],
  },
  {
    name: 'Cargadores Duo 20W',
    products: [
      { sku: 'GAR161', name: 'Cargador Duo 20W GAR161', description: 'Potencia de 20W con salida USB y Tipo C. Entrada AC 100-240V. Salida 5V/3A, 9V/2.22A o 12V/1.67A.', price: 185, stock: 18 },
      { sku: 'GAR162', name: 'Cargador Duo 20W GAR162', description: 'Potencia de 20W con salida USB y Tipo C. Incluye cable Tipo C a Tipo C. Entrada AC 100-240V. Salida 5V/3A, 9V/2.22A o 12V/1.67A.', price: 210, stock: 18 },
      { sku: 'GAR163', name: 'Cargador Duo 20W GAR163', description: 'Potencia de 20W con salida USB y Tipo C. Incluye cable Tipo C a Lightning. Entrada AC 100-240V. Salida 5V/3A, 9V/2.22A o 12V/1.67A.', price: 210, stock: 18 },
    ],
  },
  {
    name: 'Cargadores PD 20W',
    products: [
      { sku: 'GAR152', name: 'Cargador PD 20W GAR152', description: 'Potencia de 20W, salida Tipo C. Entrada AC 100-240V. Salida 5V/3A, 9V/2.22A o 12V/1.67A.', price: 147, stock: 20 },
      { sku: 'GAR153', name: 'Cargador PD 20W GAR153', description: 'Potencia de 20W, salida Tipo C. Incluye cable Tipo C a Tipo C. Entrada AC 100-240V. Salida 5V/3A, 9V/2.22A o 12V/1.67A.', price: 200, stock: 20 },
      { sku: 'GAR154', name: 'Cargador PD 20W GAR154', description: 'Potencia de 20W, salida Tipo C. Incluye cable Tipo C a Lightning. Entrada AC 100-240V. Salida 5V/3A, 9V/2.22A o 12V/1.67A.', price: 205, stock: 20 },
    ],
  },
  {
    name: 'Combo Cargadores',
    products: [
      { sku: 'GAR092', name: 'Combo Cargador 18W + Cable Tipo C', description: 'Cargador de pared de 18W, salida USB A. Incluye cable USB a Tipo C. Entrada AC 100-240V, salida hasta 5V/3A, 9V/2A o 12V/1.5A.', price: 110, stock: 20, estimatedPrice: true },
      { sku: 'GAR124', name: 'Combo Cargador 12W + Cable V8', description: 'Cargador de pared de 12W, salida USB A. Incluye cable USB a V8. Entrada AC 100-240V, salida 5V/2.4A.', price: 92, stock: 25 },
      { sku: 'GAR142', name: 'Combo Cargador 12W + Cable Tipo C', description: 'Cargador de pared de 12W, salida USB A. Incluye cable USB a Tipo C. Entrada AC 100-240V, salida 5V/2.4A.', price: 90, stock: 25 },
      { sku: 'GAR143', name: 'Combo Cargador 12W + Cable Lightning', description: 'Cargador de pared de 12W, salida USB A. Incluye cable USB a Lightning (IP). Entrada AC 100-240V, salida 5V/2.4A.', price: 95, stock: 25 },
    ],
  },
  {
    name: 'Cables',
    products: [
      { sku: 'CAB251', name: 'Cable USB a Tipo C 3A', description: 'Cable de carga rápida 3A, USB a Tipo C. Longitud de 1 metro.', price: 40, stock: 40 },
      { sku: 'CAB272', name: 'Cable Tipo C a Tipo C 3A (Nylon)', description: 'Cable de nylon trenzado, carga rápida 3A, Tipo C a Tipo C. Longitud de 1 metro.', price: 80, stock: 40 },
      { sku: 'CAB258', name: 'Cable Tipo C a Lightning 3A', description: 'Cable de carga rápida 3A, Tipo C a Lightning (IP). Longitud de 1 metro.', price: 74, stock: 40 },
      { sku: 'CAB252', name: 'Cable Tipo C a Tipo C 3A', description: 'Cable de carga rápida 3A, Tipo C a Tipo C. Longitud de 1 metro.', price: 77, stock: 40 },
      { sku: 'CAB273', name: 'Cable Tipo C a Lightning 3A (Nylon)', description: 'Cable de nylon trenzado, carga rápida 3A, Tipo C a Lightning (IP). Longitud de 1 metro.', price: 80, stock: 40, estimatedPrice: true },
      { sku: 'CAB248', name: 'Cable USB a Micro USB (V8) 2.4A (Nylon)', description: 'Cable de nylon trenzado, 2.4A, USB a Micro USB (V8). Longitud de 1 metro.', price: 65, stock: 40, estimatedPrice: true },
      { sku: 'CAB249', name: 'Cable USB a Tipo C 2.4A (Nylon)', description: 'Cable de nylon trenzado, 2.4A, USB a Tipo C. Longitud de 1 metro.', price: 65, stock: 40 },
      { sku: 'CAB250', name: 'Cable USB a Lightning 2.4A (Nylon)', description: 'Cable de nylon trenzado, 2.4A, USB a Lightning (IP). Longitud de 1 metro.', price: 67, stock: 40 },
      { sku: 'CAB236', name: 'Cable USB a Micro USB (V8) 2.1A', description: 'Cable de carga, 2.1A, USB a Micro USB (V8). Longitud de 1 metro.', price: 37, stock: 45 },
      { sku: 'CAB237', name: 'Cable USB a Tipo C 2.1A', description: 'Cable de carga, 2.1A, USB a Tipo C. Longitud de 1 metro.', price: 40, stock: 45 },
      { sku: 'CAB238', name: 'Cable USB a Lightning 2.1A', description: 'Cable de carga, 2.1A, USB a Lightning (IP). Longitud de 1 metro.', price: 42, stock: 45 },
      { sku: 'CAB242', name: 'Cable USB a Micro USB (V8) 2.1A — 100cm', description: 'Cable de carga, 2.1A, USB a Micro USB (V8). Longitud de 100cm.', price: 28, stock: 50 },
      { sku: 'CAB244', name: 'Cable USB a Tipo C 2.1A — 100cm', description: 'Cable de carga, 2.1A, USB a Tipo C. Longitud de 100cm.', price: 29, stock: 50 },
    ],
  },
  {
    name: 'Accesorios',
    products: [
      { sku: 'RAT001', name: 'Mouse Inalámbrico RAT001', description: 'Mouse inalámbrico con alcance de 10 metros, conexión 2.4Ghz. Sensor de 1000/1200/1600 DPI. Click silencioso. Incluye batería AA.', price: 210, stock: 15, isNew: true },
      { sku: 'MCT002', name: 'Regleta Eléctrica MCT002', description: 'Regleta con protección contra rayos, material ignífugo, cable de 1.5 metros. Potencia máxima 1905W. 10 tomas de corriente + 2 puertos USB + 1 puerto Tipo C (5V/2.4A, 12W máx).', price: 690, stock: 8, isNew: true, isFeatured: true },
      { sku: 'DPA002', name: 'Dispensador de Agua Potable Eléctrico DPA002', description: 'Dispensador eléctrico para botellones, manguera de silicona alimentaria (certificado FDA). Carga por Tipo C, batería 1200mAh (4-5 botellones de 5 galones por carga). Flujo de 1.2L/min con botón. Luz LED incorporada.', price: 300, stock: 10, isNew: true },
      { sku: 'PJ098', name: 'Soporte Magnético para Teléfono (Auto) PJ098', description: 'Soporte con imán fuerte para fijar el teléfono. Orientación horizontal o vertical. Pinza que se ajusta a la rejilla de aire del auto. Compatibilidad universal, fácil de usar con una sola mano.', price: 105, stock: 20 },
      { sku: 'PJ033', name: 'Soporte Magnético para Teléfono (Auto) PJ033', description: 'Soporte con imán fuerte para fijar el teléfono. Orientación horizontal o vertical. Pinza que se ajusta a la rejilla de aire del auto. Compatibilidad universal, fácil de usar con una sola mano.', price: 105, stock: 20, estimatedPrice: true },
    ],
  },
];

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Category, Product, ProductImage, Inventory],
    synchronize: false, // las tablas ya deben existir (levanta el backend al menos una vez antes de sembrar)
  });

  await dataSource.initialize();
  console.log('Conectado a la base de datos.');

  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const imageRepo = dataSource.getRepository(ProductImage);
  const inventoryRepo = dataSource.getRepository(Inventory);

  let totalCreated = 0;

  for (const cat of CATALOG) {
    const catSlug = slugify(cat.name);
    let category = await categoryRepo.findOne({ where: { slug: catSlug } });
    if (!category) {
      category = await categoryRepo.save(
        categoryRepo.create({ name: cat.name, slug: catSlug }),
      );
      console.log(`Categoría creada: ${cat.name}`);
    }

    for (const item of cat.products) {
      const slug = slugify(item.name);
      const existing = await productRepo.findOne({ where: { slug } });
      if (existing) {
        console.log(`Ya existe: ${item.name} — omitido.`);
        continue;
      }

      const description = item.estimatedPrice
        ? `${item.description} (Precio estimado: el catálogo original no traía precio al detalle para este producto — ajústalo en seed.ts.)`
        : item.description;

      const product = await productRepo.save(
        productRepo.create({
          name: item.name,
          slug,
          description,
          priceInCents: item.price * 100,
          sku: item.sku,
          categoryId: category.id,
          isFeatured: !!item.isFeatured,
          isNew: !!item.isNew,
        }),
      );

      await imageRepo.save(
        imageRepo.create({
          productId: product.id,
          url: `/products/${item.sku}.jpg`,
          order: 0,
          isPrimary: true,
        }),
      );

      await inventoryRepo.save(
        inventoryRepo.create({ productId: product.id, quantityAvailable: item.stock, lowStockThreshold: 5 }),
      );

      totalCreated++;
      const priceTag = item.estimatedPrice ? `RD$${item.price} (estimado)` : `RD$${item.price}`;
      console.log(`Creado: ${item.sku} — ${item.name} — ${priceTag} — stock ${item.stock}`);
    }
  }

  await dataSource.destroy();
  console.log(`Listo. ${totalCreated} productos sembrados en ${CATALOG.length} categorías.`);
}

seed().catch((err) => {
  console.error('Error al sembrar datos:', err);
  process.exit(1);
});
