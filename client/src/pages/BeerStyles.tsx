import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getBeerStyles } from "@/api/beerStyles"
import { BeerStyleTable } from "@/components/BeerStyleTable"
import { BeerStyleDialog } from "@/components/BeerStyleDialog"
import { useToast } from "@/hooks/useToast"
import type { BeerStyle } from "@/api/beerStyles"

export function BeerStyles() {
  const [styles, setStyles] = useState<BeerStyle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchBeerStyles = async () => {
    try {
      const data = await getBeerStyles()
      setStyles(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch beer styles",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBeerStyles()
  }, [])

  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Beer Styles</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Style
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Beer Styles</CardTitle>
        </CardHeader>
        <CardContent>
          <BeerStyleTable 
            styles={styles} 
            isLoading={isLoading}
            onUpdate={fetchBeerStyles}
          />
        </CardContent>
      </Card>

      <BeerStyleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchBeerStyles}
      />
    </div>
  )
} 