import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Trash2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { db, hoy, type Tarea } from '../db'

const PRIORIDADES = [
  { id: 'alta',  label: 'Alta',  color: 'text-red-400',    bg: 'bg-red-400/15',    dot: 'bg-red-400'    },
  { id: 'media', label: 'Media', color: 'text-yellow-400', bg: 'bg-yellow-400/15', dot: 'bg-yellow-400' },
  { id: 'baja',  label: 'Baja',  color: 'text-slate-400',  bg: 'bg-slate-400/15',  dot: 'bg-slate-400'  },
] as const

type Prioridad = 'alta' | 'media' | 'baja'

const DIAS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  return { iso: d.toISOString().slice(0, 10), label: d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }) }
})

export default function Tareas() {
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoy())
  const [mostrarForm, setMostrarForm] = useState(false)
  const [texto, setTexto] = useState('')
  const [prioridad, setPrioridad] = useState<Prioridad>('media')
  const [hora, setHora] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const tareas = useLiveQuery(() =>
    db.tareas.where('fecha').equals(diaSeleccionado).toArray(), [diaSeleccionado]
  )

  const pendientes = tareas?.filter(t => !t.completada) ?? []
  const completadas = tareas?.filter(t => t.completada) ?? []

  async function añadir() {
    if (!texto.trim()) return toast.error('Escribe una tarea')
    await db.tareas.add({
      texto: texto.trim(), completada: false, prioridad,
      fecha: diaSeleccionado, hora: hora || undefined,
    })
    setTexto('')
    setHora('')
    setPrioridad('media')
    setMostrarForm(false)
    toast.success('Tarea añadida')
  }

  async function toggle(t: Tarea) {
    await db.tareas.update(t.id!, { completada: !t.completada })
  }

  async function eliminar(id: number) {
    await db.tareas.delete(id)
    setConfirmDelete(null)
  }

  const renderTarea = (t: Tarea) => {
    const p = PRIORIDADES.find(p => p.id === t.prioridad) ?? PRIORIDADES[1]
    return (
      <div key={t.id} className={`glass rounded-xl px-4 py-3 flex items-start gap-3 ${t.completada ? 'opacity-50' : ''}`}>
        <button
          onClick={() => toggle(t)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            t.completada ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'
          }`}
        >
          {t.completada && <Check size={10} className="text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${t.completada ? 'line-through text-slate-500' : 'text-white'}`}>
            {t.texto}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${p.color} ${p.bg}`}>{p.label}</span>
            {t.hora && <span className="text-slate-500 text-xs">⏰ {t.hora}</span>}
          </div>
        </div>
        {confirmDelete === t.id ? (
          <div className="flex gap-1 shrink-0">
            <button onClick={() => eliminar(t.id!)} className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded-lg">Sí</button>
            <button onClick={() => setConfirmDelete(null)} className="text-slate-400 text-xs bg-white/5 px-2 py-1 rounded-lg">No</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(t.id!)} className="text-slate-600 p-1 shrink-0">
            <Trash2 size={15} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0f0f1a]">
      <div className="px-4 pt-14 pb-2 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Tareas</h1>
          <button
            onClick={() => setMostrarForm(true)}
            className="bg-indigo-600 text-white p-2.5 rounded-xl"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Selector de días */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {DIAS.map(({ iso, label }) => {
            const activo = iso === diaSeleccionado
            return (
              <button
                key={iso}
                onClick={() => setDiaSeleccionado(iso)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activo
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-slate-400 active:bg-white/10'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 scrollable no-scrollbar px-4 pb-4 space-y-2 mt-2">
        {tareas?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-slate-400">Sin tareas este día</p>
            <p className="text-slate-500 text-sm mt-1">Toca + para añadir una tarea</p>
          </div>
        )}

        {pendientes.map(renderTarea)}

        {completadas.length > 0 && (
          <>
            <p className="text-slate-500 text-xs pt-2">Completadas ({completadas.length})</p>
            {completadas.map(renderTarea)}
          </>
        )}
      </div>

      {/* Modal nueva tarea */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={() => setMostrarForm(false)}>
          <div className="bg-[#1a1a2e] rounded-t-3xl w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-white font-semibold text-lg">Nueva tarea</h2>
              <button onClick={() => setMostrarForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <input
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              placeholder="¿Qué tienes que hacer?"
              value={texto}
              onChange={e => setTexto(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && añadir()}
            />
            <div>
              <p className="text-slate-400 text-sm mb-2">Prioridad</p>
              <div className="flex gap-2">
                {PRIORIDADES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPrioridad(p.id)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      prioridad === p.id ? `${p.bg} ${p.color} ring-1 ring-current` : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Hora (opcional)</p>
              <input
                type="time"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                value={hora}
                onChange={e => setHora(e.target.value)}
              />
            </div>
            <button onClick={añadir} className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-semibold">
              Añadir tarea
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
