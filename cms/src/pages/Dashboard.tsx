import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMetricas, getList, Sede } from '../services/api';

export default function Dashboard() {
  const [metricas, setMetricas] = useState<any>(null);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedeFiltro, setSedeFiltro] = useState('');

  useEffect(() => { getList<Sede>('/sedes').then(setSedes); }, []);

  useEffect(() => {
    getMetricas(sedeFiltro ? parseInt(sedeFiltro, 10) : undefined).then(setMetricas);
  }, [sedeFiltro]);

  if (!metricas) return <div className="text-slate-400">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <select value={sedeFiltro} onChange={e => setSedeFiltro(e.target.value)} className="border rounded-xl px-3 py-2 text-sm bg-white">
          <option value="">Todas las sedes</option>
          {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 mb-4">Tiempo promedio de espera (segundos)</h2>
          {metricas.promedioEspera.length === 0 ? (
            <p className="text-slate-400 text-sm">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricas.promedioEspera}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="servicio" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="promedioSeg" fill="#2563eb" radius={[6, 6, 0, 0]} name="Segundos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 mb-4">Atenciones por profesional</h2>
          {metricas.atendidos.length === 0 ? (
            <p className="text-slate-400 text-sm">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricas.atendidos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="profesional" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#16a34a" radius={[6, 6, 0, 0]} name="Atendidos" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-slate-500">Promedio de espera global</h2>
              {metricas.promedioEspera.length > 0 ? (
                <p className="text-3xl font-bold text-blue-700">
                  {Math.round(metricas.promedioEspera.reduce((a: number, b: any) => a + b.promedioSeg, 0) / metricas.promedioEspera.length)}s
                </p>
              ) : <p className="text-slate-400 text-sm">—</p>}
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-slate-500">Total atendidos</h2>
              <p className="text-3xl font-bold text-green-700">{metricas.atendidos.reduce((a: number, b: any) => a + b.total, 0)}</p>
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-slate-500">Ausentes</h2>
              <p className="text-3xl font-bold text-amber-600">{metricas.ausentes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
