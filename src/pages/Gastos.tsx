import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Trash2, X, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { db, CATEGORIAS, formatCurrency, formatDate, hoy, type Gasto } from '../db'

type Modo = 'lista' | 'form'

const MESES = Array.from({ length: 12 }, (_, i) => {
  const d = new Date()
  d.setMonth(d.getMonth() - i)
  return d.toISOString().slice(0, 7)
})

export default function Gastos() {
  const [modo, setModo] = useState<Modo>('lista')
  const [filtroMes, setFiltroMes] = useState(new Date().toISOString().slice(0, 7))
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const [form, setForm] = useState<Omit<Gasto, 'id'>>({
    descripcion: '', cantidad: 0, categoria: 'comida', fecha: hoy(), nota: '',
  })

  const gastos = useLiveQuery(async () => {
    const todos = await db.gastos.where('fecha').startsWith(filtroMes).toArray()
    return todos
      .filter(g => filtroCategoria === 'todas' || g.categoria === filtroCategoria)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [filtroMes, filtroCategoria])

  const total = gastos?.reduce((s, g) => s + g.cantidad, 0) ?? 0

  async function guardar() {
    if (!form.descripcion.trim()) return toast.error('Escribe una descripción')
    if (form.cantidad <= 0) return toast.error('La cantidad debe ser mayor a 0')
    await db.gastos.add({ ...form })
    toast.success('Gasto añadido ✓')
    setForm({ descripcion: '', cantidad: 0, categoria: 'comida', fecha: hoy(), nota: '' })
    setModo('lista')
  }

  async function eliminar(id: number) {
    await db.gastos.delete(id)
    setConfirmDelete(null)
    toast.success('Gasto eliminado')
  }

  if (modo === 'form') return (
    <div className="h-full scrollable no-scrollbar bg-[#0f0f1a]">
      <div className="px-4 pt-14 pb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Nuevo gasto</h1>
          <button onClick={() => setModo('lista')} className="text-slate-400 p-1">
            <X size={24} />
          </button>
        </div>

        {/* Descripción */}
        <div>
          <label className="text-slate-400 text-sm mb-1 block">Descripción</label>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            placeholder="¿En qué gastaste?"
            value={form.descripcion}
            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
          />
        </div>

        {/* Cantidad */}
        <div>
          <label className="text-slate-400 text-sm mb-1 block">Cantidad (€)</label>
          <input
            type="number"
            inputMode="decimal"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xl font-semibold"
            placeholder="0.00"
            value={form.cantidad || ''}
            onChange={e => setForm(f => ({ ...f, cantidad: parseFloat(e.target.value) || 0 }))}
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="text-slate-400 text-sm mb-2 block">Categoría</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIAS.map(cat => (
              <button
                key={cat.id}
                onClick={() => setForm(f => ({ ...f, categoria: cat.id }))}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                  form.categoria === cat.id
                    ? 'border-indigo-500 bg-indigo-500/20'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-xs text-slate-300">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fecha */}
        <div>
          <label className="text-slate-400 text-sm mb-1 block">Fecha</label>
          <input
            type="date"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            value={form.fecha}
            onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
          />
        </div>

        {/* Nota */}
        <div>
          <label className="text-slate-400 text-sm mb-1 block">Nota (opcional)</label>
          <textarea
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none h-20"
            placeholder="Detalles adicionales..."
            value={form.nota}
            onChange={e => setForm(f => ({ ...f, nota: e.target.value }))}
          />
        </div>

        <button
          onClick={guardar}
          className="w-full bg-indigo-600 active:bg-indigo-700 text-white font-semibold py-4 rounded-2xl transition-colors text-lg"
        >
          Guardar gasto
        </button>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-[#0f0f1a]">
      <div className="px-4 pt-14 pb-3 space-y-3 shrink-0">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Gastos</h1>
          <button
            onClick={() => setModo('form')}
            className="bg-indigo-600 active:bg-indigo-700 text-white p-2.5 rounded-xl transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <select
              className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none pr-8"
              value={filtroMes}
              onChange={e => setFiltroMes(e.target.value)}
            >
              {MESES.map(m => (
                <option key={m} value={m} className="bg-[#1a1a2e]">
                  {new Date(m + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative flex-1">
            <select
              className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none pr-8"
              value={filtroCategoria}
              onChange={e => setFiltroCategoria(e.target.value)}
            >
              <option value="todas" className="bg-[#1a1a2e]">Todas</option>
              {CATEGORIAS.map(c => (
                <option key={c.id} value={c.id} className="bg-[#1a1a2e]">{c.emoji} {c.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Total */}
        <div className="glass rounded-xl px-4 py-3 flex justify-between items-center">
          <span className="text-slate-400 text-sm">Total del período</span>
          <span className="text-white font-bold text-lg">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 scrollable no-scrollbar px-4 pb-4 space-y-2">
        {gastos?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-slate-400">Sin gastos en este período</p>
          </div>
        )}
        {gastos?.map(g => {
          const cat = CATEGORIAS.find(c => c.id === g.categoria) ?? CATEGORIAS[CATEGORIAS.length - 1]
          return (
            <div key={g.id} className="glass rounded-xl p-3.5 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: cat.color + '25' }}
              >
                {cat.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{g.descripcion}</p>
                <p className="text-slate-500 text-xs">{cat.label} · {formatDate(g.fecha)}</p>
                {g.nota && <p className="text-slate-500 text-xs truncate">{g.nota}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-white font-semibold">{formatCurrency(g.cantidad)}</span>
                {confirmDelete === g.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => eliminar(g.id!)} className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded-lg">
                      Sí
                    </button>
                    <button onClick={() => setConfirmDelete(null)} className="text-slate-400 text-xs bg-white/5 px-2 py-1 rounded-lg">
                      No
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(g.id!)} className="text-slate-600 p-1">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
