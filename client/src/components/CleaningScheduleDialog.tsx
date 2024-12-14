import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { CreateCleaningScheduleDto } from "@/api/cleaningSchedules";

interface Tank {
  id: string;
  name: string;
}

interface CleaningScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: CreateCleaningScheduleDto) => void;
  tanks: Tank[];
}

type ScheduleType = 'recurring' | 'single';
type ScheduleFrequency = 'Daily' | 'Weekly' | 'Bi-weekly' | 'Monthly';

export function CleaningScheduleDialog({
  isOpen,
  onClose,
  onSave,
  tanks
}: CleaningScheduleDialogProps) {
  const [scheduleType, setScheduleType] = useState<ScheduleType>('recurring');
  const [formData, setFormData] = useState({
    tankId: '',
    schedule: 'Weekly' as ScheduleFrequency,
    lastCleaning: format(new Date(), 'yyyy-MM-dd')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const schedule: CreateCleaningScheduleDto = {
      tankId: formData.tankId,
      type: scheduleType,
      lastCleaning: formData.lastCleaning,
      schedule: scheduleType === 'recurring' ? formData.schedule : undefined
    };

    onSave(schedule);
  };

  const handleClose = () => {
    setFormData({
      tankId: '',
      schedule: 'Weekly',
      lastCleaning: format(new Date(), 'yyyy-MM-dd')
    });
    setScheduleType('recurring');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Cleaning Schedule</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tank</Label>
            <Select
              value={formData.tankId}
              onValueChange={(value) => setFormData({ ...formData, tankId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tank" />
              </SelectTrigger>
              <SelectContent>
                {tanks.map((tank) => (
                  <SelectItem key={tank.id} value={tank.id}>
                    {tank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Schedule Type</Label>
            <RadioGroup
              value={scheduleType}
              onValueChange={(value: ScheduleType) => setScheduleType(value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recurring" id="recurring" />
                <Label htmlFor="recurring">Recurring</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single">Single Date</Label>
              </div>
            </RadioGroup>
          </div>

          {scheduleType === 'recurring' && (
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={formData.schedule}
                onValueChange={(value: ScheduleFrequency) => 
                  setFormData({ ...formData, schedule: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>{scheduleType === 'recurring' ? 'First Cleaning Date' : 'Cleaning Date'}</Label>
            <Input
              type="date"
              value={formData.lastCleaning}
              onChange={(e) => setFormData({ ...formData, lastCleaning: e.target.value })}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.tankId || !formData.lastCleaning}
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}