import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import { useState } from "react"
import { BeerStyleDialog } from "./BeerStyleDialog"
import { ConfirmDialog } from "./ConfirmDialog"
import { deleteBeerStyle } from "@/api/beerStyles"
import { useToast } from "@/hooks/useToast"
import type { BeerStyle } from "@/api/beerStyles"

interface BeerStyleTableProps {
  styles: BeerStyle[]
  isLoading: boolean
  onUpdate: () => void
}

export function BeerStyleTable({ styles, isLoading, onUpdate }: BeerStyleTableProps) {
  const [editStyle, setEditStyle] = useState<BeerStyle | null>(null)
  const [deleteStyle, setDeleteStyle] = useState<BeerStyle | null>(null)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!deleteStyle) return

    try {
      await deleteBeerStyle(deleteStyle.id)
      toast({
        title: "Success",
        description: "Beer style deleted successfully",
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete beer style",
        variant: "destructive",
      })
    } finally {
      setDeleteStyle(null)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Min Temp (°F)</TableHead>
            <TableHead>Max Temp (°F)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {styles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No beer styles found
              </TableCell>
            </TableRow>
          ) : (
            styles.map((style) => (
              <TableRow key={style.id}>
                <TableCell>{style.name}</TableCell>
                <TableCell>{style.minTemp}</TableCell>
                <TableCell>{style.maxTemp}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditStyle(style)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteStyle(style)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <BeerStyleDialog
        open={!!editStyle}
        onOpenChange={() => setEditStyle(null)}
        onSuccess={() => {
          onUpdate()
          setEditStyle(null)
        }}
        style={editStyle}
      />

      <ConfirmDialog
        isOpen={!!deleteStyle}
        onClose={() => setDeleteStyle(null)}
        onConfirm={handleDelete}
        title="Delete Beer Style"
        description={`Are you sure you want to delete ${deleteStyle?.name}? This action cannot be undone.`}
      />
    </>
  )
} 