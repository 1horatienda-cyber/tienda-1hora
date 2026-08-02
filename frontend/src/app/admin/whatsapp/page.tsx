'use client';

import { useEffect, useState } from 'react';
import { adminApi, AdminWhatsAppNumber, WhatsAppNumberStatus } from '@/lib/admin-api';
import RequirePermission from '@/components/RequirePermission';
import { useAdminAuthStore } from '@/store/admin-auth-store';

const MAX_NUMBERS = 5;

const STATUS_LABELS: Record<WhatsAppNumberStatus, string> = {
  conectado: 'Conectado',
  desconectado: 'Desconectado',
  pendiente: 'Pendiente',
  error: 'Error',
};

const STATUS_COLORS: Record<WhatsAppNumberStatus, string> = {
  conectado: 'bg-green-50 text-green-700',
  desconectado: 'bg-gray-100 text-gray-500',
  pendiente: 'bg-amber-50 text-amber-700',
  error: 'bg-red-50 text-red-700',
};

interface FormState {
  id?: string;
  phoneNumber: string;
  label: string;
  operatorIds: string[];
}

export default function AdminWhatsappPage() {
  const [numbers, setNumbers] = useState<AdminWhatsAppNumber[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canManage = useAdminAuthStore((s) => s.hasPermission('whatsapp.manage'));

  async function load() {
    setLoading(true);
    try {
      const [numbersData, usersData] = await Promise.all([
        adminApi.getWhatsappNumbers(),
        canManage ? adminApi.getAssignableUsers() : Promise.resolve([]),
      ]);
      setNumbers(numbersData);
      setUsers(usersData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setError(null);
    setForm({ phoneNumber: '', label: '', operatorIds: [] });
  }

  function openEdit(n: AdminWhatsAppNumber) {
    setError(null);
    setForm({ id: n.id, phoneNumber: n.phoneNumber, label: n.label ?? '', operatorIds: n.operators.map((o) => o.id) });
  }

  function toggleOperator(userId: string) {
    if (!form) return;
    setForm({
      ...form,
      operatorIds: form.operatorIds.includes(userId)
        ? form.operatorIds.filter((id) => id !== userId)
        : [...form.operatorIds, userId],
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      if (form.id) {
        await adminApi.updateWhatsappNumber(form.id, {
          label: form.label || undefined,
          operatorIds: form.operatorIds,
        });
      } else {
        await adminApi.createWhatsappNumber({
          phoneNumber: form.phoneNumber,
          label: form.label || undefined,
          operatorIds: form.operatorIds,
        });
      }
      setForm(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el número.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSetPrimary(n: AdminWhatsAppNumber) {
    await adminApi.updateWhatsappNumber(n.id, { isPrimary: true });
    load();
  }

  async function handleToggleActive(n: AdminWhatsAppNumber) {
    await adminApi.updateWhatsappNumber(n.id, { isActive: !n.isActive });
    load();
  }

  async function handleStatusChange(n: AdminWhatsAppNumber, status: WhatsAppNumberStatus) {
    await adminApi.updateWhatsappNumber(n.id, { status });
    load();
  }

  async function handleDelete(n: AdminWhatsAppNumber) {
    if (!confirm(`¿Eliminar el número ${n.phoneNumber}?`)) return;
    await adminApi.deleteWhatsappNumber(n.id);
    load();
  }

  return (
    <RequirePermission permissions={['whatsapp.manage', 'whatsapp.respond']}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">WhatsApp</h1>
          {canManage && (
            <button
              onClick={openCreate}
              disabled={numbers.length >= MAX_NUMBERS}
              className="bg-brand text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
            >
              + Agregar número
            </button>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-6">
          {numbers.length}/{MAX_NUMBERS} números conectados
        </p>

        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : numbers.length === 0 ? (
          <p className="text-gray-400">No hay números de WhatsApp registrados todavía.</p>
        ) : (
          <div className="space-y-3">
            {numbers.map((n) => (
              <div key={n.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      +{n.phoneNumber}
                      {n.isPrimary && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand text-white">Principal</span>
                      )}
                    </p>
                    {n.label && <p className="text-sm text-gray-400 mt-0.5">{n.label}</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    {canManage ? (
                      <select
                        value={n.status}
                        onChange={(e) => handleStatusChange(n, e.target.value as WhatsAppNumberStatus)}
                        className={`text-xs px-2 py-1 rounded-full border-none ${STATUS_COLORS[n.status]}`}
                      >
                        {(Object.keys(STATUS_LABELS) as WhatsAppNumberStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[n.status]}`}>
                        {STATUS_LABELS[n.status]}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        n.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {n.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50">
                  <p className="text-xs text-gray-400 mb-1">Operadores asignados</p>
                  {n.operators.length === 0 ? (
                    <p className="text-sm text-gray-400">Sin operadores asignados.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {n.operators.map((op) => (
                        <span key={op.id} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {op.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {canManage && (
                  <div className="mt-3 pt-3 border-t border-gray-50 flex gap-4 text-sm">
                    <button onClick={() => openEdit(n)} className="text-brand-accent hover:underline">
                      Editar
                    </button>
                    {!n.isPrimary && (
                      <button onClick={() => handleSetPrimary(n)} className="text-gray-500 hover:text-gray-700">
                        Marcar como principal
                      </button>
                    )}
                    <button onClick={() => handleToggleActive(n)} className="text-gray-500 hover:text-gray-700">
                      {n.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => handleDelete(n)} className="text-red-400 hover:text-red-600">
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {form && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
              <h2 className="text-lg font-semibold">{form.id ? 'Editar número' : 'Agregar número'}</h2>

              {!form.id && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Número (formato internacional, sin +)</label>
                  <input
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    placeholder="18091234567"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Etiqueta (opcional)</label>
                <input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Ej: Ventas, Soporte..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Operadores</label>
                <div className="space-y-1 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {users.map((u) => (
                    <label key={u.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.operatorIds.includes(u.id)}
                        onChange={() => toggleOperator(u.id)}
                      />
                      {u.name}
                    </label>
                  ))}
                  {users.length === 0 && <p className="text-gray-400 text-sm">No hay usuarios disponibles.</p>}
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

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
                  onClick={() => setForm(null)}
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
