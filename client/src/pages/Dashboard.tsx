import { useEffect, useState } from "react"
import { TankCard } from "@/components/TankCard"
import { SystemStatus } from "@/components/SystemStatus"
import { getTanks, getSystemStatus } from "@/api/tanks"

interface Tank {
  id: number
  name: string
  temperature: number
  status: string
  mode: string
  valveStatus: string
}

interface TanksResponse {
  tanks: Tank[]
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

  useEffect(() => {
    const fetchData = async () => {
      const [tanksData, statusData] = await Promise.all([
        getTanks(),
        getSystemStatus()
      ]) as [TanksResponse, SystemStatusType]
      setTanks(tanksData.tanks)
      setSystemStatus(statusData)
    }
    fetchData()
  }, [])

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