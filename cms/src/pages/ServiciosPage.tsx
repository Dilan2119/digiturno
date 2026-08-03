import { useState, useEffect } from 'react';
import { getList, create, update, remove, Servicio, Sede } from '../services/api';

export default function ServiciosPage() {
  const [items, setItems] = useState<Servicio[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [modal, setModal] = useState<{ open: boolean; edit?: Servicio }>({ open: false });
  const [form, setForm] = useState({ sedeId: 0, nombre: '', prefijo: '' });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getList<Servicio>('/servicios').then(setItems); getList<Sede>('/sedes').then(setSedes); }, []);

  const openCreate = () => { setForm({ sedeId: sedes[0]?.id || 0, nombre: '', prefijo: '' }); setModal({ open: true }); };
  const openEdit = (s: Servicio) => { setForm({ sedeId: s.sedeId, nombre: s.nombre, prefijo: s.prefijo }); setModal({ open: true, edit: s }); };
  const save = async () => {
    setSaving(true); setError(null);
    try {
      if (modal.edit) { await update('/servicios/' + modal.edit.id, form); } else { await create('/servicios', form); }
      setModal({ open: false }); setItems(await getList<Servicio>('/servicios'));
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };
  const del = async (id: number, force: boolean = false) => {
    if (!force && !confirm('¿Eliminar servicio?')) return;
    try {
      await remove('/servicios/' + id + (force ? '?force=true' : ''));
      setItems(await getList<Servicio>('/servicios'));
      setError(null);
    } catch (e: any) {
      if (e.message?.includes('tiene turnos asociados')) {
        if (confirm('⚠️ ATENCIÓN: Este servicio ya tiene turnos asignados. Eliminarlo también borrará TODOS sus turnos y el historial de eventos asociados de manera permanente.\n\n¿Estás completamente seguro de que deseas eliminarlo?')) {
          del(id, true);
        }
      } else {
        setError(e.message || 'No se pudo eliminar el servicio');
      }
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-600 font-bold">×</button>
        </div>
      )}
      <div className="flex items-center justify-between mb-4"><h1 className="text-2xl font-bold">Servicios</h1><button onClick={openCreate} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">+ Nuevo</button></div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm"><thead><tr className="bg-slate-50 text-slate-500"><th className="text-left px-4 py-3">Nombre</th><th className="text-left px-4 py-3">Prefijo</th><th className="text-left px-4 py-3">Sede</th><th className="text-right px-4 py-3">Acciones</th></tr></thead>
        <tbody>{items.map(s => <tr key={s.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{s.nombre}</td><td className="px-4 py-3 font-mono text-xs">{s.prefijo}</td><td className="px-4 py-3 text-slate-500">{sedeName(sedes, s.sedeId)}</td><td className="px-4 py-3 text-right space-x-2"><button onClick={() => openEdit(s)} className="text-blue-600 hover:underline text-xs">Editar</button><button onClick={() => del(s.id)} className="text-red-600 hover:underline text-xs">Eliminar</button></td></tr>)}</tbody></table>
      </div>
      {modal.open && <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal({ open: false })}><div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">{modal.edit ? 'Editar' : 'Nuevo'} Servicio</h2>
        <label className="text-sm text-slate-500 mb-1 block">Sede</label>
        <select value={form.sedeId} onChange={e => setForm(f => ({ ...f, sedeId: +e.target.value }))} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm">{sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select>
        <label className="text-sm text-slate-500 mb-1 block">Nombre</label><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm" />
        <label className="text-sm text-slate-500 mb-1 block">Prefijo</label><input value={form.prefijo} onChange={e => setForm(f => ({ ...f, prefijo: e.target.value.toUpperCase() }))} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm" placeholder="VAC" />
        <div className="flex gap-2 justify-end"><button onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm text-slate-500">Cancelar</button><button onClick={save} disabled={saving} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar'}</button></div>
      </div></div>}
    </div>
  );
}

function sedeName(sedes: Sede[], id: number) { return sedes.find(s => s.id === id)?.nombre || '—'; }
