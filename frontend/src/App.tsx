import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import AuthPage from "./pages/AuthPage"
import DashboardPage from "./pages/DashboardPage"
import ProjectsPage from "./pages/ProjectsPage"
import DeploymentsPage from "./pages/DeploymentsPage"
import ArtifactsPage from "./pages/ArtifactsPage"
import LogsPage from "./pages/LogsPage"
import AppLayout from "./components/layout/AppLayout"

function App() {
  // Removed unused isAuthenticated variable to clean up TS warnings and force refresh

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="deployments" element={<DeploymentsPage />} />
            <Route path="artifacts" element={<ArtifactsPage />} />
            <Route path="logs/:buildId?" element={<LogsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
