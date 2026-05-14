import { ExternalLink, Globe, ShoppingBag, MapPin, Camera } from 'lucide-react'

const URL_WEB       = 'https://arbeladonosti.com'
const URL_INSTAGRAM = 'https://www.instagram.com/arbeladonosti'

export default function WebTienda() {
  return (
    <div className="h-full scrollable no-scrollbar bg-[#0f0f1a]">
      <div className="px-4 pt-14 pb-8 flex flex-col gap-5">

        {/* Header */}
        <div>
          <p className="text-slate-400 text-sm">Acceso rápido</p>
          <h1 className="text-2xl font-bold text-white">Arbela Donosti</h1>
        </div>

        {/* Tarjeta principal */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 to-indigo-800 p-6">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />
          <ShoppingBag size={36} className="text-white/80 mb-3" />
          <p className="text-white font-bold text-xl">arbeladonosti.com</p>
          <p className="text-violet-200 text-sm mt-1">Tu tienda online</p>
          <a
            href={URL_WEB}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 bg-white text-violet-800 font-bold py-3.5 rounded-xl active:scale-[0.97] transition-transform"
          >
            <ExternalLink size={18} />
            Abrir web
          </a>
        </div>

        {/* Accesos directos */}
        <div>
          <p className="text-slate-400 text-sm mb-3">Accesos directos</p>
          <div className="space-y-2">

            <a
              href={URL_WEB}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl px-4 py-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Globe size={20} className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Web principal</p>
                <p className="text-slate-500 text-xs">arbeladonosti.com</p>
              </div>
              <ExternalLink size={16} className="text-slate-600" />
            </a>

            <a
              href={`${URL_WEB}/tienda`}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl px-4 py-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <ShoppingBag size={20} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Tienda online</p>
                <p className="text-slate-500 text-xs">Catálogo de productos</p>
              </div>
              <ExternalLink size={16} className="text-slate-600" />
            </a>

            <a
              href={URL_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-xl px-4 py-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0">
                <Camera size={20} className="text-pink-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Instagram</p>
                <p className="text-slate-500 text-xs">@arbeladonosti</p>
              </div>
              <ExternalLink size={16} className="text-slate-600" />
            </a>

          </div>
        </div>

        {/* Info */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <p className="text-white font-semibold">Información</p>
          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
            <p className="text-slate-300 text-sm">San Sebastián, Donostia</p>
          </div>
        </div>

      </div>
    </div>
  )
}
