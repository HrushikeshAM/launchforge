import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { Terminal, Loader2 } from "lucide-react"
import axios from "axios"

export default function LogsPage() {
  const { buildId } = useParams()
  const [logs, setLogs] = useState<string>("Waiting for logs...")
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [targetBuildId, setTargetBuildId] = useState(buildId || "")
  const endOfLogsRef = useRef<HTMLDivElement>(null)

  const fetchLogs = async (id: string) => {
    if (!id) return
    setLoading(true)
    try {
      const res = await axios.get(`http://localhost:5000/logs/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      setLogs(res.data.logs)
      setStatus(res.data.status)
    } catch (error) {
      setLogs("Failed to fetch logs. Jenkins might not have this build number or is unreachable.\n\nError: " + error)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (buildId) {
      fetchLogs(buildId)
    }
  }, [buildId])

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLogs(targetBuildId)
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Build Logs</h1>
          <p className="text-sm text-slate-400">Streamed console output directly from Jenkins.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-[#0c111a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        <div className="h-12 bg-[#1e293b] border-b border-slate-800 flex items-center px-4 justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono text-slate-300">
              {status ? `Jenkins Output • Build #${targetBuildId} • ${status.building ? 'RUNNING' : status.result}` : 'Jenkins Terminal'}
            </span>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 items-center">
            <input 
              type="text" 
              placeholder="Build #" 
              value={targetBuildId}
              onChange={(e) => setTargetBuildId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs px-2 py-1 rounded w-20 text-slate-300 focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded border border-slate-700 transition">
              {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Fetch"}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed text-slate-300 relative">
          {loading && (
            <div className="absolute inset-0 bg-[#0c111a]/50 backdrop-blur-[2px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}
          <pre className="whitespace-pre-wrap break-all">
            {logs}
          </pre>
          <div ref={endOfLogsRef} />
        </div>
      </div>
    </div>
  )
}
