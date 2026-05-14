import Dexie, { type EntityTable } from 'dexie'

export interface Gasto {
  id?: number
  descripcion: string
  cantidad: number
  categoria: string
  fecha: string
  nota?: string
}

export interface Presupuesto {
  id?: number
  categoria: string
  limite: number
  mes: string
}

export interface ItemLista {
  id?: number
  listaId: number
  nombre: string
  cantidad?: string
  completado: boolean
  orden: number
}

export interface Lista {
  id?: number
  nombre: string
  emoji: string
  creadaEn: string
}

export interface Tarea {
  id?: number
  texto: string
  completada: boolean
  prioridad: 'alta' | 'media' | 'baja'
  fecha: string
  hora?: string
}

export interface Nota {
  id?: number
  titulo: string
  contenido: string
  color: string
  creadaEn: string
  actualizadaEn: string
}

export interface Recordatorio {
  id?: number
  titulo: string
  mensaje: string
  fecha: string
  hora: string
  repetir: 'nunca' | 'diario' | 'semanal' | 'mensual'
  activo: boolean
}

class AppDB extends Dexie {
  gastos!: EntityTable<Gasto, 'id'>
  presupuestos!: EntityTable<Presupuesto, 'id'>
  listas!: EntityTable<Lista, 'id'>
  itemsLista!: EntityTable<ItemLista, 'id'>
  tareas!: EntityTable<Tarea, 'id'>
  notas!: EntityTable<Nota, 'id'>
  recordatorios!: EntityTable<Recordatorio, 'id'>

  constructor() {
    super('JAJADailyDB')
    this.version(1).stores({
      gastos: '++id, categoria, fecha',
      presupuestos: '++id, categoria, mes',
      listas: '++id, nombre',
      itemsLista: '++id, listaId, completado',
      tareas: '++id, completada, prioridad, fecha',
      notas: '++id, creadaEn',
      recordatorios: '++id, fecha, activo',
    })
  }
}

export const db = new AppDB()

export const CATEGORIAS = [
  { id: 'comida',       label: 'Comida',        emoji: '🍔', color: '#f97316' },
  { id: 'supermercado', label: 'Supermercado',   emoji: '🛒', color: '#22c55e' },
  { id: 'transporte',   label: 'Transporte',     emoji: '🚗', color: '#3b82f6' },
  { id: 'ocio',         label: 'Ocio',           emoji: '🎮', color: '#a855f7' },
  { id: 'salud',        label: 'Salud',          emoji: '💊', color: '#ec4899' },
  { id: 'ropa',         label: 'Ropa',           emoji: '👕', color: '#06b6d4' },
  { id: 'hogar',        label: 'Hogar',          emoji: '🏠', color: '#eab308' },
  { id: 'suscripciones',label: 'Suscripciones',  emoji: '📱', color: '#6366f1' },
  { id: 'otros',        label: 'Otros',          emoji: '📦', color: '#94a3b8' },
]

export const getCategoriaInfo = (id: string) =>
  CATEGORIAS.find(c => c.id === id) ?? CATEGORIAS[CATEGORIAS.length - 1]

export const mesActual = () => new Date().toISOString().slice(0, 7)
export const hoy = () => new Date().toISOString().slice(0, 10)

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)

export const formatDate = (d: string) =>
  new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(d))
