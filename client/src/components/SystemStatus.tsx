import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ThermometerIcon, Power, Droplet } from "lucide-react"

interface SystemStatusProps {
  chillerStatus: string
  heaterStatus: string
  systemMode: string
}

export function SystemStatus({ chillerStatus, heaterStatus, systemMode }: SystemStatusProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Power className="h-5 w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Chiller Status</p>
            <p className="text-2xl font-bold">{chillerStatus}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Heater Status</p>
            <p className="text-2xl font-bold">{heaterStatus}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">System Mode</p>
            <p className="text-2xl font-bold">{systemMode}</p>
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <ThermometerIcon className="mr-2 h-4 w-4 text-rose-500" />
                <span>System Load</span>
              </div>
              <span>78%</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Droplet className="mr-2 h-4 w-4 text-blue-500" />
                <span>Coolant Level</span>
              </div>
              <span>92%</span>
            </div>
            <Progress value={92} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}