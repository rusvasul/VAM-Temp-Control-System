import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface CleaningScheduleDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (schedule: {
    tankId: string;
    schedule: string;
    lastCleaning: string;
  }) => void
  numberOfTanks: number
}

export function CleaningScheduleDialog({ isOpen, onClose, onSave, numberOfTanks }: CleaningScheduleDialogProps) {
  const [schedule, setSchedule] = useState({
    tankId: "1",
    schedule: "Weekly",
    lastCleaning: new Date().toISOString().split('T')[0]
  })

  const handleSave = () => {
    onSave(schedule)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle>Add Cleaning Schedule</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tank" className="text-right">Tank</Label>
            <Select
              value={schedule.tankId}
              onValueChange={(value) => setSchedule({ ...schedule, tankId: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select tank" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: numberOfTanks }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Tank {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">Frequency</Label>
            <Select
              value={schedule.schedule}
              onValueChange={(value) => setSchedule({ ...schedule, schedule: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}