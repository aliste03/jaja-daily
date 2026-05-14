import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Receipt, Wallet, ShoppingCart, CheckSquare, BarChart2, Bell } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Gastos from './pages/Gastos'
import Presupuesto from './pages/Presupuesto'
import Tienda from './pages/Tienda'
import Tareas from './pages/Tareas'
import Estadisticas from './pages/Estadisticas'
import Notificaciones from './pages/Notificaciones'

const NAV = [
  { path: '/',               label: 'Inicio',  Icon: LayoutDashboard },
  { path: '/gastos',         label: 'Gastos',  Icon: Receipt         },
  { path: '/presupuesto',    label: 'Límites', Icon: Wallet          },
  { path: '/tienda',         label: 'Tienda',  Icon: ShoppingCart    },
  { path: '/tareas',         label: 'Tareas',  Icon: CheckSquare     },
  { path: '/estadisticas',   label: 'Stats',   Icon: BarChart2       },
  { path: '/notificaciones', label: 'Avisos',  Icon: Bell            },
]

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full bg-[#0f0f1a]">
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/"               element={<Dashboard />} />
          <Route path="/gastos"         element={<Gastos />} />
          <Route path="/presupuesto"    element={<Presupuesto />} />
          <Route path="/tienda"         element={<Tienda />} />
          <Route path="/tareas"         element={<Tareas />} />
          <Route path="/estadisticas"   element={<Estadisticas />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
        </Routes>
      </main>

      <nav className="shrink-0 border-t border-white/10 bg-[#0f0f1a]/90 backdrop-blur-xl pb-safe">
        <div className="flex items-center justify-around px-1 py-2">
          {NAV.map(({ path, label, Icon }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-150 ${
                  active ? 'text-indigo-400' : 'text-slate-500 active:text-slate-300'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className={`text-[10px] font-medium ${active ? 'opacity-100' : 'opacity-50'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
