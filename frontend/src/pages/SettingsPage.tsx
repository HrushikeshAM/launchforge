import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Database, Server, Cloud, CheckCircle, XCircle, Loader2, Eye, EyeOff, Save } from "lucide-react"
import axios from "axios"

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({})
  
  const [mongoStatus, setMongoStatus] = useState<string>('idle')
  const [jenkinsStatus, setJenkinsStatus] = useState<string>('idle')
  const [gcsStatus, setGcsStatus] = useState<string>('idle')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/settings/env")
      setSettings(res.data)
    } catch (error) {
      console.error("Failed to fetch settings", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const toggleShow = (key: string) => {
    setShowTokens(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.post("http://localhost:5000/settings/env", settings)
      alert("Settings saved successfully. A .env.backup was created.")
    } catch (error) {
      alert("Failed to save settings.")
    } finally {
      setSaving(false)
    }
  }

  const handleTestMongo = async () => {
    setMongoStatus('loading')
    try {
      await axios.post("http://localhost:5000/settings/test/mongo", { uri: settings.MONGO_URI })
      setMongoStatus('success')
    } catch (e) {
      setMongoStatus('fail')
    }
  }

  const handleTestJenkins = async () => {
    setJenkinsStatus('loading')
    try {
      await axios.post("http://localhost:5000/settings/test/jenkins", { 
        url: settings.JENKINS_URL, 
        user: settings.JENKINS_USER, 
        token: settings.JENKINS_API_TOKEN 
      })
      setJenkinsStatus('success')
    } catch (e) {
      setJenkinsStatus('fail')
    }
  }

  const handleTestGCS = async () => {
    setGcsStatus('loading')
    try {
      await axios.post("http://localhost:5000/settings/test/gcs", { credentialsPath: settings.GOOGLE_APPLICATION_CREDENTIALS })
      setGcsStatus('success')
    } catch (e) {
      setGcsStatus('fail')
    }
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'loading') return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
    if (status === 'success') return <CheckCircle className="w-4 h-4 text-emerald-500" />
    if (status === 'fail') return <XCircle className="w-4 h-4 text-rose-500" />
    return null
  }

  const renderInput = (key: string, label: string, isSecret = false) => (
    <div className="space-y-1.5 flex-1 w-full">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="relative">
        <Input 
          type={isSecret && !showTokens[key] ? "password" : "text"}
          value={settings[key] || ""} 
          onChange={e => handleChange(key, e.target.value)}
          className="bg-slate-900 border-slate-700 h-10 w-full pr-10"
        />
        {isSecret && (
          <button 
            type="button"
            onClick={() => toggleShow(key)}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
          >
            {showTokens[key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  )

  if (loading) return <div className="p-8 text-slate-400 animate-pulse">Loading Configuration...</div>

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Environment Settings</h1>
          <p className="text-sm text-slate-400">Manage integrations and system config. Secrets are masked.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-white">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Config
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Database */}
        <Card className="bg-[#0f172a]/60 border-slate-700/60">
          <CardHeader className="border-b border-slate-800/50 pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2"><Database className="w-5 h-5 text-emerald-500" /> Database</span>
              <Button variant="outline" size="sm" onClick={handleTestMongo} className="gap-2">
                Test Connection <StatusIcon status={mongoStatus} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {renderInput('MONGO_URI', 'MongoDB URI', true)}
          </CardContent>
        </Card>

        {/* Jenkins */}
        <Card className="bg-[#0f172a]/60 border-slate-700/60">
          <CardHeader className="border-b border-slate-800/50 pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2"><Server className="w-5 h-5 text-blue-500" /> Jenkins CI</span>
              <Button variant="outline" size="sm" onClick={handleTestJenkins} className="gap-2">
                Test Connection <StatusIcon status={jenkinsStatus} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {renderInput('JENKINS_URL', 'Server URL')}
            <div className="flex flex-col sm:flex-row gap-4">
              {renderInput('JENKINS_USER', 'Username')}
              {renderInput('JENKINS_API_TOKEN', 'API Token', true)}
            </div>
            {renderInput('JENKINS_JOB_NAME', 'Pipeline Job Name')}
          </CardContent>
        </Card>

        {/* Google Cloud */}
        <Card className="bg-[#0f172a]/60 border-slate-700/60 xl:col-span-2">
          <CardHeader className="border-b border-slate-800/50 pb-4">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2"><Cloud className="w-5 h-5 text-purple-500" /> Google Cloud Storage</span>
              <Button variant="outline" size="sm" onClick={handleTestGCS} className="gap-2">
                Validate Keyfile Path <StatusIcon status={gcsStatus} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderInput('GCP_PROJECT_ID', 'Project ID')}
            {renderInput('GCS_BUCKET_NAME', 'Bucket Name')}
            <div className="sm:col-span-2">
              {renderInput('GOOGLE_APPLICATION_CREDENTIALS', 'Absolute Path to Credentials JSON')}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
