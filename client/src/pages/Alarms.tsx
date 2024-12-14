import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getAlarms, createAlarm } from '@/api/alarms';
import { useToast } from "@/hooks/useToast";
import { AlarmForm } from '@/components/AlarmForm';
import { AlarmNotification } from '@/components/AlarmNotification';

interface Alarm {
  _id: string;
  name: string;
  type: string;
  threshold: number;
  tankId: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AlarmNotificationData {
  alarm: {
    id: string;
    name: string;
    tankName: string;
    temperature: number;
    threshold: number;
    timestamp: string;
  };
  type: 'ALARM_TRIGGERED' | 'ALARM_CLEARED';
}

export function Alarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<AlarmNotificationData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlarms();
    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('alarm-update', (event) => {
      const data = JSON.parse(event.data);
      handleAlarmUpdate(data);
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchAlarms = async () => {
    try {
      setIsLoading(true);
      const data = await getAlarms();
      setAlarms(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlarmUpdate = (data: any) => {
    if (data.type === 'ALARM_TRIGGERED' || data.type === 'ALARM_CLEARED') {
      fetchAlarms();
      setNotification(data);
    }
  };

  const handleCreateAlarm = async (alarmData: any) => {
    try {
      const newAlarm = await createAlarm(alarmData);
      setAlarms([...alarms, newAlarm]);
      toast({
        title: "Success",
        description: "Alarm created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-8 pt-6">
      {notification && (
        <AlarmNotification 
          alarm={notification.alarm} 
          type={notification.type} 
        />
      )}

      <h2 className="text-3xl font-bold tracking-tight">Alarms</h2>

      <AlarmForm onSubmit={handleCreateAlarm} />

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
          {isLoading ? (
            <p>Loading alarms...</p>
          ) : alarms.length === 0 ? (
            <p>No active alarms</p>
          ) : (
            <div className="space-y-4">
              {alarms.map((alarm) => (
                <div
                  key={alarm._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Bell className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">{alarm.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Tank {alarm.tankId.name} - {new Date(alarm.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={alarm.isActive ? "destructive" : "secondary"}
                  >
                    {alarm.isActive ? "Active" : "Resolved"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}