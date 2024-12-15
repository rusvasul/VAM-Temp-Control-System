import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDays, format, isBefore, isWithinInterval, startOfDay, endOfDay, addWeeks } from "date-fns";
import { CleaningSchedule } from "@/api/cleaningSchedules";
import { ProductionSchedule } from "@/api/productionSchedules";
import { Tank } from "@/api/tanks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TankScheduleGanttProps {
  tanks: Tank[];
  cleaningSchedules: CleaningSchedule[];
  productionSchedules: ProductionSchedule[];
}

type ScheduleEvent = {
  type: 'cleaning' | 'production';
  startDate: Date;
  endDate: Date;
  status: string;
  details: string;
};

type TankSchedule = {
  tankId: string;
  tankName: string;
  events: ScheduleEvent[];
};

export function TankScheduleGantt({ tanks, cleaningSchedules, productionSchedules }: TankScheduleGanttProps) {
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [schedules, setSchedules] = useState<TankSchedule[]>([]);
  const daysToShow = 14; // Show 2 weeks at a time

  useEffect(() => {
    const combinedSchedules = tanks.map(tank => {
      const tankCleanings = cleaningSchedules
        .filter(schedule => schedule.tankId === tank.id)
        .map(schedule => {
          const cleaningDate = new Date(schedule.nextCleaning);
          return {
            type: 'cleaning' as const,
            startDate: cleaningDate,
            endDate: addDays(cleaningDate, 1), // Assume cleaning takes 1 day
            status: getCleaningStatus(schedule),
            details: `${schedule.type === 'single' ? 'One-time' : schedule.schedule} cleaning`
          };
        });

      const tankProductions = productionSchedules
        .filter(schedule => schedule.tankId === tank.id)
        .map(schedule => ({
          type: 'production' as const,
          startDate: new Date(schedule.startDate),
          endDate: new Date(schedule.endDate),
          status: getProductionStatus(schedule),
          details: `Production: ${schedule.beerStyle}`
        }));

      return {
        tankId: tank.id,
        tankName: tank.name,
        events: [...tankCleanings, ...tankProductions].sort((a, b) => 
          a.startDate.getTime() - b.startDate.getTime()
        )
      };
    });

    setSchedules(combinedSchedules);
  }, [tanks, cleaningSchedules, productionSchedules]);

  const getCleaningStatus = (schedule: CleaningSchedule): string => {
    const nextCleaning = new Date(schedule.nextCleaning);
    const today = new Date();
    
    if (isBefore(nextCleaning, today)) {
      return 'overdue';
    }
    if (isBefore(nextCleaning, addDays(today, 3))) {
      return 'upcoming';
    }
    return 'scheduled';
  };

  const getProductionStatus = (schedule: ProductionSchedule): string => {
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const today = new Date();

    if (isWithinInterval(today, { start: startDate, end: endDate })) {
      return 'in-progress';
    }
    if (isBefore(endDate, today)) {
      return 'completed';
    }
    return 'scheduled';
  };

  const getStatusColor = (type: 'cleaning' | 'production', status: string): string => {
    const colors = {
      cleaning: {
        overdue: 'bg-red-500',
        upcoming: 'bg-yellow-500',
        scheduled: 'bg-blue-500'
      },
      production: {
        'in-progress': 'bg-green-500',
        completed: 'bg-gray-500',
        scheduled: 'bg-blue-500'
      }
    };

    return colors[type][status as keyof typeof colors[typeof type]] || 'bg-gray-300';
  };

  const calculateEventPosition = (event: ScheduleEvent): { left: string; width: string } => {
    const start = Math.max(event.startDate.getTime(), startDate.getTime());
    const end = Math.min(event.endDate.getTime(), addDays(startDate, daysToShow).getTime());
    
    const totalDuration = daysToShow * 24 * 60 * 60 * 1000;
    const left = ((start - startDate.getTime()) / totalDuration) * 100;
    const width = ((end - start) / totalDuration) * 100;

    return {
      left: `${left}%`,
      width: `${width}%`
    };
  };

  const navigateSchedule = (direction: 'prev' | 'next') => {
    setStartDate(current => 
      direction === 'prev' 
        ? addDays(current, -daysToShow) 
        : addDays(current, daysToShow)
    );
  };

  const renderDateHeaders = () => {
    return Array.from({ length: daysToShow }, (_, i) => {
      const date = addDays(startDate, i);
      return (
        <div 
          key={i} 
          className="flex-1 text-center text-xs border-r last:border-r-0 py-1"
        >
          {format(date, 'MMM d')}
        </div>
      );
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Equipment Schedule</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateSchedule('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(startDate, 'MMM d')} - {format(addDays(startDate, daysToShow - 1), 'MMM d, yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateSchedule('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <div className="flex border-b">
            <div className="w-32 flex-shrink-0"></div>
            <div className="flex-1 flex">
              {renderDateHeaders()}
            </div>
          </div>
          <div className="relative">
            {schedules.map((schedule) => (
              <div key={schedule.tankId} className="flex border-b last:border-b-0">
                <div className="w-32 flex-shrink-0 p-2 font-medium">
                  {schedule.tankName}
                </div>
                <div className="flex-1 h-16 relative">
                  {schedule.events.map((event, index) => {
                    const { left, width } = calculateEventPosition(event);
                    if (parseFloat(width) <= 0) return null;
                    
                    return (
                      <div
                        key={index}
                        className={`absolute h-8 mt-2 rounded ${getStatusColor(event.type, event.status)} text-white text-xs flex items-center justify-center overflow-hidden`}
                        style={{ left, width }}
                        title={`${event.details} (${format(event.startDate, 'MMM d')} - ${format(event.endDate, 'MMM d')})`}
                      >
                        <span className="px-1 truncate">{event.details}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 justify-end">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-500 text-white">Production</Badge>
              <Badge variant="secondary" className="bg-green-500 text-white">In Progress</Badge>
              <Badge variant="secondary" className="bg-red-500 text-white">Cleaning Overdue</Badge>
              <Badge variant="secondary" className="bg-yellow-500 text-white">Cleaning Soon</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 