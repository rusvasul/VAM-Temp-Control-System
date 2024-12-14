import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CleaningScheduleDialog } from "@/components/CleaningScheduleDialog";
import { Calendar, RotateCw, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { 
  CleaningSchedule,
  CreateCleaningScheduleDto,
  getCleaningSchedules, 
  createCleaningSchedule, 
  deleteCleaningSchedule 
} from "@/api/cleaningSchedules";
import { useToast } from "@/hooks/useToast";
import { format, isBefore, addDays } from "date-fns";

interface Tank {
  id: string;
  name: string;
}

interface CleaningSchedulesProps {
  tanks: Tank[];
}

export function CleaningSchedules({ tanks }: CleaningSchedulesProps) {
  const [schedules, setSchedules] = useState<CleaningSchedule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await getCleaningSchedules();
      setSchedules(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching cleaning schedules:', error);
      setError('Failed to load cleaning schedules');
      toast({
        title: "Error",
        description: "Failed to load cleaning schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSaveSchedule = async (schedule: CreateCleaningScheduleDto) => {
    try {
      await createCleaningSchedule(schedule);
      await fetchSchedules();
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Cleaning schedule created successfully",
      });
    } catch (error) {
      console.error('Error saving cleaning schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create cleaning schedule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await deleteCleaningSchedule(id);
      await fetchSchedules();
      toast({
        title: "Success",
        description: "Cleaning schedule deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting cleaning schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete cleaning schedule",
        variant: "destructive",
      });
    }
  };

  const getScheduleStatus = (schedule: CleaningSchedule) => {
    if (!schedule.nextCleaning) return 'scheduled';
    
    const nextCleaning = new Date(schedule.nextCleaning);
    const today = new Date();
    const threeDaysFromNow = addDays(today, 3);
    
    if (isBefore(nextCleaning, today)) {
      return 'overdue';
    }
    
    if (isBefore(nextCleaning, threeDaysFromNow)) {
      return 'upcoming';
    }
    
    return 'scheduled';
  };

  const formatScheduleDescription = (schedule: CleaningSchedule) => {
    if (schedule.type === 'single') {
      return 'One-time cleaning';
    }
    return schedule.schedule ? `${schedule.schedule} cleaning` : 'Recurring cleaning';
  };

  const getTankName = (tankId: string) => {
    const tank = tanks.find(t => t.id === tankId);
    return tank ? tank.name : `Tank ${tankId}`;
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="text-red-500 p-4">{error}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Cleaning Schedules</CardTitle>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Calendar className="mr-2 h-4 w-4" />
          Add Schedule
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <RotateCw className="h-6 w-6 animate-spin" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            No cleaning schedules found. Click 'Add Schedule' to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => {
              const status = getScheduleStatus(schedule);
              return (
                <div
                  key={schedule._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{getTankName(schedule.tankId)}</div>
                    <div className="text-sm text-gray-500">
                      {formatScheduleDescription(schedule)}
                    </div>
                    {schedule.nextCleaning && (
                      <div className="text-sm">
                        Next: {format(new Date(schedule.nextCleaning), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        status === 'overdue'
                          ? 'destructive'
                          : status === 'upcoming'
                          ? 'secondary'
                          : 'default'
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSchedule(schedule._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <CleaningScheduleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveSchedule}
        tanks={tanks}
      />
    </Card>
  );
}