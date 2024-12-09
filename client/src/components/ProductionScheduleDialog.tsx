import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useManagerSettings } from "@/contexts/ManagerSettingsContext"

interface ProductionScheduleDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (schedule: {
    tankId: number;
    beerStyle: string;
    startDate: string;
    endDate: string;
  }) => void
  numberOfTanks: number
}

export function ProductionScheduleDialog({ isOpen, onClose, onSave, numberOfTanks }: ProductionScheduleDialogProps) {
  const { settings } = useManagerSettings()
  const [schedule, setSchedule] = useState({
    tankId: 1,
    beerStyle: settings.beerStyles[0]?.name || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  const handleSave = () => {
    onSave(schedule)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle>Add Production Schedule</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tank" className="text-right">Tank</Label>
            <Select
              value={schedule.tankId.toString()}
              onValueChange={(value) => setSchedule({ ...schedule, tankId: parseInt(value) })}
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
            <Label htmlFor="style" className="text-right">Beer Style</Label>
            <Select
              value={schedule.beerStyle}
              onValueChange={(value) => setSchedule({ ...schedule, beerStyle: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {settings.beerStyles.map((style) => (
                  <SelectItem key={style.id} value={style.name}>
                    {style.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={schedule.startDate}
              onChange={(e) => setSchedule({ ...schedule, startDate: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={schedule.endDate}
              onChange={(e) => setSchedule({ ...schedule, endDate: e.target.value })}
              className="col-span-3"
            />
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