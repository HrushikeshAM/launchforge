import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { HardDrive, Download, FileArchive } from "lucide-react"
import axios from "axios"
import { Button } from "../components/ui/button"

export default function ArtifactsPage() {
  const [artifacts, setArtifacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleDownload = async (filename: string) => {
    try {
      const token = localStorage.getItem("token")
      // Quick way to download file in React: create link and click
      window.location.href = `http://localhost:5000/artifacts/download/${filename}?token=${token}` // Ideally we fetch as blob but this is simplest
      // Wait, standard JWT auth cannot be passed nicely in window.location.href without query param. 
      // Alternative: fetch as Blob and trigger download
      const response = await axios.get(`http://localhost:5000/artifacts/download/${filename}`, {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Artifact Center</h1>
          <p className="text-sm text-slate-400">Manage build artifacts stored in Google Cloud Storage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artifacts.map(art => (
          <Card key={art.name} className="bg-[#0f172a]/80 border-slate-700/60 hover:bg-slate-800/80 transition-colors group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <FileArchive className="w-6 h-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-sm font-semibold text-white truncate" title={art.name}>{art.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">{(parseInt(art.size) / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/50">
                <div className="text-xs text-slate-500">
                  {new Date(art.updated).toLocaleDateString()}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDownload(art.name)}
                >
                  <Download className="w-3 h-3" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {artifacts.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 border border-dashed border-slate-700 rounded-xl bg-slate-900/20">
            <HardDrive className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No artifacts in GCS</h3>
            <p className="text-slate-400 max-w-sm mx-auto">Trigger a deployment to generate and upload build artifacts.</p>
          </div>
        )}
      </div>
    </div>
  )
}
