import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useManagerSettings } from "@/contexts/ManagerSettingsContext"
import { createProductionSchedule, updateProductionSchedule, checkScheduleConflict, ProductionSchedule } from "@/api/productionSchedules"
import { useToast } from "@/hooks/useToast"

interface ProductionScheduleDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (schedule: ProductionSchedule) => void
  numberOfTanks: number
  scheduleToEdit?: ProductionSchedule | null
}

export function ProductionScheduleDialog({ isOpen, onClose, onSave, numberOfTanks, scheduleToEdit }: ProductionScheduleDialogProps) {
  const { settings } = useManagerSettings()
  const { toast } = useToast()
  const [schedule, setSchedule] = useState<Partial<ProductionSchedule>>({
    tankId: "1",
    beerStyle: settings.beerStyles[0]?.name || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  useEffect(() => {
    if (scheduleToEdit) {
      setSchedule({
        ...scheduleToEdit,
        startDate: new Date(scheduleToEdit.startDate).toISOString().split('T')[0],
        endDate: new Date(scheduleToEdit.endDate).toISOString().split('T')[0],
      })
    } else {
      setSchedule({
        tankId: "1",
        beerStyle: settings.beerStyles[0]?.name || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
    }
  }, [scheduleToEdit, settings.beerStyles])

  const handleSave = async () => {
    try {
      const hasConflict = await checkScheduleConflict(schedule);
      if (hasConflict) {
        toast({
          title: "Scheduling Conflict",
          description: "This schedule conflicts with an existing schedule for the same tank.",
          variant: "destructive",
        });
        return;
      }

      let savedSchedule: ProductionSchedule
      if (scheduleToEdit) {
        savedSchedule = await updateProductionSchedule(scheduleToEdit._id, schedule as ProductionSchedule)
        toast({
          title: "Success",
          description: "Production schedule updated successfully",
        })
      } else {
        savedSchedule = await createProductionSchedule(schedule as ProductionSchedule)
        toast({
          title: "Success",
          description: "Production schedule created successfully",
        })
      }
      onSave(savedSchedule)
      onClose()
    } catch (error) {
      console.error("Error saving production schedule:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle>{scheduleToEdit ? 'Edit' : 'Add'} Production Schedule</DialogTitle>
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