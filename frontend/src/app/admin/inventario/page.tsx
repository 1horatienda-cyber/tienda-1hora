'use client';

import { useEffect, useState } from 'react';
import { adminApi, InventoryRow } from '@/lib/admin-api';
import RequirePermission from '@/components/RequirePermission';

export default function AdminInventarioPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyLow, setOnlyLow] = useState(false);
  const [movementForm, setMovementForm] = useState<{ productId: string; type: string; quantity: string; reason: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.getInventory();
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRegisterMovement(e: React.FormEvent) {
    e.preventDefault();
    if (!movementForm) return;
    setSaving(true);
    try {
      await adminApi.registerMovement({
        productId: movementForm.productId,
        type: movementForm.type,
        quantity: parseInt(movementForm.quantity, 10),
        reason: movementForm.reason || undefined,
      });
      setMovementForm(null);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo registrar el movimiento.');
    } finally {
      setSaving(false);
    }
  }

  const visibleRows = onlyLow ? rows.filter((r) => r.quantityAvailable <= r.lowStockThreshold) : rows;

  return (
    <RequirePermission permissions={['inventory.manage']}>
    <div>
      <h1 className="text-2xl font-semibold mb-6">Inventario</h1>

      <label className="flex items-center gap-2 text-sm mb-6">
        <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
        Mostrar solo productos con poco stock o agotados
      </label>

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-2 pr-4">Producto</th>
              <th className="py-2 pr-4">Código</th>
              <th className="py-2 pr-4">Disponible</th>
              <th className="py-2 pr-4">Estado</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const outOfStock = row.quantityAvailable <= 0;
              const lowStock = !outOfStock && row.quantityAvailable <= row.lowStockThreshold;
              return (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 pr-4">{row.product?.name}</td>
                  <td className="py-3 pr-4 text-gray-500">{row.product?.sku}</td>
                  <td className="py-3 pr-4 font-medium">{row.quantityAvailable}</td>
                  <td className="py-3 pr-4">
                    {outOfStock ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700">Agotado</span>
                    ) : lowStock ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700">Poco stock</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">Disponible</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <button
                      onClick={() => setMovementForm({ productId: row.productId, type: 'entrada', quantity: '', reason: '' })}
                      className="text-brand-accent hover:underline"
                    >
                      Registrar movimiento
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {movementForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleRegisterMovement}
            className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4"
          >
            <h2 className="text-lg font-semibold">Registrar movimiento</h2>

            <div>
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <select
                value={movementForm.type}
                onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
              >
                <option value="entrada">Entrada (llegó mercancía)</option>
                <option value="salida">Salida (venta manual, daño, etc.)</option>
                <option value="ajuste">Ajuste (corregir cantidad exacta)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Cantidad</label>
              <input
                type="number"
                min="1"
                value={movementForm.quantity}
                onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Motivo (opcional)</label>
              <input
                value={movementForm.reason}
                onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                placeholder="Ej: compra a proveedor, producto dañado..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-brand text-white py-2.5 rounded-full text-sm font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => setMovementForm(null)}
                className="flex-1 border border-gray-200 py-2.5 rounded-full text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    </RequirePermission>
  );
}
