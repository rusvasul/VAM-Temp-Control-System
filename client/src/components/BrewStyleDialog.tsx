import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createBrewStyle, updateBrewStyle } from "@/api/brewStyles"
import { useToast } from "@/hooks/useToast"
import type { BrewStyle } from "@/api/brewStyles"

interface BrewStyleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  style?: BrewStyle | null
}

export function BrewStyleDialog({
  open,
  onOpenChange,
  onSuccess,
  style
}: BrewStyleDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: style?.name || "",
    minTemp: style?.minTemp || 32,
    maxTemp: style?.maxTemp || 75
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (style) {
        await updateBrewStyle(style.id, formData)
      } else {
        await createBrewStyle(formData)
      }

      onSuccess()
      onOpenChange(false)
      toast({
        title: "Success",
        description: `Brew style ${style ? "updated" : "created"} successfully`,
      })
    } catch (error) {
      console.error('Error saving brew style:', error)
      toast({
        title: "Error",
        description: error.message || `Failed to ${style ? "update" : "create"} brew style`,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {style ? "Edit Brew Style" : "Add Brew Style"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter brew style name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minTemp">Minimum Temperature (°F)</Label>
            <Input
              id="minTemp"
              type="number"
              value={formData.minTemp}
              onChange={(e) => setFormData({ ...formData, minTemp: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTemp">Maximum Temperature (°F)</Label>
            <Input
              id="maxTemp"
              type="number"
              value={formData.maxTemp}
              onChange={(e) => setFormData({ ...formData, maxTemp: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              {style ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 