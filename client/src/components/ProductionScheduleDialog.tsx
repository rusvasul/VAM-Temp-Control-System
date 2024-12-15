import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ProductionSchedule } from "@/api/productionSchedules"
import { Tank } from "@/api/tanks"
import { BrewStyle, getBrewStyles } from "@/api/brewStyles"
import { useToast } from "@/hooks/useToast"

interface ProductionScheduleDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (schedule: ProductionSchedule) => void
  tanks: Tank[]
  scheduleToEdit: ProductionSchedule | null
}

export function ProductionScheduleDialog({
  isOpen,
  onClose,
  onSave,
  tanks,
  scheduleToEdit
}: ProductionScheduleDialogProps) {
  const [formData, setFormData] = useState({
    tankId: '',
    brewStyle: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })
  const [brewStyles, setBrewStyles] = useState<BrewStyle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchBrewStyles = async () => {
      try {
        const styles = await getBrewStyles()
        setBrewStyles(styles)
      } catch (error) {
        console.error('Error fetching brew styles:', error)
        toast({
          title: "Error",
          description: "Failed to fetch brew styles",
          variant: "destructive",
        })
      }
    }

    fetchBrewStyles()
  }, [])

  useEffect(() => {
    if (scheduleToEdit) {
      setFormData({
        tankId: scheduleToEdit.tankId,
        brewStyle: scheduleToEdit.brewStyle,
        startDate: format(new Date(scheduleToEdit.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(scheduleToEdit.endDate), 'yyyy-MM-dd')
      })
    } else {
      setFormData({
        tankId: '',
        brewStyle: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
      })
    }
  }, [scheduleToEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const schedule = {
      ...scheduleToEdit,
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString()
    }

    onSave(schedule)
    onClose()
  }

  const handleClose = () => {
    setFormData({
      tankId: '',
      brewStyle: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd')
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{scheduleToEdit ? 'Edit Production Schedule' : 'Add Production Schedule'}</DialogTitle>
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
            <Label>Brew Style</Label>
            <Select
              value={formData.brewStyle}
              onValueChange={(value) => setFormData({ ...formData, brewStyle: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brew style" />
              </SelectTrigger>
              <SelectContent>
                {brewStyles.map((style) => (
                  <SelectItem key={style.id} value={style.name}>
                    {style.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              min={formData.startDate}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.tankId || !formData.brewStyle || !formData.startDate || !formData.endDate}
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}