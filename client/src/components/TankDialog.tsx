import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateTank, deleteTank } from "@/api/tanks"
import { useToast } from "@/hooks/useToast"
import { Trash2 } from "lucide-react"
import { ConfirmDialog } from "./ConfirmDialog"

interface TankDialogProps {
  isOpen: boolean
  onClose: () => void
  tank: {
    id: string
    name: string
    temperature: number
    status: string
    mode: string
    valveStatus: string
    setPoint?: number
  }
  onUpdate: () => void
  onDelete?: () => void
}

export function TankDialog({ isOpen, onClose, tank, onUpdate, onDelete }: TankDialogProps) {
  const [localTank, setLocalTank] = useState(tank)
  const [isSaving, setIsSaving] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLocalTank(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setLocalTank(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await updateTank(tank.id, {
        id: tank.id,
        name: localTank.name,
        status: localTank.status === 'Maintenance' ? localTank.status : tank.status,
        mode: tank.mode,
        valveStatus: localTank.status === 'Maintenance' ? localTank.valveStatus : tank.valveStatus,
        setPoint: localTank.setPoint
      })
      toast({
        title: "Success",
        description: "Tank updated successfully",
      })
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error updating tank:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update tank. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTank(tank.id)
      toast({
        title: "Success",
        description: "Tank deleted successfully",
      })
      onDelete?.()
      onClose()
    } catch (error) {
      console.error('Error deleting tank:', error)
      toast({
        title: "Error",
        description: "Failed to delete tank. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Edit Tank: {tank.name}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={localTank.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="setPoint" className="text-right">
                Set Point
              </Label>
              <Input
                id="setPoint"
                name="setPoint"
                type="number"
                value={localTank.setPoint || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={localTank.status}
                onValueChange={handleSelectChange('status')}
                disabled={localTank.status !== 'Maintenance'}
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mode" className="text-right">
                Mode
              </Label>
              <Input
                id="mode"
                name="mode"
                value={localTank.mode}
                disabled={true}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valveStatus" className="text-right">
                Valve Status
              </Label>
              <Select
                value={localTank.valveStatus}
                onValueChange={handleSelectChange('valveStatus')}
                disabled={localTank.status !== 'Maintenance'}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select valve status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Tank"
        description={`Are you sure you want to delete ${tank.name}? This action cannot be undone.`}
      />
    </>
  )
}