import { useState, useEffect, useRef } from 'react';
import { getList, getOne, create, update, remove, Visor, PlaylistItem } from '../services/api';

const BASE = '/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.clinicalhouse.co';

export default function MultimediaPage() {
  const [visores, setVisores] = useState<Visor[]>([]);
  const [visorId, setVisorId] = useState<number>(0);
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getList<Visor>('/visores').then(v => { setVisores(v); if (v.length) setVisorId(v[0].id); }); }, []);

  useEffect(() => {
    if (visorId) getList<PlaylistItem>('/playlist?visorId=' + visorId).then(setItems);
  }, [visorId]);

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const token = localStorage.getItem('cms_token');
    const res = await fetch(BASE + '/upload', {
      method: 'POST',
      headers: token ? { Authorization: 'Bearer ' + token } : {},
      body: fd,
    });
    const { url } = await res.json();
    const tipo = file.type.startsWith('video') ? 'video' : 'imagen';
    await create('/playlist', { visorId, tipo, url });
    setItems(await getList<PlaylistItem>('/playlist?visorId=' + visorId));
    setUploading(false);
  };

  const toggleActivo = async (item: PlaylistItem) => {
    await update('/playlist/' + item.id, { activo: !item.activo });
    setItems(await getList<PlaylistItem>('/playlist?visorId=' + visorId));
  };

  const del = async (id: number) => {
    if (!confirm('¿Eliminar elemento?')) return;
    await remove('/playlist/' + id);
    setItems(await getList<PlaylistItem>('/playlist?visorId=' + visorId));
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...items];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setItems(reordered);
    setDragIdx(idx);
  };
  const handleDragEnd = async () => {
    setDragIdx(null);
    const reordered = items.map((item, i) => ({ id: item.id, orden: i + 1 }));
    await fetch(BASE + '/playlist/reordenar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('cms_token') },
      body: JSON.stringify({ items: reordered }),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Multimedia</h1>
        <select value={visorId} onChange={e => setVisorId(+e.target.value)} className="border rounded-xl px-3 py-2 text-sm bg-white">
          {visores.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-slate-500 mb-3">Agregar multimedia</h2>
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-50">
            {uploading ? 'Subiendo...' : 'Seleccionar archivo'}
          </button>
          <span className="text-xs text-slate-400">imagen o video</span>
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {items.map(item => (
            <div key={item.id} className="relative group">
              <img src={item.url.startsWith('http') ? item.url : `${API_URL}${item.url}`} alt="" className="w-16 h-16 rounded-lg object-cover border" />
              <span className="absolute -top-1 -right-1 bg-slate-800 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{item.orden}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-500">Playlist ({items.length})</h2>
        </div>
        {items.length === 0 ? (
          <div className="p-6 text-sm text-slate-400">Sin elementos. Suba un archivo para comenzar.</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-slate-500"><th className="text-left px-4 py-3 w-8">#</th><th className="text-left px-4 py-3">Vista previa</th><th className="text-left px-4 py-3">Tipo</th><th className="text-left px-4 py-3">URL</th><th className="text-left px-4 py-3">Activo</th><th className="text-right px-4 py-3">Acciones</th></tr></thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-t border-slate-100"
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                >
                  <td className="px-4 py-3 text-slate-400 cursor-grab active:cursor-grabbing">{item.orden}</td>
                  <td className="px-4 py-3">
                    {item.tipo === 'imagen' ? (
                      <img src={item.url.startsWith('http') ? item.url : `${API_URL}${item.url}`} alt="" className="w-12 h-12 rounded-lg object-cover border" />
                    ) : (
                      <video src={item.url.startsWith('http') ? item.url : `${API_URL}${item.url}`} className="w-12 h-12 rounded-lg object-cover border" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs capitalize">{item.tipo}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">{item.url}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActivo(item)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${item.activo ? 'bg-blue-700' : 'bg-slate-300'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${item.activo ? 'translate-x-4.5' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => del(item.id)} className="text-red-600 hover:underline text-xs">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
