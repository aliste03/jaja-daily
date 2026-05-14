import { useState } from 'react'
import { RefreshCw, ExternalLink, Globe } from 'lucide-react'

const URL = 'https://arbeladonosti.com'

export default function WebTienda() {
  const [key, setKey] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  function recargar() {
    setKey(k => k + 1)
    setCargando(true)
    setError(false)
  }

  return (
    <div className="h-full flex flex-col bg-[#0f0f1a]">
      {/* Header */}
      <div className="shrink-0 px-4 pt-14 pb-3 flex items-center gap-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <Globe size={18} className="text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight">Arbela Donosti</p>
          <p className="text-slate-500 text-xs truncate">arbeladonosti.com</p>
        </div>
        <button
          onClick={recargar}
          className="text-slate-400 p-2 rounded-xl bg-white/5 active:bg-white/10"
        >
          <RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />
        </button>
        <a
          href={URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 p-2 rounded-xl bg-white/5 active:bg-white/10"
        >
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Contenido */}
      <div className="flex-1 relative overflow-hidden">
        {cargando && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-[#0f0f1a]">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 text-sm">Cargando Arbela Donosti...</p>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <Globe size={48} className="text-slate-600" />
            <div>
              <p className="text-white font-semibold">No se puede cargar en la app</p>
              <p className="text-slate-400 text-sm mt-1">
                La web bloquea la carga dentro de otras apps. Ábrela en Safari directamente.
              </p>
            </div>
            <a
              href={URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-semibold"
            >
              <ExternalLink size={18} />
              Abrir en Safari
            </a>
          </div>
        ) : (
          <iframe
            key={key}
            src={URL}
            className="w-full h-full border-0"
            onLoad={() => setCargando(false)}
            onError={() => { setError(true); setCargando(false) }}
            title="Arbela Donosti"
            allow="fullscreen"
          />
        )}
      </div>
    </div>
  )
}
