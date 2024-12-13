import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ThermometerIcon, Power, Droplet } from "lucide-react"
import { SystemStatus as SystemStatusType } from "@/api/tanks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateSystemStatus } from "@/api/tanks";
import { useToast } from "@/hooks/useToast";

interface SystemStatusProps {
  initialStatus: SystemStatusType;
  onStatusUpdate: (newStatus: SystemStatusType) => void;
}

export function SystemStatus({ initialStatus, onStatusUpdate }: SystemStatusProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    console.log('Initializing SSE connection');
    const eventSource = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/api/sse`);

    eventSource.onmessage = (event) => {
      try {
        console.log('Received SSE update:', event.data);
        const updatedStatus = JSON.parse(event.data);
        setStatus(updatedStatus);
        onStatusUpdate(updatedStatus);
      } catch (error) {
        console.error('Error processing SSE message:', error);
        toast({
          title: "Error",
          description: "Failed to process system status update",
          variant: "destructive",
        });
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      toast({
        title: "Connection Error",
        description: "Lost connection to server. Attempting to reconnect...",
        variant: "destructive",
      });
      eventSource.close();
    };

    return () => {
      console.log('Closing SSE connection');
      eventSource.close();
    };
  }, [onStatusUpdate, toast]);

  const handleSystemModeChange = async (newMode: string) => {
    setIsUpdating(true);
    try {
      console.log('Updating system mode to:', newMode);
      const updatedStatus = await updateSystemStatus({ ...status, systemMode: newMode });
      setStatus(updatedStatus);
      onStatusUpdate(updatedStatus);
      toast({
        title: "Success",
        description: `System mode updated to ${newMode}`,
      });
    } catch (error) {
      console.error('Error updating system mode:', error);
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