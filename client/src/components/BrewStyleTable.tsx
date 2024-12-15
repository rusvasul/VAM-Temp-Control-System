import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { BrewStyleDialog } from "./BrewStyleDialog"
import { ConfirmDialog } from "./ConfirmDialog"
import { deleteBrewStyle } from "@/api/brewStyles"
import { useToast } from "@/hooks/useToast"
import type { BrewStyle } from "@/api/brewStyles"

interface BrewStyleTableProps {
  styles: BrewStyle[]
  isLoading: boolean
  onUpdate: () => void
}

export function BrewStyleTable({ styles, isLoading, onUpdate }: BrewStyleTableProps) {
  const [editStyle, setEditStyle] = useState<BrewStyle | null>(null)
  const [deleteStyle, setDeleteStyle] = useState<BrewStyle | null>(null)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!deleteStyle) return

    try {
      await deleteBrewStyle(deleteStyle.id)
      onUpdate()
      toast({
        title: "Success",
        description: "Brew style deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting brew style:', error)
      toast({
        title: "Error",
        description: "Failed to delete brew style",
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
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {styles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No brew styles found
              </TableCell>
            </TableRow>
          ) : (
            styles.map((style) => (
              <TableRow key={style.id}>
                <TableCell>{style.name}</TableCell>
                <TableCell>{style.minTemp}</TableCell>
                <TableCell>{style.maxTemp}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditStyle(style)}
                  >
                    <Edit className="h-4 w-4" />
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

      <BrewStyleDialog
        open={!!editStyle}
        onOpenChange={() => setEditStyle(null)}
        style={editStyle}
        onSuccess={() => {
          setEditStyle(null)
          onUpdate()
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteStyle}
        onClose={() => setDeleteStyle(null)}
        onConfirm={handleDelete}
        title="Delete Brew Style"
        description="Are you sure you want to delete this brew style? This action cannot be undone."
      />
    </>
  )
} 