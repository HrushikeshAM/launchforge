import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Rocket, CheckCircle, XCircle, Activity } from 'lucide-react'
import axios from 'axios'

function timeSince(dateString: string) {
  const date = new Date(dateString)
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + "y ago"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + "m ago"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + "d ago"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + "h ago"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + "m ago"
  return Math.floor(seconds) + "s ago"
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>({
    stats: {
      totalProjects: 0,
      successfulDeploys: 0,
      failedBuilds: 0,
      activeEnvironments: 0
    },
    chartData: [],
    recentActivity: []
  })

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/dashboard", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      setDashboardData(res.data)
    } catch (err) {
      console.error("Failed to load dashboard metrics", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {[1,2,3,4].map(i => (
            <Card key={i} className="bg-[#0f172a]/40 border-slate-800/60 animate-pulse">
              <CardContent className="h-24"></CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-[#0f172a]/40 border-slate-800/60 animate-pulse">
             <CardContent className="h-[350px]"></CardContent>
          </Card>
          <Card className="bg-[#0f172a]/40 border-slate-800/60 animate-pulse">
             <CardContent className="h-[350px]"></CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { stats, chartData, recentActivity } = dashboardData

  const topStats = [
    { title: "Total Projects", val: stats.totalProjects, icon: Rocket, color: "text-blue-500" },
    { title: "Successful Deploys", val: stats.successfulDeploys, icon: CheckCircle, color: "text-emerald-500" },
    { title: "Failed Builds", val: stats.failedBuilds, icon: XCircle, color: "text-rose-500" },
    { title: "Active Environments", val: stats.activeEnvironments, icon: Activity, color: "text-purple-500" },
  ]

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-500">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {topStats.map((stat, i) => (
          <Card key={i} className="bg-[#0f172a]/40 border-slate-800/60 transition-colors hover:bg-[#0f172a]/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.val}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2 bg-[#0f172a]/40 border-slate-800/60 flex flex-col">
          <CardHeader>
            <CardTitle className="text-slate-100">Deployment Velocity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBuilds" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="builds" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBuilds)" />
                  <Area type="monotone" dataKey="errors" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorErrors)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f172a]/40 border-slate-800/60">
          <CardHeader>
            <CardTitle className="text-slate-100">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivity.length === 0 ? (
                <div className="text-slate-500 text-sm py-4 text-center">No recent operations detected.</div>
              ) : (
                recentActivity.map((activity: any, i: number) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">{activity.text}</div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">{activity.env} • {timeSince(activity.time)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
