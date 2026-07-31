import { useState, useEffect } from 'react';
import { getList, create, update, remove, Visor, Sala } from '../services/api';

export default function VisoresPage() {
  const [items, setItems] = useState<Visor[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [modal, setModal] = useState<{ open: boolean; edit?: Visor }>({ open: false });
  const [form, setForm] = useState({ salaId: 0, nombre: '', mostrarCedula: false });

  useEffect(() => { getList<Visor>('/visores').then(setItems); getList<Sala>('/salas').then(setSalas); }, []);

  const openCreate = () => { setForm({ salaId: salas[0]?.id || 0, nombre: '', mostrarCedula: false }); setModal({ open: true }); };
  const openEdit = (v: Visor) => { setForm({ salaId: v.salaId, nombre: v.nombre, mostrarCedula: v.mostrarCedula }); setModal({ open: true, edit: v }); };
  const save = async () => {
    if (modal.edit) { await update('/visores/' + modal.edit.id, form); } else { await create('/visores', form); }
    setModal({ open: false }); setItems(await getList<Visor>('/visores'));
  };
  const toggleCedula = async (v: Visor) => { await update('/visores/' + v.id, { mostrarCedula: !v.mostrarCedula }); setItems(await getList<Visor>('/visores')); };
  const del = async (id: number) => { if (confirm('¿Eliminar visor?')) { await remove('/visores/' + id); setItems(await getList<Visor>('/visores')); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-4"><h1 className="text-2xl font-bold">Visores</h1><button onClick={openCreate} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">+ Nuevo</button></div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm"><thead><tr className="bg-slate-50 text-slate-500"><th className="text-left px-4 py-3">Nombre</th><th className="text-left px-4 py-3">Sala</th><th className="text-left px-4 py-3">Mostrar Cédula</th><th className="text-right px-4 py-3">Acciones</th></tr></thead>
        <tbody>{items.map(v => <tr key={v.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{v.nombre}</td><td className="px-4 py-3 text-slate-500">{v.sala?.nombre || '—'}</td>
          <td className="px-4 py-3">
            <button onClick={() => toggleCedula(v)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${v.mostrarCedula ? 'bg-blue-700' : 'bg-slate-300'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${v.mostrarCedula ? 'translate-x-4.5' : 'translate-x-1'}`} />
            </button>
          </td>
          <td className="px-4 py-3 text-right space-x-2"><button onClick={() => openEdit(v)} className="text-blue-600 hover:underline text-xs">Editar</button><button onClick={() => del(v.id)} className="text-red-600 hover:underline text-xs">Eliminar</button></td>
        </tr>)}</tbody></table>
      </div>
      {modal.open && <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal({ open: false })}><div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">{modal.edit ? 'Editar' : 'Nuevo'} Visor</h2>
        <label className="text-sm text-slate-500 mb-1 block">Sala</label>
        <select value={form.salaId} onChange={e => setForm(f => ({ ...f, salaId: +e.target.value }))} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm">{salas.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select>
        <label className="text-sm text-slate-500 mb-1 block">Nombre</label><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm" />
        <label className="flex items-center gap-2 text-sm mb-4"><input type="checkbox" checked={form.mostrarCedula} onChange={e => setForm(f => ({ ...f, mostrarCedula: e.target.checked }))} /> Mostrar cédula en pantalla</label>
        <div className="flex gap-2 justify-end"><button onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm text-slate-500">Cancelar</button><button onClick={save} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">Guardar</button></div>
      </div></div>}
    </div>
  );
}
