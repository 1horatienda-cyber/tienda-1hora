import CartView from '@/components/CartView';

export default function CarritoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-semibold mb-8">Tu carrito</h1>
      <CartView />
    </div>
  );
}
