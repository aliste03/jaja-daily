import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Trash2, ChevronRight, X, Check, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { db, type Lista, type ItemLista } from '../db'

const EMOJIS_LISTA = ['🛒', '🏠', '💊', '🎁', '🐾', '🌿', '🧹', '📦', '🍽️', '👕']

export default function Tienda() {
  const [listaSeleccionada, setListaSeleccionada] = useState<Lista | null>(null)
  const [mostrarFormLista, setMostrarFormLista] = useState(false)
  const [mostrarFormItem, setMostrarFormItem] = useState(false)
  const [nombreLista, setNombreLista] = useState('')
  const [emojiLista, setEmojiLista] = useState('🛒')
  const [nuevoItem, setNuevoItem] = useState('')
  const [cantidadItem, setCantidadItem] = useState('')
  const [confirmDeleteLista, setConfirmDeleteLista] = useState<number | null>(null)

  const listas = useLiveQuery(() => db.listas.toArray())

  const items = useLiveQuery(async () => {
    if (!listaSeleccionada?.id) return []
    return db.itemsLista.where('listaId').equals(listaSeleccionada.id).sortBy('orden')
  }, [listaSeleccionada?.id])

  const itemsPendientes = items?.filter(i => !i.completado).length ?? 0
  const itemsTotales = items?.length ?? 0

  async function crearLista() {
    if (!nombreLista.trim()) return toast.error('Escribe un nombre')
    await db.listas.add({ nombre: nombreLista.trim(), emoji: emojiLista, creadaEn: new Date().toISOString() })
    setNombreLista('')
    setEmojiLista('🛒')
    setMostrarFormLista(false)
    toast.success('Lista creada')
  }

  async function eliminarLista(id: number) {
    await db.itemsLista.where('listaId').equals(id).delete()
    await db.listas.delete(id)
    setConfirmDeleteLista(null)
    if (listaSeleccionada?.id === id) setListaSeleccionada(null)
    toast.success('Lista eliminada')
  }

  async function añadirItem() {
    if (!nuevoItem.trim() || !listaSeleccionada?.id) return
    const orden = (items?.length ?? 0)
    await db.itemsLista.add({
      listaId: listaSeleccionada.id,
      nombre: nuevoItem.trim(),
      cantidad: cantidadItem.trim() || undefined,
      completado: false,
      orden,
    })
    setNuevoItem('')
    setCantidadItem('')
    setMostrarFormItem(false)
  }

  async function toggleItem(item: ItemLista) {
    await db.itemsLista.update(item.id!, { completado: !item.completado })
  }

  async function eliminarItem(id: number) {
    await db.itemsLista.delete(id)
  }

  async function limpiarCompletados() {
    if (!listaSeleccionada?.id) return
    const completados = items?.filter(i => i.completado).map(i => i.id!) ?? []
    await db.itemsLista.bulkDelete(completados)
    toast.success('Completados eliminados')
  }

  // Vista de lista de listas
  if (!listaSeleccionada) return (
    <div className="h-full flex flex-col bg-[#0f0f1a]">
      <div className="px-4 pt-14 pb-3 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Tienda</h1>
          <button
            onClick={() => setMostrarFormLista(true)}
            className="bg-indigo-600 active:bg-indigo-700 text-white p-2.5 rounded-xl"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 scrollable no-scrollbar px-4 pb-4 space-y-2">
        {listas?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🛒</p>
            <p className="text-slate-400">Sin listas aún</p>
            <p className="text-slate-500 text-sm mt-1">Toca + para crear tu primera lista</p>
          </div>
        )}
        {listas?.map(lista => (
          <div
            key={lista.id}
            className="glass rounded-xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => setListaSeleccionada(lista)}
          >
            <span className="text-2xl w-10 text-center">{lista.emoji}</span>
            <div className="flex-1">
              <p className="text-white font-medium">{lista.nombre}</p>
              <p className="text-slate-500 text-xs">
                {new Date(lista.creadaEn).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {confirmDeleteLista === lista.id ? (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); eliminarLista(lista.id!) }}
                    className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded-lg"
                  >Sí</button>
                  <button
                    onClick={e => { e.stopPropagation(); setConfirmDeleteLista(null) }}
                    className="text-slate-400 text-xs bg-white/5 px-2 py-1 rounded-lg"
                  >No</button>
                </>
              ) : (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); setConfirmDeleteLista(lista.id!) }}
                    className="text-slate-600 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} className="text-slate-600" />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal nueva lista */}
      {mostrarFormLista && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={() => setMostrarFormLista(false)}>
          <div className="bg-[#1a1a2e] rounded-t-3xl w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-white font-semibold text-lg">Nueva lista</h2>
              <button onClick={() => setMostrarFormLista(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <input
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              placeholder="Nombre de la lista"
              value={nombreLista}
              onChange={e => setNombreLista(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && crearLista()}
            />
            <div>
              <p className="text-slate-400 text-sm mb-2">Icono</p>
              <div className="flex gap-2 flex-wrap">
                {EMOJIS_LISTA.map(em => (
                  <button
                    key={em}
                    onClick={() => setEmojiLista(em)}
                    className={`text-2xl p-2 rounded-xl transition-all ${emojiLista === em ? 'bg-indigo-500/30 ring-1 ring-indigo-500' : 'bg-white/5'}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={crearLista} className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-semibold">
              Crear lista
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // Vista de items de una lista
  const completados = items?.filter(i => i.completado) ?? []
  const pendientes = items?.filter(i => !i.completado) ?? []

  return (
    <div className="h-full flex flex-col bg-[#0f0f1a]">
      <div className="px-4 pt-14 pb-3 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => setListaSeleccionada(null)} className="text-slate-400 p-1">
            <ArrowLeft size={22} />
          </button>
          <span className="text-2xl">{listaSeleccionada.emoji}</span>
          <h1 className="text-xl font-bold text-white flex-1">{listaSeleccionada.nombre}</h1>
          <button
            onClick={() => setMostrarFormItem(true)}
            className="bg-indigo-600 text-white p-2 rounded-xl"
          >
            <Plus size={18} />
          </button>
        </div>
        <p className="text-slate-500 text-sm ml-12">
          {itemsPendientes} de {itemsTotales} pendientes
        </p>
        {completados.length > 0 && (
          <button onClick={limpiarCompletados} className="text-indigo-400 text-xs ml-12 mt-1">
            Limpiar completados
          </button>
        )}
      </div>

      <div className="flex-1 scrollable no-scrollbar px-4 pb-4 space-y-1.5">
        {items?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-slate-400">Lista vacía</p>
            <p className="text-slate-500 text-sm mt-1">Toca + para añadir productos</p>
          </div>
        )}

        {pendientes.map(item => (
          <div key={item.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => toggleItem(item)}
              className="w-6 h-6 rounded-full border-2 border-indigo-400 flex items-center justify-center shrink-0"
            />
            <div className="flex-1">
              <p className="text-white">{item.nombre}</p>
              {item.cantidad && <p className="text-slate-500 text-xs">{item.cantidad}</p>}
            </div>
            <button onClick={() => eliminarItem(item.id!)} className="text-slate-600 p-1">
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        {completados.length > 0 && (
          <>
            <p className="text-slate-500 text-xs pt-2 pb-1">Completados</p>
            {completados.map(item => (
              <div key={item.id} className="rounded-xl px-4 py-3 flex items-center gap-3 bg-white/3 opacity-60">
                <button
                  onClick={() => toggleItem(item)}
                  className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"
                >
                  <Check size={12} className="text-white" />
                </button>
                <p className="text-slate-400 line-through flex-1">{item.nombre}</p>
                <button onClick={() => eliminarItem(item.id!)} className="text-slate-700 p-1">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Modal añadir item */}
      {mostrarFormItem && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={() => setMostrarFormItem(false)}>
          <div className="bg-[#1a1a2e] rounded-t-3xl w-full p-6 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-white font-semibold text-lg">Añadir producto</h2>
              <button onClick={() => setMostrarFormItem(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <input
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              placeholder="Nombre del producto"
              value={nuevoItem}
              onChange={e => setNuevoItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && añadirItem()}
            />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              placeholder="Cantidad (ej: 2 kg, 1 bote) — opcional"
              value={cantidadItem}
              onChange={e => setCantidadItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && añadirItem()}
            />
            <button onClick={añadirItem} className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-semibold">
              Añadir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
