import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Rocket } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import axios from "axios"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register"
      // In a real app we'd proxy or use an env variable for API base url
      const res = await axios.post(`http://localhost:5000${endpoint}`, {
        email, 
        password,
        ...(isLogin ? {} : { firstName, lastName })
      })

      localStorage.setItem("token", res.data.token)
      // Small delay for smooth feel
      setTimeout(() => navigate("/app"), 300)
    } catch (err: any) {
      setError(err.response?.data?.error || "Authentication failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative">
      <div className="absolute inset-0 opacity-20 mix-blend-overlay"></div>
      <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter">
                <Rocket className="w-8 h-8 text-blue-500" />
                <span className="text-white">Launch</span><span className="text-blue-500">Forge</span>
            </div>
        </div>
        <Card className="border-slate-800/50 bg-slate-900/40 backdrop-blur-2xl">
          <CardHeader>
            <CardTitle>{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
            <CardDescription>
              {isLogin ? "Enter your credentials to access your projects." : "Start deploying your apps flawlessly."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
              
              {!isLogin && (
                <div className="flex gap-4">
                  <div className="space-y-2 w-full">
                    <label className="text-sm font-medium text-slate-300">First Name</label>
                    <Input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Linus" />
                  </div>
                  <div className="space-y-2 w-full">
                    <label className="text-sm font-medium text-slate-300">Last Name</label>
                    <Input required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Torvalds" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Config</label>
                <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>

              <Button variant="gradient" className="w-full mt-4" type="submit">
                {isLogin ? "Sign In" : "Register"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
