'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import { Banner } from '@/lib/types';
import RequirePermission from '@/components/RequirePermission';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newHref, setNewHref] = useState('/catalogo');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, { imageUrl: string; href: string }>>({});

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.getBannersAdmin();
      setBanners(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await adminApi.createBanner({ imageUrl: newImageUrl, href: newHref || '/catalogo' });
      setNewImageUrl('');
      setNewHref('/catalogo');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar el banner.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(banner: Banner) {
    await adminApi.updateBanner(banner.id, { isActive: !banner.isActive });
    load();
  }

  async function handleDelete(banner: Banner) {
    if (!confirm('¿Eliminar este banner? Esta acción no se puede deshacer.')) return;
    await adminApi.deleteBanner(banner.id);
    load();
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= banners.length) return;
    const a = banners[index];
    const b = banners[target];
    await Promise.all([
      adminApi.updateBanner(a.id, { order: b.order }),
      adminApi.updateBanner(b.id, { order: a.order }),
    ]);
    load();
  }

  function startEdit(banner: Banner) {
    setEditing({ ...editing, [banner.id]: { imageUrl: banner.imageUrl, href: banner.href } });
  }

  function cancelEdit(id: string) {
    const rest = { ...editing };
    delete rest[id];
    setEditing(rest);
  }

  async function saveEdit(id: string) {
    const draft = editing[id];
    if (!draft) return;
    await adminApi.updateBanner(id, { imageUrl: draft.imageUrl, href: draft.href });
    cancelEdit(id);
    load();
  }

  return (
    <RequirePermission permissions={['banners.manage']}>
      <div>
        <h1 className="text-2xl font-semibold mb-2">Banners de la portada</h1>
        <p className="text-sm text-gray-400 mb-6">
          Rotan automáticamente cada 5 segundos en la página de inicio. Para reemplazar uno por otro,
          primero copia la imagen nueva a <code className="bg-gray-100 px-1 rounded">frontend/public/banners/</code>{' '}
          y luego edita la ruta aquí abajo.
        </p>

        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : (
          <div className="space-y-3 mb-8">
            {banners.length === 0 && <p className="text-gray-400">No hay banners todavía.</p>}
            {banners.map((banner, index) => {
              const draft = editing[banner.id];
              return (
                <div key={banner.id} className="border border-gray-100 rounded-xl p-4 flex gap-4 items-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.imageUrl}
                    alt=""
                    className="w-40 aspect-[2/1] object-cover rounded-lg border border-gray-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    {draft ? (
                      <div className="space-y-2">
                        <input
                          value={draft.imageUrl}
                          onChange={(e) => setEditing({ ...editing, [banner.id]: { ...draft, imageUrl: e.target.value } })}
                          placeholder="/banners/banner-9.jpg"
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                        />
                        <input
                          value={draft.href}
                          onChange={(e) => setEditing({ ...editing, [banner.id]: { ...draft, href: e.target.value } })}
                          placeholder="/catalogo"
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                        />
                        <div className="flex gap-3 text-sm">
                          <button onClick={() => saveEdit(banner.id)} className="text-brand-accent hover:underline">
                            Guardar
                          </button>
                          <button onClick={() => cancelEdit(banner.id)} className="text-gray-400 hover:text-gray-600">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium truncate">{banner.imageUrl}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">Enlace: {banner.href}</p>
                        <div className="flex items-center gap-3 mt-3 text-sm flex-wrap">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              banner.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {banner.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                          <button onClick={() => startEdit(banner)} className="text-brand-accent hover:underline">
                            Reemplazar
                          </button>
                          <button onClick={() => handleToggleActive(banner)} className="text-gray-500 hover:text-gray-700">
                            {banner.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                          <button onClick={() => handleMove(index, -1)} disabled={index === 0} className="text-gray-500 hover:text-gray-700 disabled:opacity-30">
                            Subir
                          </button>
                          <button
                            onClick={() => handleMove(index, 1)}
                            disabled={index === banners.length - 1}
                            className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
                          >
                            Bajar
                          </button>
                          <button onClick={() => handleDelete(banner)} className="text-red-400 hover:text-red-600">
                            Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="border border-gray-100 rounded-xl p-5 max-w-lg">
          <h2 className="text-lg font-semibold mb-3">Agregar banner</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Ruta de la imagen</label>
              <input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="/banners/banner-9.jpg"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Primero copia el archivo a frontend/public/banners/ con ese nombre.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">A dónde lleva al hacer clic</label>
              <input
                value={newHref}
                onChange={(e) => setNewHref(e.target.value)}
                placeholder="/catalogo?category=cables"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="bg-brand text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
            >
              {saving ? 'Agregando...' : 'Agregar banner'}
            </button>
          </form>
        </div>
      </div>
    </RequirePermission>
  );
}
