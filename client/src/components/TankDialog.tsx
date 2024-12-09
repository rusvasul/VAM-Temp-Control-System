import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface TankDialogProps {
  isOpen: boolean
  onClose: () => void
  tank: {
    id: number
    name: string
    temperature: number
    status: string
    mode: string
    valveStatus: string
    location?: string
    contents?: string
    setPoint?: number
  }
}

export function TankDialog({ isOpen, onClose, tank }: TankDialogProps) {
  const [localTank, setLocalTank] = useState(tank)

  const handleSave = () => {
    // Here you would typically make an API call to save the changes
    console.log('Saving tank changes:', localTank)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle>Tank Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={localTank.name}
              onChange={(e) => setLocalTank({ ...localTank, name: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={localTank.location || ''}
              onChange={(e) => setLocalTank({ ...localTank, location: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contents" className="text-right">
              Contents
            </Label>
            <Input
              id="contents"
              value={localTank.contents || ''}
              onChange={(e) => setLocalTank({ ...localTank, contents: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="setPoint" className="text-right">
              Set Point
            </Label>
            <Input
              id="setPoint"
              type="number"
              value={localTank.setPoint || tank.temperature}
              onChange={(e) => setLocalTank({ ...localTank, setPoint: parseFloat(e.target.value) })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={localTank.status}
              onValueChange={(value) => setLocalTank({ ...localTank, status: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}