import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Rocket, Database, Server, Cloud, ChevronRight, Loader2 } from "lucide-react"
import axios from "axios"

export default function SetupWizardPage() {
  const [step, setStep] = useState(1)
  const navigate = useNavigate()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios.get("http://localhost:5000/settings/env")
      .then(res => setSettings(res.data))
      .catch(() => {}) // We might fail if server hasn't stood up completely yet
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      await axios.post("http://localhost:5000/settings/env", settings)
      // Redirect to Auth or Dashboard
      navigate("/")
    } catch (error) {
      alert("Failed to save configuration.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]">
             <Rocket className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome to LaunchForge</h1>
          <p className="text-slate-400 mt-2">Let's get your environment configured.</p>
        </div>

        <Card className="bg-[#0f172a]/95 border-slate-700 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-8">
            
            {/* Step Indicators */}
            <div className="flex justify-between mb-8 border-b border-slate-800 pb-8">
              {[
                { s: 1, label: 'Database', icon: Database },
                { s: 2, label: 'Jenkins', icon: Server },
                { s: 3, label: 'GCS', icon: Cloud }
              ].map((item) => (
                <div key={item.s} className={`flex items-center gap-2 ${step >= item.s ? 'text-blue-500' : 'text-slate-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= item.s ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-slate-800'}`}>
                    {item.s}
                  </div>
                  <span className="font-medium hidden sm:inline">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Mongo */}
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-xl font-bold text-white mb-4">Connect Database</h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">MongoDB URI</label>
                  <Input 
                    value={settings.MONGO_URI || ""} 
                    onChange={e => handleChange('MONGO_URI', e.target.value)}
                    placeholder="mongodb://localhost:27017/launchforge" 
                    className="bg-slate-900 border-slate-700" 
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-700">Next Step <ChevronRight className="w-4 h-4 ml-2" /></Button>
                </div>
              </div>
            )}

            {/* Step 2: Jenkins */}
            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-xl font-bold text-white mb-4">Jenkins Integration</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Jenkins URL</label>
                    <Input value={settings.JENKINS_URL || ""} onChange={e => handleChange('JENKINS_URL', e.target.value)} className="bg-slate-900 border-slate-700" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Username</label>
                      <Input value={settings.JENKINS_USER || ""} onChange={e => handleChange('JENKINS_USER', e.target.value)} className="bg-slate-900 border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">API Token</label>
                      <Input type="password" value={settings.JENKINS_API_TOKEN || ""} onChange={e => handleChange('JENKINS_API_TOKEN', e.target.value)} className="bg-slate-900 border-slate-700" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700">Next Step <ChevronRight className="w-4 h-4 ml-2" /></Button>
                </div>
              </div>
            )}

            {/* Step 3: Google Cloud */}
            {step === 3 && (
               <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-xl font-bold text-white mb-4">Google Cloud Storage</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Project ID</label>
                      <Input value={settings.GCP_PROJECT_ID || ""} onChange={e => handleChange('GCP_PROJECT_ID', e.target.value)} className="bg-slate-900 border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Bucket Name</label>
                      <Input value={settings.GCS_BUCKET_NAME || ""} onChange={e => handleChange('GCS_BUCKET_NAME', e.target.value)} className="bg-slate-900 border-slate-700" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Path to JSON Credentials Keyfile</label>
                    <Input value={settings.GOOGLE_APPLICATION_CREDENTIALS || ""} onChange={e => handleChange('GOOGLE_APPLICATION_CREDENTIALS', e.target.value)} className="bg-slate-900 border-slate-700" />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={handleFinish} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Complete Setup
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
