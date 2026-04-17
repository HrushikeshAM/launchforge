import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Terminal, Loader2, Minimize2, Maximize2, ArrowLeft } from "lucide-react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

export default function LogsPage() {
  const { buildId } = useParams()
  const navigate = useNavigate()
  const [logs, setLogs] = useState<string>("Waiting for logs...")
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [targetBuildId, setTargetBuildId] = useState(buildId || "")
  const [isMinimized, setIsMinimized] = useState(false)
  
  const bottomRef = useRef<HTMLDivElement>(null)
  const logsContainerRef = useRef<HTMLDivElement>(null)
  const isFetchingRef = useRef(false)
  const isUserScrollingRef = useRef(false)

  const fetchLogs = async (id: string, isPoll = false) => {
    if (!id || isFetchingRef.current) return
    isFetchingRef.current = true
    if (!isPoll) setLoading(true)
      
    try {
      const res = await axios.get(`http://localhost:5000/logs/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      setLogs(res.data.logs)
      setStatus(res.data.status)
    } catch (error) {
      setLogs((prev) => !isPoll ? "Failed to fetch logs. Jenkins might not have this build number or is unreachable.\n\nError: " + error : prev)
      setStatus(null)
    } finally {
      isFetchingRef.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    if (buildId) {
      fetchLogs(buildId)
    }
  }, [buildId])

  // Poll logs every 3s
  useEffect(() => {
    if (!targetBuildId) return
    const interval = setInterval(() => {
      // Only poll if it's building or we don't have status yet
      if (!status || status.building) {
        fetchLogs(targetBuildId, true)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [targetBuildId, status])

  // Preserve scroll / Auto scroll
  useEffect(() => {
    if (!isUserScrollingRef.current && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs])

  const handleScroll = () => {
    if (!logsContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current
    // If user scrolls up, stop auto-scrolling
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    isUserScrollingRef.current = !isAtBottom
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/app/logs/${targetBuildId}`)
  }

  return (
    <>
      {/* Minimized Floating Terminal */}
      <AnimatePresence>
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-6 right-6 z-50 w-72 bg-[#0c111a] border border-slate-700 shadow-2xl rounded-xl overflow-hidden cursor-pointer hover:border-slate-500 transition-colors"
            onClick={() => setIsMinimized(false)}
          >
            <div className="flex items-center justify-between bg-[#1e293b] px-3 py-2 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-slate-300 truncate">
                  Build #{targetBuildId} {status?.building ? '(Running)' : ''}
                </span>
              </div>
              <Maximize2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="h-20 bg-[#0c111a] p-3 overflow-hidden text-[10px] font-mono text-slate-500">
              <pre className="opacity-50">{logs.slice(-200)}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Logs View */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:static md:z-auto bg-[#020617] md:bg-transparent flex flex-col md:h-full p-4 md:p-0 space-y-4"
          >
            <div className="flex justify-between items-center flex-shrink-0 pt-10 md:pt-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/app/deployments')}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-0.5 md:mb-1">Build Logs</h1>
                  <p className="text-xs md:text-sm text-slate-400">Streamed console output directly from Jenkins.</p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-[#0c111a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
              <div className="h-14 bg-[#1e293b] border-b border-slate-800 flex items-center px-4 justify-between flex-shrink-0 gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Terminal className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-xs font-mono text-slate-300 truncate">
                    {status ? `Jenkins Output • Build #${targetBuildId} • ${status.building ? 'RUNNING' : status.result}` : 'Jenkins Terminal'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <form onSubmit={handleSearch} className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Build #" 
                      value={targetBuildId}
                      onChange={(e) => setTargetBuildId(e.target.value)}
                      className="hidden sm:block bg-slate-900 border border-slate-700 text-xs px-2 py-1.5 rounded w-20 text-slate-300 focus:outline-none focus:border-blue-500"
                    />
                    <button type="submit" className="hidden sm:flex text-xs bg-slate-800 hover:bg-slate-700 text-white px-2 py-1.5 rounded border border-slate-700 transition w-14 justify-center items-center">
                      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Fetch"}
                    </button>
                  </form>
                  <button 
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Minimize Logs"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div 
                ref={logsContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-auto p-4 font-mono text-[12px] md:text-[13px] leading-relaxed text-slate-300 relative"
              >
                {loading && !logs.includes("Failed") && (
                  <div className="absolute inset-0 bg-[#0c111a]/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                )}
                <pre className="whitespace-pre-wrap break-all">
                  {logs}
                </pre>
                <div ref={bottomRef} className="h-4 w-full" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
