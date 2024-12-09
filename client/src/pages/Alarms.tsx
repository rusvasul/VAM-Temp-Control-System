import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle2, XCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const mockAlarms = [
  { id: 1, timestamp: "2024-01-15 15:30", type: "Temperature High", tank: 2, status: "Active" },
  { id: 2, timestamp: "2024-01-15 14:45", type: "Valve Failure", tank: 5, status: "Resolved" },
  { id: 3, timestamp: "2024-01-15 13:15", type: "Communication Error", tank: 7, status: "Active" },
]

export function Alarms() {
  return (
    <div className="space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Alarms</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Alarm Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="notifications" />
              <Label htmlFor="notifications">Enable Notifications</Label>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-medium">Temperature Thresholds</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>High Temperature Alert (°F)</Label>
                  <input
                    type="number"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    defaultValue={75}
                  />
                </div>
                <div>
                  <Label>Low Temperature Alert (°F)</Label>
                  <input
                    type="number"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    defaultValue={60}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Alarms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAlarms.map((alarm) => (
              <div
                key={alarm.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Bell className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">{alarm.type}</p>
                    <p className="text-sm text-muted-foreground">
                      Tank {alarm.tank} - {alarm.timestamp}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={alarm.status === "Active" ? "destructive" : "secondary"}
                >
                  {alarm.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}