import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Trash2, X, Bell, BellOff, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { db, type Recordatorio } from '../db'

const REPETIR_LABELS: Record<string, string> = {
  nunca: 'Una vez',
  diario: 'Diario',
  semanal: 'Semanal',
  mensual: 'Mensual',
}

export default function Notificaciones() {
  const [permiso, setPermiso] = useState<NotificationPermission>('default')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [form, setForm] = useState<Omit<Recordatorio, 'id'>>({
    titulo: '', mensaje: '', fecha: new Date().toISOString().slice(0, 10),
    hora: '09:00', repetir: 'nunca', activo: true,
  })

  useEffect(() => {
    if ('Notification' in window) setPermiso(Notification.permission)
  }, [])

  const recordatorios = useLiveQuery(() =>
    db.recordatorios.orderBy('fecha').toArray()
  )

  async function pedirPermiso() {
    if (!('Notification' in window)) return toast.error('Este navegador no soporta notificaciones')
    const p = await Notification.requestPermission()
    setPermiso(p)
    if (p === 'granted') toast.success('¡Notificaciones activadas!')
    else toast.error('Permiso denegado')
  }

  function programarNotificacion(rec: Omit<Recordatorio, 'id'>) {
    if (permiso !== 'granted') return
    const fecha = new Date(`${rec.fecha}T${rec.hora}`)
    const ahora = new Date()
    const ms = fecha.getTime() - ahora.getTime()
    if (ms <= 0) return
    setTimeout(() => {
      new Notification(rec.titulo, {
        body: rec.mensaje || undefined,
        icon: '/icons/icon-192.png',
      })
      if (rec.repetir === 'diario') {
        const nuevaFecha = new Date(fecha)
        nuevaFecha.setDate(nuevaFecha.getDate() + 1)
        programarNotificacion({ ...rec, fecha: nuevaFecha.toISOString().slice(0, 10) })
      } else if (rec.repetir === 'semanal') {
        const nuevaFecha = new Date(fecha)
        nuevaFecha.setDate(nuevaFecha.getDate() + 7)
        programarNotificacion({ ...rec, fecha: nuevaFecha.toISOString().slice(0, 10) })
      } else if (rec.repetir === 'mensual') {
        const nuevaFecha = new Date(fecha)
        nuevaFecha.setMonth(nuevaFecha.getMonth() + 1)
        programarNotificacion({ ...rec, fecha: nuevaFecha.toISOString().slice(0, 10) })
      }
    }, ms)
  }

  async function guardar() {
    if (!form.titulo.trim()) return toast.error('Escribe un título')
    await db.recordatorios.add(form)
    if (form.activo && permiso === 'granted') programarNotificacion(form)
    toast.success('Recordatorio guardado')
    setForm({ titulo: '', mensaje: '', fecha: new Date().toISOString().slice(0, 10), hora: '09:00', repetir: 'nunca', activo: true })
    setMostrarForm(false)
  }

  async function toggleActivo(rec: Recordatorio) {
    await db.recordatorios.update(rec.id!, { activo: !rec.activo })
    if (!rec.activo && permiso === 'granted') programarNotificacion({ ...rec, activo: true })
  }

  async function eliminar(id: number) {
    await db.recordatorios.delete(id)
    setConfirmDelete(null)
    toast.success('Recordatorio eliminado')
  }

  async function probarNotificacion() {
    if (permiso !== 'granted') return pedirPermiso()
    new Notification('🔔 JAJA Daily', {
      body: 'Las notificaciones funcionan correctamente',
      icon: '/icons/icon-192.png',
    })
  }

  return (
    <div className="h-full flex flex-col bg-[#0f0f1a]">
      <div className="px-4 pt-14 pb-3 shrink-0 space-y-3">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Recordatorios</h1>
          <button
            onClick={() => setMostrarForm(true)}
            className="bg-indigo-600 text-white p-2.5 rounded-xl"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Estado del permiso */}
        <div className={`rounded-2xl p-4 flex items-center gap-3 ${
          permiso === 'granted' ? 'bg-emerald-500/10 border border-emerald-500/20' :
          permiso === 'denied'  ? 'bg-red-500/10 border border-red-500/20' :
          'bg-yellow-500/10 border border-yellow-500/20'
        }`}>
          {permiso === 'granted'
            ? <Bell className="text-emerald-400 shrink-0" size={22} />
            : <BellOff className="text-yellow-400 shrink-0" size={22} />
          }
          <div className="flex-1">
            <p className={`font-medium text-sm ${
              permiso === 'granted' ? 'text-emerald-400' :
              permiso === 'denied'  ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {permiso === 'granted' ? 'Notificaciones activadas' :
               permiso === 'denied'  ? 'Permiso denegado' : 'Notificaciones no activadas'}
            </p>
            <p className="text-slate-400 text-xs">
              {permiso === 'granted' ? 'Recibirás avisos en tu dispositivo' :
               permiso === 'denied'  ? 'Actívalas en Ajustes del navegador' :
               'Toca para activar las notificaciones'}
            </p>
          </div>
          {permiso !== 'denied' && permiso !== 'granted' && (
            <button onClick={pedirPermiso} className="bg-yellow-500 text-black text-xs font-semibold px-3 py-1.5 rounded-xl shrink-0">
              Activar
            </button>
          )}
          {permiso === 'granted' && (
            <button onClick={probarNotificacion} className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-xl shrink-0">
              Probar
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 scrollable no-scrollbar px-4 pb-4 space-y-2">
        {recordatorios?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-slate-400">Sin recordatorios</p>
            <p className="text-slate-500 text-sm mt-1">Toca + para crear uno</p>
          </div>
        )}
        {recordatorios?.map(rec => (
          <div key={rec.id} className={`glass rounded-xl p-4 ${!rec.activo ? 'opacity-50' : ''}`}>
            <div className="flex items-start gap-3">
              <Bell className={rec.activo ? 'text-indigo-400' : 'text-slate-600'} size={18} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{rec.titulo}</p>
                {rec.mensaje && <p className="text-slate-400 text-xs mt-0.5">{rec.mensaje}</p>}
                <div className="flex gap-3 mt-1.5 flex-wrap">
                  <span className="text-slate-500 text-xs">📅 {rec.fecha}</span>
                  <span className="text-slate-500 text-xs">⏰ {rec.hora}</span>
                  <span className="text-slate-500 text-xs">🔁 {REPETIR_LABELS[rec.repetir]}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActivo(rec)}>
                  {rec.activo
                    ? <ToggleRight size={22} className="text-indigo-400" />
                    : <ToggleLeft size={22} className="text-slate-600" />
                  }
                </button>
                {confirmDelete === rec.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => eliminar(rec.id!)} className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded-lg">Sí</button>
                    <button onClick={() => setConfirmDelete(null)} className="text-slate-400 text-xs bg-white/5 px-2 py-1 rounded-lg">No</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(rec.id!)} className="text-slate-600 p-1">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal nuevo recordatorio */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={() => setMostrarForm(false)}>
          <div className="bg-[#1a1a2e] rounded-t-3xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-white font-semibold text-lg">Nuevo recordatorio</h2>
              <button onClick={() => setMostrarForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <input
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              placeholder="Título"
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
            />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              placeholder="Mensaje (opcional)"
              value={form.mensaje}
              onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-slate-400 text-sm mb-1">Fecha</p>
                <input
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  value={form.fecha}
                  onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                />
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Hora</p>
                <input
                  type="time"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  value={form.hora}
                  onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Repetir</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(REPETIR_LABELS).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setForm(f => ({ ...f, repetir: k as any }))}
                    className={`py-2.5 rounded-xl text-sm transition-all ${
                      form.repetir === k
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={guardar} className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-semibold">
              Guardar recordatorio
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
