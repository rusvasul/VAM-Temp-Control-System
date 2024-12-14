import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBeerStyle, updateBeerStyle } from "@/api/beerStyles"
import { useToast } from "@/hooks/useToast"
import type { BeerStyle } from "@/api/beerStyles"

interface BeerStyleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  style?: BeerStyle | null
}

export function BeerStyleDialog({ 
  open, 
  onOpenChange, 
  onSuccess, 
  style 
}: BeerStyleDialogProps) {
  const [formData, setFormData] = useState({
    name: style?.name || "",
    minTemp: style?.minTemp || 32,
    maxTemp: style?.maxTemp || 75
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (style) {
        await updateBeerStyle(style.id, formData)
      } else {
        await createBeerStyle(formData)
      }

      toast({
        title: "Success",
        description: `Beer style ${style ? "updated" : "created"} successfully`,
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${style ? "update" : "create"} beer style`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {style ? "Edit Beer Style" : "Add Beer Style"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                name: e.target.value 
              }))}
              placeholder="Enter beer style name"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minTemp">Min Temperature (°F)</Label>
              <Input
                id="minTemp"
                type="number"
                value={formData.minTemp}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  minTemp: Number(e.target.value) 
                }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTemp">Max Temperature (°F)</Label>
              <Input
                id="maxTemp"
                type="number"
                value={formData.maxTemp}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  maxTemp: Number(e.target.value) 
                }))}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 