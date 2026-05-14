import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ShoppingCart, CheckSquare, ChevronRight } from 'lucide-react'
import { db, CATEGORIAS, formatCurrency, mesActual, hoy } from '../db'

export default function Dashboard() {
  const navigate = useNavigate()
  const mes = mesActual()
  const fechaHoy = hoy()

  const gastosMes = useLiveQuery(() =>
    db.gastos.where('fecha').startsWith(mes).toArray(), [mes]
  )

  const tareasHoy = useLiveQuery(() =>
    db.tareas.where('fecha').equals(fechaHoy).toArray(), [fechaHoy]
  )

  const listasActivas = useLiveQuery(() => db.listas.toArray())

  const presupuestos = useLiveQuery(() =>
    db.presupuestos.where('mes').equals(mes).toArray(), [mes]
  )

  const totalMes = gastosMes?.reduce((s, g) => s + g.cantidad, 0) ?? 0
  const tareasPendientes = tareasHoy?.filter(t => !t.completada).length ?? 0
  const totalPresupuesto = presupuestos?.reduce((s, p) => s + p.limite, 0) ?? 0
  const porcentajeGasto = totalPresupuesto > 0 ? Math.min((totalMes / totalPresupuesto) * 100, 100) : 0

  const gastosPorCategoria = CATEGORIAS.map(cat => ({
    ...cat,
    total: gastosMes?.filter(g => g.categoria === cat.id).reduce((s, g) => s + g.cantidad, 0) ?? 0,
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const ultimosGastos = gastosMes?.slice().sort((a, b) =>
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  ).slice(0, 3) ?? []

  const ahora = new Date()
  const hora = ahora.getHours()
  const saludo = hora < 13 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches'

  const mesNombre = ahora.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="h-full scrollable no-scrollbar bg-[#0f0f1a]">
      <div className="px-4 pt-14 pb-4 space-y-4">

        {/* Header */}
        <div>
          <p className="text-slate-400 text-sm">{saludo} 👋</p>
          <h1 className="text-2xl font-bold text-white capitalize">{mesNombre}</h1>
        </div>

        {/* Tarjeta principal de gasto */}
        <div
          onClick={() => navigate('/gastos')}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-5 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-200 text-sm mb-1">Gastado este mes</p>
              <p className="text-4xl font-bold text-white">{formatCurrency(totalMes)}</p>
              {totalPresupuesto > 0 && (
                <p className="text-indigo-200 text-xs mt-1">
                  de {formatCurrency(totalPresupuesto)} presupuestados
                </p>
              )}
            </div>
            <TrendingUp className="text-indigo-300 opacity-80" size={32} />
          </div>
          {totalPresupuesto > 0 && (
            <div className="mt-4">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    porcentajeGasto > 90 ? 'bg-red-400' :
                    porcentajeGasto > 70 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${porcentajeGasto}%` }}
                />
              </div>
              <p className="text-indigo-200 text-xs mt-1">{porcentajeGasto.toFixed(0)}% del presupuesto</p>
            </div>
          )}
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => navigate('/tareas')}
            className="glass rounded-2xl p-4 cursor-pointer active:scale-[0.97] transition-transform"
          >
            <CheckSquare className="text-emerald-400 mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{tareasPendientes}</p>
            <p className="text-slate-400 text-sm">tareas hoy</p>
          </div>
          <div
            onClick={() => navigate('/tienda')}
            className="glass rounded-2xl p-4 cursor-pointer active:scale-[0.97] transition-transform"
          >
            <ShoppingCart className="text-sky-400 mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{listasActivas?.length ?? 0}</p>
            <p className="text-slate-400 text-sm">listas activas</p>
          </div>
        </div>

        {/* Categorías del mes */}
        {gastosPorCategoria.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-white font-semibold">Por categoría</p>
              <button onClick={() => navigate('/estadisticas')} className="text-indigo-400 text-sm flex items-center gap-0.5">
                Ver más <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {gastosPorCategoria.slice(0, 4).map(cat => (
                <div key={cat.id} className="flex items-center gap-3">
                  <span className="text-lg w-7 text-center">{cat.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="text-slate-300">{cat.label}</span>
                      <span className="text-white font-medium">{formatCurrency(cat.total)}</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(cat.total / totalMes) * 100}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Últimos gastos */}
        {ultimosGastos.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-white font-semibold">Últimos gastos</p>
              <button onClick={() => navigate('/gastos')} className="text-indigo-400 text-sm flex items-center gap-0.5">
                Ver todos <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {ultimosGastos.map(g => {
                const cat = CATEGORIAS.find(c => c.id === g.categoria) ?? CATEGORIAS[CATEGORIAS.length - 1]
                return (
                  <div key={g.id} className="flex items-center gap-3">
                    <span className="text-xl w-8 h-8 flex items-center justify-center rounded-xl bg-white/5">
                      {cat.emoji}
                    </span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{g.descripcion}</p>
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
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-white font-medium">Sin gastos este mes</p>
            <p className="text-slate-400 text-sm mt-1">Toca "Gastos" para añadir tu primer gasto</p>
          </div>
        )}
      </div>
    </div>
  )
}
