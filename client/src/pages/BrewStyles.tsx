import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getBrewStyles } from "@/api/brewStyles"
import { BrewStyleTable } from "@/components/BrewStyleTable"
import { BrewStyleDialog } from "@/components/BrewStyleDialog"
import { Plus } from "lucide-react"
import type { BrewStyle } from "@/api/brewStyles"
import { useToast } from "@/hooks/useToast"

export function BrewStyles() {
  const [styles, setStyles] = useState<BrewStyle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchBrewStyles = async () => {
    try {
      setIsLoading(true)
      const data = await getBrewStyles()
      setStyles(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch brew styles",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBrewStyles()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Brew Styles</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Style
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Brew Styles</CardTitle>
        </CardHeader>
        <CardContent>
          <BrewStyleTable
            styles={styles}
            isLoading={isLoading}
            onUpdate={fetchBrewStyles}
          />
        </CardContent>
      </Card>

      <BrewStyleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchBrewStyles}
      />
    </div>
  )
} 