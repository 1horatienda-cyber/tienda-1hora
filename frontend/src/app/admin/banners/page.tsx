'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import { Banner } from '@/lib/types';
import RequirePermission from '@/components/RequirePermission';

interface Draft {
  imageUrl: string;
  imageUrlMobile: string;
  href: string;
}

const EMPTY_DRAFT: Draft = { imageUrl: '', imageUrlMobile: '', href: '/catalogo' };

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDraft, setNewDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, Draft>>({});

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
      await adminApi.createBanner({
        imageUrl: newDraft.imageUrl,
        imageUrlMobile: newDraft.imageUrlMobile || undefined,
        href: newDraft.href || '/catalogo',
      });
      setNewDraft(EMPTY_DRAFT);
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
    setEditing({
      ...editing,
      [banner.id]: { imageUrl: banner.imageUrl, imageUrlMobile: banner.imageUrlMobile ?? '', href: banner.href },
    });
  }

  function cancelEdit(id: string) {
    const rest = { ...editing };
    delete rest[id];
    setEditing(rest);
  }

  async function saveEdit(id: string) {
    const draft = editing[id];
    if (!draft) return;
    await adminApi.updateBanner(id, {
      imageUrl: draft.imageUrl,
      imageUrlMobile: draft.imageUrlMobile, // vacío = quitar version movil (usa el fallback)
      href: draft.href,
    });
    cancelEdit(id);
    load();
  }

  return (
    <RequirePermission permissions={['banners.manage']}>
      <div>
        <h1 className="text-2xl font-semibold mb-2">Banners de la portada</h1>
        <p className="text-sm text-gray-400 mb-1">
          Rotan automáticamente cada 5 segundos en la página de inicio. Cada banner tiene una imagen de
          escritorio (obligatoria) y opcionalmente una versión vertical para celular.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Tamaños recomendados: escritorio <strong>1920×960px</strong> (relación 2:1), móvil{' '}
          <strong>1080×1350px</strong> (vertical). Si no subes la versión móvil, en el celular se muestra la
          imagen de escritorio completa y sin recortar, para no perder texto ni información. Primero copia los
          archivos a <code className="bg-gray-100 px-1 rounded">frontend/public/banners/</code> y luego pon la
          ruta aquí abajo.
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
                  <div className="flex gap-2 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={banner.imageUrl}
                      alt=""
                      className="w-32 aspect-[2/1] object-cover rounded-lg border border-gray-100"
                    />
                    {banner.imageUrlMobile && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={banner.imageUrlMobile}
                        alt=""
                        className="w-16 aspect-[4/5] object-cover rounded-lg border border-gray-100"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {draft ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-500">Imagen de escritorio (1920×960)</label>
                          <input
                            value={draft.imageUrl}
                            onChange={(e) => setEditing({ ...editing, [banner.id]: { ...draft, imageUrl: e.target.value } })}
                            placeholder="/banners/banner-9-desktop.webp"
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Imagen para móvil (1080×1350, opcional)</label>
                          <input
                            value={draft.imageUrlMobile}
                            onChange={(e) =>
                              setEditing({ ...editing, [banner.id]: { ...draft, imageUrlMobile: e.target.value } })
                            }
                            placeholder="/banners/banner-9-mobile.webp (déjalo vacío para quitarla)"
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">A dónde lleva al hacer clic</label>
                          <input
                            value={draft.href}
                            onChange={(e) => setEditing({ ...editing, [banner.id]: { ...draft, href: e.target.value } })}
                            placeholder="/catalogo"
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mt-0.5"
                          />
                        </div>
                        <div className="flex gap-3 text-sm pt-1">
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
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {banner.imageUrlMobile ? `Móvil: ${banner.imageUrlMobile}` : 'Sin versión móvil dedicada (usa la de escritorio)'}
                        </p>
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
              <label className="text-sm font-medium text-gray-700">Imagen de escritorio (1920×960)</label>
              <input
                value={newDraft.imageUrl}
                onChange={(e) => setNewDraft({ ...newDraft, imageUrl: e.target.value })}
                placeholder="/banners/banner-9-desktop.webp"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Imagen para móvil (1080×1350, opcional)</label>
              <input
                value={newDraft.imageUrlMobile}
                onChange={(e) => setNewDraft({ ...newDraft, imageUrlMobile: e.target.value })}
                placeholder="/banners/banner-9-mobile.webp"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">
                Si el diseño no tiene una versión vertical dedicada, déjalo vacío — se usará la de escritorio
                completa en el celular, sin recortar.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">A dónde lleva al hacer clic</label>
              <input
                value={newDraft.href}
                onChange={(e) => setNewDraft({ ...newDraft, href: e.target.value })}
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
