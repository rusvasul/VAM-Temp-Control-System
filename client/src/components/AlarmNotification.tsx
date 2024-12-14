import React from 'react';
import { Toast } from '@/components/ui/toast';
import { useToast } from '@/hooks/useToast';

interface AlarmNotificationProps {
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

export const AlarmNotification: React.FC<AlarmNotificationProps> = ({ alarm, type }) => {
  const { toast } = useToast();

  React.useEffect(() => {
    toast({
      title: type === 'ALARM_TRIGGERED' ? 'Alarm Triggered' : 'Alarm Cleared',
      description: `${alarm.name} for ${alarm.tankName}: ${alarm.temperature.toFixed(1)}°F (Threshold: ${alarm.threshold}°F)`,
      variant: type === 'ALARM_TRIGGERED' ? 'destructive' : 'default',
    });
  }, []);

  return null;
};