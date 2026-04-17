import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import AuthPage from "./pages/AuthPage"
import DashboardPage from "./pages/DashboardPage"
import ProjectsPage from "./pages/ProjectsPage"
import DeploymentsPage from "./pages/DeploymentsPage"
import ArtifactsPage from "./pages/ArtifactsPage"
import LogsPage from "./pages/LogsPage"
import SettingsPage from "./pages/SettingsPage"
import SetupWizardPage from "./pages/SetupWizardPage"
import AppLayout from "./components/layout/AppLayout"
import { useState, useEffect } from "react"
import axios from "axios"

function App() {
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null)

  // Verify if critical ENV variables are established to conditionally lock users into SetupWizard
  useEffect(() => {
    axios.get("http://localhost:5000/settings/env")
      .then(res => {
        const env = res.data;
        if (!env.MONGO_URI || !env.GCP_PROJECT_ID || !env.JENKINS_API_TOKEN) {
          setNeedsSetup(true)
        } else {
          setNeedsSetup(false)
        }
      })
      .catch(() => {
        // Backend could be down
        setNeedsSetup(false) 
      })
  }, [])

  if (needsSetup === null) return <div className="min-h-screen bg-[#020617]" /> // Blank loading frame while verifying

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30">
        <Routes>
          <Route path="/" element={needsSetup ? <Navigate to="/setup" replace /> : <LandingPage />} />
          <Route path="/setup" element={<SetupWizardPage />} />
          <Route path="/auth" element={needsSetup ? <Navigate to="/setup" replace /> : <AuthPage />} />
          
          <Route path="/app" element={needsSetup ? <Navigate to="/setup" replace /> : <AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="deployments" element={<DeploymentsPage />} />
            <Route path="artifacts" element={<ArtifactsPage />} />
            <Route path="logs/:buildId?" element={<LogsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
