import { useState, useEffect } from 'react';
import { getList, create, update, remove, Sede } from '../services/api';

export default function SedesPage() {
  const [items, setItems] = useState<Sede[]>([]);
  const [modal, setModal] = useState<{ open: boolean; edit?: Sede }>({ open: false });
  const [form, setForm] = useState({ nombre: '', direccion: '', activa: true });

  useEffect(() => { getList<Sede>('/sedes').then(setItems); }, []);

  const openCreate = () => { setForm({ nombre: '', direccion: '', activa: true }); setModal({ open: true }); };
  const openEdit = (s: Sede) => { setForm({ nombre: s.nombre, direccion: s.direccion, activa: s.activa }); setModal({ open: true, edit: s }); };
  const save = async () => {
    if (modal.edit) { await update('/sedes/' + modal.edit.id, form); } else { await create('/sedes', form); }
    setModal({ open: false }); setItems(await getList<Sede>('/sedes'));
  };
  const del = async (id: number) => { if (confirm('¿Eliminar sede?')) { await remove('/sedes/' + id); setItems(await getList<Sede>('/sedes')); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-4"><h1 className="text-2xl font-bold">Sedes</h1><button onClick={openCreate} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">+ Nueva</button></div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm"><thead><tr className="bg-slate-50 text-slate-500"><th className="text-left px-4 py-3">Nombre</th><th className="text-left px-4 py-3">Dirección</th><th className="text-left px-4 py-3">Activa</th><th className="text-right px-4 py-3">Acciones</th></tr></thead>
        <tbody>{items.map(s => <tr key={s.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{s.nombre}</td><td className="px-4 py-3 text-slate-500">{s.direccion}</td><td className="px-4 py-3">{s.activa ? <span className="text-green-600">✓</span> : <span className="text-red-400">✗</span>}</td><td className="px-4 py-3 text-right space-x-2"><button onClick={() => openEdit(s)} className="text-blue-600 hover:underline text-xs">Editar</button><button onClick={() => del(s.id)} className="text-red-600 hover:underline text-xs">Eliminar</button></td></tr>)}</tbody></table>
      </div>
      {modal.open && <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal({ open: false })}><div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">{modal.edit ? 'Editar' : 'Nueva'} Sede</h2>
        <label className="text-sm text-slate-500 mb-1 block">Nombre</label><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm" />
        <label className="text-sm text-slate-500 mb-1 block">Dirección</label><input value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm" />
        <label className="flex items-center gap-2 text-sm mb-4"><input type="checkbox" checked={form.activa} onChange={e => setForm(f => ({ ...f, activa: e.target.checked }))} /> Activa</label>
        <div className="flex gap-2 justify-end"><button onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm text-slate-500">Cancelar</button><button onClick={save} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">Guardar</button></div>
      </div></div>}
    </div>
  );
}
