import { useState, useEffect } from 'react';
import { getList, create, update, remove, Usuario, Sede } from '../services/api';

export default function UsuariosPage() {
  const [items, setItems] = useState<Usuario[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [modal, setModal] = useState<{ open: boolean; edit?: Usuario }>({ open: false });
  const [form, setForm] = useState({ sedeId: '', nombre: '', email: '', password: '', rol: 'profesional' as string });

  useEffect(() => { getList<Usuario>('/usuarios').then(setItems); getList<Sede>('/sedes').then(setSedes); }, []);

  const openCreate = () => { setForm({ sedeId: '', nombre: '', email: '', password: '', rol: 'profesional' }); setModal({ open: true }); };
  const openEdit = (u: Usuario) => { setForm({ sedeId: u.sedeId?.toString() || '', nombre: u.nombre, email: u.email, password: '', rol: u.rol }); setModal({ open: true, edit: u }); };
  const save = async () => {
    const payload: any = { nombre: form.nombre, email: form.email, rol: form.rol };
    if (form.sedeId) payload.sedeId = parseInt(form.sedeId, 10);
    if (form.password) payload.password = form.password;
    if (modal.edit) { await update('/usuarios/' + modal.edit.id, payload); } else { await create('/usuarios', payload); }
    setModal({ open: false }); setItems(await getList<Usuario>('/usuarios'));
  };
  const del = async (id: number) => { if (confirm('¿Eliminar usuario?')) { await remove('/usuarios/' + id); setItems(await getList<Usuario>('/usuarios')); } };

  const rolColor = (r: string) => r === 'admin_central' ? 'text-purple-600' : r === 'profesional' ? 'text-blue-600' : 'text-amber-600';

  return (
    <div>
      <div className="flex items-center justify-between mb-4"><h1 className="text-2xl font-bold">Usuarios</h1><button onClick={openCreate} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">+ Nuevo</button></div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm"><thead><tr className="bg-slate-50 text-slate-500"><th className="text-left px-4 py-3">Nombre</th><th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">Rol</th><th className="text-left px-4 py-3">Sede</th><th className="text-right px-4 py-3">Acciones</th></tr></thead>
        <tbody>{items.map(u => <tr key={u.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{u.nombre}</td><td className="px-4 py-3 text-slate-500">{u.email}</td><td className={`px-4 py-3 font-medium capitalize ${rolColor(u.rol)}`}>{u.rol.replace('_', ' ')}</td><td className="px-4 py-3 text-slate-500">{sedeName(sedes, u.sedeId)}</td><td className="px-4 py-3 text-right space-x-2"><button onClick={() => openEdit(u)} className="text-blue-600 hover:underline text-xs">Editar</button><button onClick={() => del(u.id)} className="text-red-600 hover:underline text-xs">Eliminar</button></td></tr>)}</tbody></table>
      </div>
      {modal.open && <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setModal({ open: false })}><div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">{modal.edit ? 'Editar' : 'Nuevo'} Usuario</h2>
        <label className="text-sm text-slate-500 mb-1 block">Nombre</label><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm" />
        <label className="text-sm text-slate-500 mb-1 block">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm" />
        <label className="text-sm text-slate-500 mb-1 block">Contraseña {modal.edit && '(dejar vacío para mantener)'}</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm" />
        <label className="text-sm text-slate-500 mb-1 block">Rol</label>
        <select value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm">
          <option value="admin_central">Admin Central</option><option value="profesional">Profesional</option><option value="dispensador">Dispensador</option>
        </select>
        <label className="text-sm text-slate-500 mb-1 block">Sede (opcional para admin central)</label>
        <select value={form.sedeId} onChange={e => setForm(f => ({ ...f, sedeId: e.target.value }))} className="w-full border rounded-xl px-3 py-2 mb-3 text-sm">
          <option value="">— Sin sede —</option>{sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <div className="flex gap-2 justify-end"><button onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm text-slate-500">Cancelar</button><button onClick={save} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">Guardar</button></div>
      </div></div>}
    </div>
  );
}

function sedeName(sedes: Sede[], id?: number | null) { return id ? sedes.find(s => s.id === id)?.nombre || '—' : 'Central'; }
