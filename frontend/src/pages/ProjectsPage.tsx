import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { GitBranch, Plus, Rocket } from "lucide-react"
import axios from "axios"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [name, setName] = useState("")
  const [githubRepoUrl, setGithubRepoUrl] = useState("")
  const [githubBranch, setGithubBranch] = useState("main")

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/projects", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      setProjects(res.data)
    } catch (error) {
      console.error("Failed to fetch projects", error)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post("http://localhost:5000/projects", 
        { name, githubRepoUrl, githubBranch },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }}
      )
      fetchProjects()
      setName("")
      setGithubRepoUrl("")
      setGithubBranch("main")
    } catch (error) {
      console.error("Failed to create project", error)
    }
  }

  const handleDeploy = async (projectId: string) => {
    try {
      await axios.post(`http://localhost:5000/deploy/${projectId}`, 
        { environment: "prod" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }}
      )
      alert("Deployment triggered successfully!")
    } catch (error) {
      alert("Failed to trigger deployment.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Your Projects</h1>
          <p className="text-sm text-slate-400">Connect GitHub repositories and launch them instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {projects.map(proj => (
            <Card key={proj._id} className="bg-[#0f172a]/60 border-slate-700 hover:border-blue-500/50 transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                    <GitBranch className="w-6 h-6 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{proj.name}</h3>
                    <p className="text-sm text-blue-400 font-mono mt-1">{proj.githubRepoUrl} • {proj.githubBranch}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="gradient" onClick={() => handleDeploy(proj._id)} className="gap-2">
                    <Rocket className="w-4 h-4" />
                    Deploy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {projects.length === 0 && (
            <div className="text-center py-12 border border-dashed border-slate-700 rounded-xl bg-slate-900/20">
              <GitBranch className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
              <p className="text-slate-400 max-w-sm mx-auto">Create your first project by connecting a GitHub repository on the right.</p>
            </div>
          )}
        </div>

        <div>
          <Card className="bg-[#1e1b4b]/30 border-purple-500/30 sticky top-8">
            <CardHeader>
              <CardTitle className="text-purple-400">Add New Project</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Project Name</label>
                  <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Awesome App" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">GitHub URL</label>
                  <Input required value={githubRepoUrl} onChange={e => setGithubRepoUrl(e.target.value)} placeholder="https://github.com/user/repo" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Branch</label>
                  <Input required value={githubBranch} onChange={e => setGithubBranch(e.target.value)} placeholder="main" />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 gap-2">
                  <Plus className="w-4 h-4" /> Connect Repository
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
