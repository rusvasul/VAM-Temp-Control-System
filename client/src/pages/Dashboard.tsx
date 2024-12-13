import { useEffect, useState } from "react"
import { TankCard } from "@/components/TankCard"
import { SystemStatus } from "@/components/SystemStatus"
import { getTanks, getSystemStatus, Tank as TankType, createTank, SystemStatus as SystemStatusType } from "@/api/tanks"
import { useToast } from "@/hooks/useToast"
import { TankDialog } from "@/components/TankDialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export function Dashboard() {
  const [tanks, setTanks] = useState<TankType[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatusType>({
    chillerStatus: '',
    heaterStatus: '',
    systemMode: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTank, setSelectedTank] = useState<TankType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchTanks = async () => {
    try {
      const tanksData = await getTanks()
      setTanks(tanksData)
    } catch (error) {
      console.error('Error fetching tanks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch tanks data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchSystemStatus = async () => {
    try {
      const statusData = await getSystemStatus()
      setSystemStatus(statusData)
    } catch (error) {
      console.error('Error fetching system status:', error)
      toast({
        title: "Error",
        description: "Failed to fetch system status. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [tanksData, statusData] = await Promise.all([getTanks(), getSystemStatus()])
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

  const handleTankClick = (tank: TankType) => {
    setSelectedTank(tank)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedTank(null)
  }

  const handleTankUpdate = () => {
    fetchTanks()
  }

  const handleStatusUpdate = (newStatus: SystemStatusType) => {
    setSystemStatus(newStatus)
  }

  const handleAddTank = async () => {
    try {
      const newTankNumber = tanks.length + 1
      const newTank = await createTank({
        name: `fv${newTankNumber.toString().padStart(2, '0')}`,
        temperature: 68,
        status: 'Inactive',
        mode: 'Idle',
        valveStatus: 'Closed'
      })
      await fetchTanks()
      toast({
        title: "Success",
        description: "Tank added successfully",
      })
    } catch (error) {
      console.error('Error adding tank:', error)
      toast({
        title: "Error",
        description: "Failed to add tank. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleAddTank}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Tank
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tanks.map((tank) => (
          <TankCard
            key={tank.id}
            {...tank}
            onClick={() => handleTankClick(tank)}
          />
        ))}
      </div>
      {selectedTank && (
        <TankDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          tank={selectedTank}
          onUpdate={handleTankUpdate}
          onDelete={handleTankUpdate}
        />
      )}
      <SystemStatus initialStatus={systemStatus} onStatusUpdate={handleStatusUpdate} />
    </div>
  )
}