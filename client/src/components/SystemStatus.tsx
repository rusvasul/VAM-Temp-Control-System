import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ThermometerIcon, Power, Droplet } from "lucide-react"
import { SystemStatus as SystemStatusType } from "@/api/tanks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateSystemStatus } from "@/api/tanks";
import { useToast } from "@/hooks/useToast";

interface SystemStatusProps {
  status: SystemStatusType;
  onStatusUpdate: (newStatus: SystemStatusType) => void;
}

export function SystemStatus({ status, onStatusUpdate }: SystemStatusProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSystemModeChange = async (newMode: string) => {
    setIsUpdating(true);
    try {
      const updatedStatus = await updateSystemStatus({ ...status, systemMode: newMode });
      onStatusUpdate(updatedStatus);
      toast({
        title: "Success",
        description: `System mode updated to ${newMode}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
            <p className="text-2xl font-bold">{status.chillerStatus}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Heater Status</p>
            <p className="text-2xl font-bold">{status.heaterStatus}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">System Mode</p>
            <Select
              value={status.systemMode}
              onValueChange={handleSystemModeChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cooling">Cooling</SelectItem>
                <SelectItem value="Heating">Heating</SelectItem>
                <SelectItem value="Idle">Idle</SelectItem>
              </SelectContent>
            </Select>
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