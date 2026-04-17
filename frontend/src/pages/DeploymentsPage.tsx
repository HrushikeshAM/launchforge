import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Rocket, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react"
import axios from "axios"
import { Button } from "../components/ui/button"
import { useNavigate } from "react-router-dom"

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchDeployments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/deploy", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      setDeployments(res.data)
    } catch (error) {
      console.error("Failed to fetch deployments", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeployments()
    // Poll every 10 seconds for updates
    const interval = setInterval(fetchDeployments, 10000)
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

  const getStatus = (status: string) => {
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-emerald-500" />
    if (status === 'failed') return <XCircle className="w-5 h-5 text-rose-500" />
    if (status === 'running') return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
    return <Clock className="w-5 h-5 text-slate-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Deployment History</h1>
          <p className="text-sm text-slate-400">Track and manage your application releases.</p>
        </div>
        <Button variant="outline" onClick={fetchDeployments} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <Card className="bg-[#0f172a]/80 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 text-sm text-slate-400">
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
                        {getStatus(dep.status)}
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
                    <td className="p-4 text-right space-x-2">
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
                {deployments.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No deployments found. Trigger one from the Projects page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
