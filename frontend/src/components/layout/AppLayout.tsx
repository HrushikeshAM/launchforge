import { useState, useEffect } from "react"
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import { 
  LayoutDashboard,
  LogOut,
  FolderGit2,
  Settings,
  Rocket,
  HardDrive,
  TerminalSquare,
  Menu,
  X
} from "lucide-react"

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/app" },
    { name: "Projects", icon: FolderGit2, path: "/app/projects" },
    { name: "Deployments", icon: Rocket, path: "/app/deployments" },
    { name: "Artifacts", icon: HardDrive, path: "/app/artifacts" },
    { name: "Logs", icon: TerminalSquare, path: "/app/logs" },
    { name: "Settings", icon: Settings, path: "/app/settings" },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100">
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and Mobile Slide-over */}
      <aside className={`fixed md:relative z-50 w-64 h-full border-r border-slate-800/60 bg-[#0f172a]/95 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/60">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tighter">
            <Rocket className="w-5 h-5 text-blue-500" />
            <span className="text-white">Launch</span><span className="text-blue-500">Forge</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path))
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/app'}
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
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Navbar */}
        <header className="h-16 px-4 md:px-8 flex items-center gap-4 shrink-0 border-b border-slate-800/60 bg-[#0f172a]/30 backdrop-blur-md sticky top-0 z-30">
          <button 
            className="md:hidden text-slate-400 hover:text-white transition-colors p-1"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold tracking-tight capitalize truncate">
            {location.pathname.split("/").pop() || "Overview"}
          </h2>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
