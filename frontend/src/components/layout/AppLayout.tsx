import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Settings, 
  LogOut,
  FolderGit2,
  Rocket,
  HardDrive,
  TerminalSquare
} from "lucide-react"

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/app" },
    { name: "Projects", icon: FolderGit2, path: "/app/projects" },
    { name: "Deployments", icon: Rocket, path: "/app/deployments" },
    { name: "Artifacts", icon: HardDrive, path: "/app/artifacts" },
    { name: "Logs", icon: TerminalSquare, path: "/app/logs" },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/60 bg-[#0f172a]/50 backdrop-blur-xl flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/60">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tighter">
            <Rocket className="w-5 h-5 text-blue-500" />
            <span className="text-white">Launch</span><span className="text-blue-500">Forge</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-blue-600/10 text-blue-400" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-blue-500" : ""}`} />
                {item.name}
              </NavLink>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-800/60">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-8 flex items-center border-b border-slate-800/60 bg-[#0f172a]/30 backdrop-blur-md">
          <h2 className="text-lg font-semibold tracking-tight capitalize">
            {location.pathname.split("/").pop() || "Overview"}
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
