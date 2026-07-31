import { useState, useEffect } from 'react';
import { getList, create, update, remove, Sala, Sede } from '../services/api';

export default function SalasPage() {
  const [items, setItems] = useState<Sala[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [modal, setModal] = useState<{ open: boolean; edit?: Sala }>({ open: false });
  const [form, setForm] = useState({ sedeId: 0, nombre: '' });

  useEffect(() => { getList<Sala>('/salas').then(setItems); getList<Sede>('/sedes').then(setSedes); }, []);

  const openCreate = () => { setForm({ sedeId: sedes[0]?.id || 0, nombre: '' }); setModal({ open: true }); };
  const openEdit = (s: Sala) => { setForm({ sedeId: s.sedeId, nombre: s.nombre }); setModal({ open: true, edit: s }); };
  const save = async () => {
    if (modal.edit) { await update('/salas/' + modal.edit.id, form); } else { await create('/salas', form); }
    setModal({ open: false }); setItems(await getList<Sala>('/salas'));
  };
  const del = async (id: number) => { if (confirm('¿Eliminar sala?')) { await remove('/salas/' + id); setItems(await getList<Sala>('/salas')); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-4"><h1 className="text-2xl font-bold">Salas</h1><button onClick={openCreate} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">+ Nueva</button></div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm"><thead><tr className="bg-slate-50 text-slate-500"><th className="text-left px-4 py-3">Nombre</th><th className="text-left px-4 py-3">Sede</th><th className="text-right px-4 py-3">Acciones</th></tr></thead>
        <tbody>{items.map(s => <tr key={s.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{s.nombre}</td><td className="px-4 py-3 text-slate-500">{s.sede?.nombre || '—'}</td><td className="px-4 py-3 text-right space-x-2"><button onClick={() => openEdit(s)} className="text-blue-600 hover:underline text-xs">Editar</button><button onClick={() => del(s.id)} className="text-red-600 hover:underline text-xs">Eliminar</button></td></tr>)}</tbody></table>
      </div>
      {modal.open && <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal({ open: false })}><div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">{modal.edit ? 'Editar' : 'Nueva'} Sala</h2>
        <label className="text-sm text-slate-500 mb-1 block">Sede</label>
        <select value={form.sedeId} onChange={e => setForm(f => ({ ...f, sedeId: +e.target.value }))} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm">{sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select>
        <label className="text-sm text-slate-500 mb-1 block">Nombre</label><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm" />
        <div className="flex gap-2 justify-end"><button onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm text-slate-500">Cancelar</button><button onClick={save} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">Guardar</button></div>
      </div></div>}
    </div>
  );
}
