import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Pencil, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { db, CATEGORIAS, formatCurrency, mesActual } from '../db'

export default function Presupuesto() {
  const mes = mesActual()
  const [editando, setEditando] = useState<string | null>(null)
  const [valores, setValores] = useState<Record<string, string>>({})

  const presupuestos = useLiveQuery(() =>
    db.presupuestos.where('mes').equals(mes).toArray(), [mes]
  )

  const gastosMes = useLiveQuery(() =>
    db.gastos.where('fecha').startsWith(mes).toArray(), [mes]
  )

  const totalPresupuestado = presupuestos?.reduce((s, p) => s + p.limite, 0) ?? 0
  const totalGastado = gastosMes?.reduce((s, g) => s + g.cantidad, 0) ?? 0

  async function guardar(categoriaId: string) {
    const val = parseFloat(valores[categoriaId] ?? '0')
    if (isNaN(val) || val < 0) return toast.error('Cantidad inválida')
    const existing = presupuestos?.find(p => p.categoria === categoriaId)
    if (existing?.id) {
      if (val === 0) {
        await db.presupuestos.delete(existing.id)
        toast.success('Presupuesto eliminado')
      } else {
        await db.presupuestos.update(existing.id, { limite: val })
        toast.success('Presupuesto actualizado')
      }
    } else if (val > 0) {
      await db.presupuestos.add({ categoria: categoriaId, limite: val, mes })
      toast.success('Presupuesto creado')
    }
    setEditando(null)
  }

  function iniciarEdicion(categoriaId: string) {
    const p = presupuestos?.find(p => p.categoria === categoriaId)
    setValores(v => ({ ...v, [categoriaId]: p ? String(p.limite) : '' }))
    setEditando(categoriaId)
  }

  return (
    <div className="h-full scrollable no-scrollbar bg-[#0f0f1a]">
      <div className="px-4 pt-14 pb-6 space-y-4">
        <h1 className="text-2xl font-bold text-white">Presupuesto</h1>

        {/* Resumen global */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="flex justify-between">
            <div>
              <p className="text-slate-400 text-xs">Gastado</p>
              <p className="text-white font-bold text-xl">{formatCurrency(totalGastado)}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Presupuestado</p>
              <p className="text-white font-bold text-xl">{formatCurrency(totalPresupuestado)}</p>
            </div>
          </div>
          {totalPresupuestado > 0 && (
            <>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    totalGastado / totalPresupuestado > 0.9 ? 'bg-red-400' :
                    totalGastado / totalPresupuestado > 0.7 ? 'bg-yellow-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min((totalGastado / totalPresupuestado) * 100, 100)}%` }}
                />
              </div>
              <p className="text-slate-400 text-xs text-center">
                Queda {formatCurrency(Math.max(totalPresupuestado - totalGastado, 0))}
              </p>
            </>
          )}
        </div>

        {/* Por categoría */}
        <p className="text-slate-400 text-sm">Toca el lápiz para establecer un límite</p>
        <div className="space-y-2">
          {CATEGORIAS.map(cat => {
            const presupuesto = presupuestos?.find(p => p.categoria === cat.id)
            const gastado = gastosMes?.filter(g => g.categoria === cat.id).reduce((s, g) => s + g.cantidad, 0) ?? 0
            const limite = presupuesto?.limite ?? 0
            const pct = limite > 0 ? Math.min((gastado / limite) * 100, 100) : 0
            const excedido = limite > 0 && gastado > limite

            return (
              <div key={cat.id} className="glass rounded-xl p-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-white text-sm font-medium">{cat.label}</span>
                      {editando === cat.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            inputMode="decimal"
                            autoFocus
                            className="w-24 bg-white/10 border border-indigo-500 rounded-lg px-2 py-0.5 text-white text-sm focus:outline-none text-right"
                            placeholder="0"
                            value={valores[cat.id] ?? ''}
                            onChange={e => setValores(v => ({ ...v, [cat.id]: e.target.value }))}
                          />
                          <button onClick={() => guardar(cat.id)} className="text-emerald-400 p-1"><Check size={16} /></button>
                          <button onClick={() => setEditando(null)} className="text-slate-400 p-1"><X size={16} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${excedido ? 'text-red-400' : 'text-slate-300'}`}>
                            {formatCurrency(gastado)}
                            {limite > 0 && <span className="text-slate-500"> / {formatCurrency(limite)}</span>}
                          </span>
                          <button onClick={() => iniciarEdicion(cat.id)} className="text-slate-500 p-1">
                            {limite > 0 ? <Pencil size={14} /> : <Plus size={14} />}
                          </button>
                        </div>
                      )}
                    </div>
                    {limite > 0 && (
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            excedido ? 'bg-red-400' : pct > 70 ? 'bg-yellow-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${pct}%`, backgroundColor: excedido ? undefined : cat.color + 'cc' }}
                        />
                      </div>
                    )}
                    {excedido && (
                      <p className="text-red-400 text-xs mt-0.5">
                        ⚠️ Excedido en {formatCurrency(gastado - limite)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
