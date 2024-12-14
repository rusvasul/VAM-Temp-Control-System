import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThermometerIcon, Gauge, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { TankDialog } from "./TankDialog"
import { useSettings } from "@/contexts/SettingsContext"

interface TankCardProps {
  id: string;
  name: string;
  temperature: number;
  status: string;
  mode: string;
  valveStatus: string;
  onClick: () => void;
}

export function TankCard({ id, name, temperature, status, mode, valveStatus, onClick }: TankCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const settings = useSettings();
  const [progressValue, setProgressValue] = useState(0)

  // Calculate progress value based on fixed range (30°F to 150°F)
  useEffect(() => {
    const minTemp = 30;
    const maxTemp = 150;
    const range = maxTemp - minTemp;
    const value = ((temperature - minTemp) / range) * 100;
    setProgressValue(Math.min(Math.max(value, 0), 100));
  }, [temperature]);

  const timeInService = "14:30:00"; // Mock time in service
  const setPoint = 68; // This should come from your tank data or settings

  // Calculate setpoint position as percentage of the fixed range
  const setPointPosition = ((setPoint - 30) / (150 - 30)) * 100;

  return (
    <>
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{name}</CardTitle>
          <Badge
            variant={status === 'Active' ? 'default' : 'secondary'}
          >
            {status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <ThermometerIcon className="h-4 w-4 text-rose-500" />
              <span className="text-2xl font-bold">{temperature}°F</span>
            </div>

            <div className="relative pt-6 pb-2">
              <div className="relative">
                <div 
                  className="h-4 w-full rounded-full overflow-hidden"
                  style={{
                    background: 'linear-gradient(to right, #3b82f6 0%, #60a5fa 25%, #f59e0b 50%, #ef4444 75%, #dc2626 100%)'
                  }}
                >
                  <div 
                    className="absolute top-0 right-0 h-full bg-secondary transition-all duration-300"
                    style={{
                      width: `${100 - progressValue}%`
                    }}
                  />
                </div>
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute -top-4 transform -translate-x-1/2 text-xs font-medium"
                    style={{ left: `${setPointPosition}%` }}
                  >
                    {setPoint}°F
                  </div>
                  <div
                    className="absolute top-0 h-4 w-0.5 bg-white transform -translate-x-1/2"
                    style={{
                      left: `${setPointPosition}%`,
                      boxShadow: '0 0 2px rgba(0,0,0,0.3)'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Gauge className="h-4 w-4" />
                <span>{valveStatus}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{timeInService}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground text-right">
              {mode}
            </div>
          </div>
        </CardContent>
      </Card>

      <TankDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        tank={{
          id,
          name,
          temperature,
          status,
          mode,
          valveStatus,
          setPoint
        }}
      />
    </>
  )
}