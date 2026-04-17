import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "../components/ui/card"
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react"
import axios from "axios"
import { Button } from "../components/ui/button"
import { useNavigate } from "react-router-dom"

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const isFetchingRef = useRef(false)
  const navigate = useNavigate()

  const fetchDeployments = async () => {
    // Prevent overlapping requests
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const res = await axios.get("http://localhost:5000/deploy", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      setDeployments(res.data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch deployments", error)
    } finally {
      isFetchingRef.current = false;
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeployments()
    // Poll every 5 seconds, clear on unmount
    const interval = setInterval(fetchDeployments, 5000)
    return () => clearInterval(interval)
  }, [])

  const syncStatus = async (id: string) => {
    try {
      await axios.get(`http://localhost:5000/deploy/${id}/sync`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      fetchDeployments()
    } catch (error) {
      console.error("Failed to sync", error)
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-emerald-500" />
    if (status === 'failed') return <XCircle className="w-5 h-5 text-rose-500" />
    if (status === 'running') return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
    return <Clock className="w-5 h-5 text-slate-500" />
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Deployment History</h1>
          <p className="text-sm text-slate-400">Track and manage your application releases.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {lastUpdated && (
            <div className="text-xs text-slate-400 hidden sm:block">
              Auto syncing...<br/>
              <span className="text-slate-500">Last: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
          <Button variant="outline" onClick={fetchDeployments} className="gap-2 w-full sm:w-auto" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${isFetchingRef.current ? "animate-spin" : ""}`} /> 
            <span className="sm:hidden">Sync</span>
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <Card className="bg-[#0f172a]/80 border-slate-700">
        <CardContent className="p-0">
          
          {loading && deployments.length === 0 ? (
            <div className="p-8 space-y-4">
               {[1,2,3].map(i => (
                 <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
               ))}
            </div>
          ) : deployments.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No deployments found. Trigger one from the Projects page.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700/50 text-sm text-slate-400 whitespace-nowrap">
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Project</th>
                      <th className="p-4 font-medium">Environment</th>
                      <th className="p-4 font-medium">Build #</th>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {deployments.map(dep => (
                      <tr key={dep._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(dep.status)}
                            <span className="capitalize font-medium text-slate-200">{dep.status}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-white">{dep.projectId?.name || "Unknown"}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {dep.environment.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300 font-mono">#{dep.buildNumber || '---'}</td>
                        <td className="p-4 text-slate-400 text-sm">{new Date(dep.createdAt).toLocaleString()}</td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <Button variant="outline" size="sm" onClick={() => syncStatus(dep._id)}>
                            Sync
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            disabled={!dep.buildNumber}
                            onClick={() => navigate(`/app/logs/${dep.buildNumber}`)}
                          >
                            Logs
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden divide-y divide-slate-700/50">
                {deployments.map(dep => (
                  <div key={dep._id} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(dep.status)}
                        <div>
                          <p className="font-medium text-white">{dep.projectId?.name || "Unknown"} <span className="font-mono text-slate-400 text-xs ml-1">#{dep.buildNumber || '---'}</span></p>
                          <p className="text-sm capitalize text-slate-400">{dep.status}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {dep.environment.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-slate-500">{new Date(dep.createdAt).toLocaleString()}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs px-2" onClick={() => syncStatus(dep._id)}>
                          Sync
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-8 text-xs px-2"
                          disabled={!dep.buildNumber}
                          onClick={() => navigate(`/app/logs/${dep.buildNumber}`)}
                        >
                          Logs
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
