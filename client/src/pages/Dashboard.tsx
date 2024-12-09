import { useEffect, useState } from "react"
import { TankCard } from "@/components/TankCard"
import { SystemStatus } from "@/components/SystemStatus"
import { getTanks, getSystemStatus } from "@/api/tanks"
import { useToast } from "@/hooks/useToast"

interface Tank {
  id: number
  name: string
  temperature: number
  status: string
  mode: string
  valveStatus: string
}

interface SystemStatusType {
  chillerStatus: string
  heaterStatus: string
  systemMode: string
}

export function Dashboard() {
  const [tanks, setTanks] = useState<Tank[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatusType>({
    chillerStatus: '',
    heaterStatus: '',
    systemMode: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [tanksData, statusData] = await Promise.all([
          getTanks(),
          getSystemStatus()
        ])
        setTanks(tanksData)
        setSystemStatus(statusData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [toast])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {tanks.map((tank) => (
          <TankCard key={tank.id} {...tank} />
        ))}
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <SystemStatus {...systemStatus} />
      </div>
    </div>
  )
}