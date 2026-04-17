import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Rocket, Cloud, ShieldCheck, Terminal } from "lucide-react"

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617]">
      {/* Navbar segment */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tighter">
            <Rocket className="w-6 h-6 text-blue-500" />
            <span className="text-white">Launch</span><span className="text-blue-500">Forge</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>Login</Button>
            <Button variant="gradient" onClick={() => navigate("/auth")}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="pt-32 pb-16 px-6 relative max-w-7xl mx-auto text-center">
        {/* Decorative Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[300px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8"
        >
          Ship software <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
            at lightspeed.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12"
        >
          The elite deployment platform integrating GitHub, Jenkins, and GCP. 
          Stop configuring pipelines and start launching products.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-center gap-6"
        >
          <Button size="lg" variant="gradient" onClick={() => navigate("/auth")}>
            Start for free
          </Button>
          <Button size="lg" variant="outline" onClick={() => window.open('https://github.com', '_blank')}>
            View Documentation
          </Button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
          {[
            { title: "One-Click Deploy", description: "Connect your GitHub repo and push to production instantly.", icon: <Rocket className="w-8 h-8 text-blue-400 mb-4" /> },
            { title: "GCP Artifact Storage", description: "Secure, durable, and highly available storage for your build artifacts.", icon: <Cloud className="w-8 h-8 text-purple-400 mb-4" /> },
            { title: "Jenkins Orchestration", description: "Seamlessly interact with Jenkins without touching XML or Groovy.", icon: <Terminal className="w-8 h-8 text-indigo-400 mb-4" /> }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors"
            >
              {feature.icon}
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
