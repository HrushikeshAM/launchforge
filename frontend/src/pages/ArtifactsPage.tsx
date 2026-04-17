import { useState, useEffect } from "react"
import { Card, CardContent } from "../components/ui/card"
import { HardDrive, Download, FileArchive, Trash2, RefreshCw } from "lucide-react"
import axios from "axios"
import { Button } from "../components/ui/button"

export default function ArtifactsPage() {
  const [artifacts, setArtifacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchArtifacts()
  }, [])

  const fetchArtifacts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/artifacts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      setArtifacts(res.data)
    } catch (error) {
      console.error("Failed to fetch artifacts", error)
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytesStr: string | number) => {
    const bytes = parseInt(String(bytesStr), 10) || 0;
    if (bytes === 0) return "0 Bytes";
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(2) + " KB";
    return (kb / 1024).toFixed(2) + " MB";
  }

  const handleDownload = async (filename: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`http://localhost:5000/artifacts/download/${encodeURIComponent(filename)}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      alert("Failed to download artifact")
    }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete artifact "${filename}"? This cannot be undone.`)) return
    setDeleting(filename)
    try {
      await axios.delete(`http://localhost:5000/artifacts/${encodeURIComponent(filename)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      setArtifacts(prev => prev.filter(a => a.name !== filename))
    } catch (error) {
      alert("Failed to delete artifact")
    } finally {
      setDeleting(null)
    }
  }

  // Extract project name from artifact filename (e.g. "myapp_42.zip" -> "myapp")
  const getProjectName = (name: string) => {
    const base = name.replace(/\.zip$/i, '')
    const parts = base.split('_')
    if (parts.length >= 2) {
      // Everything except the last part (build number)
      return parts.slice(0, -1).join('_')
    }
    return 'Unknown'
  }

  // Group artifacts by project
  const grouped: Record<string, any[]> = {}
  artifacts.forEach(art => {
    const project = getProjectName(art.name)
    if (!grouped[project]) grouped[project] = []
    grouped[project].push(art)
  })

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Artifact Center</h1>
          <p className="text-sm text-slate-400">Manage build artifacts stored in Google Cloud Storage.</p>
        </div>
        <Button variant="outline" onClick={fetchArtifacts} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {loading && artifacts.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1,2,3].map(i => (
            <Card key={i} className="bg-[#0f172a]/80 border-slate-700/60 animate-pulse">
              <CardContent className="p-6 h-36" />
            </Card>
          ))}
        </div>
      ) : artifacts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-700 rounded-xl bg-slate-900/20">
          <HardDrive className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No artifacts in GCS</h3>
          <p className="text-slate-400 max-w-sm mx-auto px-4">Trigger a deployment to generate and upload build artifacts.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([projectName, items]) => (
            <div key={projectName}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <h2 className="text-lg font-semibold text-white">{projectName}</h2>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{items.length} artifact{items.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {items.map(art => (
                  <Card key={art.name} className="bg-[#0f172a]/80 border-slate-700/60 hover:bg-slate-800/80 transition-colors group">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                          <FileArchive className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate" title={art.name}>{art.name}</h3>
                          <p className="text-xs text-slate-400 font-mono mt-1">{formatSize(art.size)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/50">
                        <div className="text-xs text-slate-500">
                          {new Date(art.updated).toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1.5 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDownload(art.name)}
                          >
                            <Download className="w-3 h-3" />
                            <span className="hidden sm:inline">Download</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1.5 text-rose-400 border-rose-500/20 hover:bg-rose-500/10 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDelete(art.name)}
                            disabled={deleting === art.name}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
