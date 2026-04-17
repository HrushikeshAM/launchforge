import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { GitBranch, Plus, Rocket } from "lucide-react"
import axios from "axios"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
    } finally {
      setLoading(false)
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
    <div className="space-y-6 pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Your Projects</h1>
          <p className="text-sm text-slate-400">Connect GitHub repositories and launch them instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-col-reverse lg:flex-row">
        
        <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
          {loading && projects.length === 0 ? (
            [1,2].map(i => (
              <Card key={i} className="bg-[#0f172a]/60 border-slate-700 animate-pulse">
                <CardContent className="h-28" />
              </Card>
            ))
          ) : projects.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-700 rounded-xl bg-slate-900/20 px-4">
              <GitBranch className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
              <p className="text-slate-400 max-w-sm mx-auto text-sm md:text-base">Create your first project by connecting a GitHub repository.</p>
            </div>
          ) : (
            projects.map(proj => (
              <Card key={proj._id} className="bg-[#0f172a]/60 border-slate-700 hover:border-blue-500/50 transition-colors">
                <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-xl bg-slate-800 flex items-center justify-center">
                      <GitBranch className="w-5 h-5 md:w-6 md:h-6 text-slate-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base md:text-lg font-semibold text-white truncate">{proj.name}</h3>
                      <p className="text-xs md:text-sm text-blue-400 font-mono mt-0.5 md:mt-1 truncate">{proj.githubRepoUrl} • {proj.githubBranch}</p>
                    </div>
                  </div>
                  <div className="w-full md:w-auto mt-2 md:mt-0 flex">
                    <Button variant="gradient" onClick={() => handleDeploy(proj._id)} className="gap-2 w-full md:w-auto justify-center">
                      <Rocket className="w-4 h-4" />
                      Deploy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="order-1 lg:order-2">
          <Card className="bg-[#1e1b4b]/30 border-purple-500/30 sticky top-20">
            <CardHeader className="pb-4">
              <CardTitle className="text-purple-400 text-lg md:text-xl">Add New Project</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs md:text-sm text-slate-300 font-medium">Project Name</label>
                  <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Awesome App" className="h-10 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs md:text-sm text-slate-300 font-medium">GitHub URL</label>
                  <Input required value={githubRepoUrl} onChange={e => setGithubRepoUrl(e.target.value)} placeholder="https://github.com/user/repo" className="h-10 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs md:text-sm text-slate-300 font-medium">Branch</label>
                  <Input required value={githubBranch} onChange={e => setGithubBranch(e.target.value)} placeholder="main" className="h-10 text-sm" />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 gap-2 h-10 mt-2">
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
