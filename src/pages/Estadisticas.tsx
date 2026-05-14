import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { db, CATEGORIAS, formatCurrency } from '../db'

const MESES = Array.from({ length: 6 }, (_, i) => {
  const d = new Date()
  d.setMonth(d.getMonth() - i)
  return d.toISOString().slice(0, 7)
}).reverse()

export default function Estadisticas() {
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().toISOString().slice(0, 7))

  const gastosMes = useLiveQuery(() =>
    db.gastos.where('fecha').startsWith(mesSeleccionado).toArray(), [mesSeleccionado]
  )

  const todosGastos = useLiveQuery(() => db.gastos.toArray())

  const totalMes = gastosMes?.reduce((s, g) => s + g.cantidad, 0) ?? 0

  const porCategoria = CATEGORIAS.map(cat => ({
    name: cat.emoji + ' ' + cat.label,
    value: gastosMes?.filter(g => g.categoria === cat.id).reduce((s, g) => s + g.cantidad, 0) ?? 0,
    color: cat.color,
  })).filter(c => c.value > 0)

  const porMes = MESES.map(mes => ({
    name: new Date(mes + '-01').toLocaleDateString('es-ES', { month: 'short' }),
    total: todosGastos?.filter(g => g.fecha.startsWith(mes)).reduce((s, g) => s + g.cantidad, 0) ?? 0,
  }))

  const promedioMes = porMes.reduce((s, m) => s + m.total, 0) / porMes.filter(m => m.total > 0).length || 0

  const topGastos = gastosMes
    ?.slice()
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5) ?? []

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2 text-sm">
          <p className="text-white">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-full scrollable no-scrollbar bg-[#0f0f1a]">
      <div className="px-4 pt-14 pb-6 space-y-5">
        <h1 className="text-2xl font-bold text-white">Estadísticas</h1>

        {/* Selector de mes */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {MESES.map(m => (
            <button
              key={m}
              onClick={() => setMesSeleccionado(m)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                m === mesSeleccionado
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-slate-400'
              }`}
            >
              {new Date(m + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })}
            </button>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4">
            <p className="text-slate-400 text-xs mb-1">Total del mes</p>
            <p className="text-white font-bold text-xl">{formatCurrency(totalMes)}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-slate-400 text-xs mb-1">Media mensual</p>
            <p className="text-white font-bold text-xl">{formatCurrency(promedioMes)}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-slate-400 text-xs mb-1">Nº de gastos</p>
            <p className="text-white font-bold text-xl">{gastosMes?.length ?? 0}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-slate-400 text-xs mb-1">Gasto medio</p>
            <p className="text-white font-bold text-xl">
              {formatCurrency(gastosMes?.length ? totalMes / gastosMes.length : 0)}
            </p>
          </div>
        </div>

        {/* Gráfica barras 6 meses */}
        <div className="glass rounded-2xl p-4">
          <p className="text-white font-semibold mb-4">Últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={porMes} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfica circular por categoría */}
        {porCategoria.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <p className="text-white font-semibold mb-4">Por categoría</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={porCategoria}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {porCategoria.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {porCategoria.map(cat => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-300">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs">{((cat.value / totalMes) * 100).toFixed(0)}%</span>
                    <span className="text-white font-medium">{formatCurrency(cat.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top 5 gastos */}
        {topGastos.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <p className="text-white font-semibold mb-3">Top gastos del mes</p>
            <div className="space-y-2">
              {topGastos.map((g, i) => {
                const cat = CATEGORIAS.find(c => c.id === g.categoria) ?? CATEGORIAS[CATEGORIAS.length - 1]
                return (
                  <div key={g.id} className="flex items-center gap-3">
                    <span className="text-slate-500 text-sm w-4 shrink-0">#{i + 1}</span>
                    <span className="text-lg w-7 text-center">{cat.emoji}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm">{g.descripcion}</p>
                      <p className="text-slate-500 text-xs">{cat.label}</p>
                    </div>
                    <p className="text-white font-semibold">{formatCurrency(g.cantidad)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {gastosMes?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-slate-400">Sin datos para este mes</p>
          </div>
        )}
      </div>
    </div>
  )
}
