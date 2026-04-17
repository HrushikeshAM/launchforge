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

const data = [
  { name: 'Mon', builds: 12, errors: 1 },
  { name: 'Tue', builds: 19, errors: 2 },
  { name: 'Wed', builds: 15, errors: 0 },
  { name: 'Thu', builds: 26, errors: 4 },
  { name: 'Fri', builds: 32, errors: 1 },
  { name: 'Sat', builds: 10, errors: 0 },
  { name: 'Sun', builds: 8, errors: 0 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Projects", val: "12", icon: Rocket, color: "text-blue-500" },
          { title: "Successful Deploys", val: "1,248", icon: CheckCircle, color: "text-emerald-500" },
          { title: "Failed Builds", val: "23", icon: XCircle, color: "text-rose-500" },
          { title: "Active Environments", val: "3", icon: Activity, color: "text-purple-500" },
        ].map((stat, i) => (
          <Card key={i} className="bg-[#0f172a]/40 border-slate-800/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.val}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-[#0f172a]/40 border-slate-800/60">
          <CardHeader>
            <CardTitle>Deployment Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { time: "2m ago", text: "Deployed to production", env: "launchforge-ui" },
                { time: "1h ago", text: "Build #124 passed", env: "payment-service" },
                { time: "3h ago", text: "New environment created", env: "staging" },
                { time: "5h ago", text: "Artifact uploaded", env: "auth-api-v2.zip" },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-slate-200">{activity.text}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{activity.env} • {activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
