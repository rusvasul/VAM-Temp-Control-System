import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
    status: 'planned',
    notes: ''
  })
  const [brewStyles, setBrewStyles] = useState<BrewStyle[]>([])
  const [selectedStyle, setSelectedStyle] = useState<BrewStyle | null>(null)
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
        status: scheduleToEdit.status,
        notes: scheduleToEdit.notes || ''
      })
    } else {
      setFormData({
        tankId: '',
        brewStyle: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'planned',
        notes: ''
      })
    }
  }, [scheduleToEdit])

  // Update selected style when brew style changes
  useEffect(() => {
    const style = brewStyles.find(s => s.name === formData.brewStyle)
    setSelectedStyle(style || null)
  }, [formData.brewStyle, brewStyles])

  const calculateEndDate = (style: BrewStyle, startDate: Date) => {
    const totalDays = 
      style.operationTiming.primaryFermentationDays +
      (style.operationTiming.secondaryFermentationDays || 0) +
      style.operationTiming.clarificationDays +
      style.operationTiming.conditioningDays;
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + totalDays);
    return format(endDate, 'MMM d, yyyy');
  }

  const getExpectedVolume = (style: BrewStyle) => {
    if (style.beverageType === 'mead') {
      return style.waterAddition.targetVolume;
    } else if (style.beverageType === 'cider') {
      return style.juice.totalVolume;
    } else if (style.beverageType === 'beer') {
      return style.water.mashVolume + style.water.spargeVolume;
    }
    return 0;
  }

  const getBatchNumber = (style: BrewStyle, startDate: Date) => {
    return `${style.name} ${format(startDate, 'yyMMdd')}`;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStyle) {
      toast({
        title: "Error",
        description: "Please select a brew style",
        variant: "destructive",
      })
      return
    }

    const startDate = new Date(formData.startDate)
    const schedule = {
      ...scheduleToEdit,
      ...formData,
      startDate: startDate.toISOString(),
      // These fields will be calculated on the server
      batchNumber: getBatchNumber(selectedStyle, startDate),
      expectedVolume: getExpectedVolume(selectedStyle)
    }

    onSave(schedule)
    onClose()
  }

  const handleClose = () => {
    setFormData({
      tankId: '',
      brewStyle: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'planned',
      notes: ''
    })
    setSelectedStyle(null)
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

          {selectedStyle && (
            <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
              <div className="text-sm font-medium">Schedule Details (Auto-calculated)</div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Batch Number:</span>{' '}
                  {getBatchNumber(selectedStyle, new Date(formData.startDate))}
                </div>
                <div>
                  <span className="font-medium">End Date:</span>{' '}
                  {calculateEndDate(selectedStyle, new Date(formData.startDate))}
                </div>
                <div>
                  <span className="font-medium">Expected Volume:</span>{' '}
                  {getExpectedVolume(selectedStyle)}L
                </div>
                <div>
                  <span className="font-medium">Duration:</span>{' '}
                  {selectedStyle.operationTiming.primaryFermentationDays +
                    (selectedStyle.operationTiming.secondaryFermentationDays || 0) +
                    selectedStyle.operationTiming.clarificationDays +
                    selectedStyle.operationTiming.conditioningDays} days
                </div>
              </div>
            </div>
          )}

          {scheduleToEdit && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              className="h-20"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.tankId || !formData.brewStyle || !formData.startDate}
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}