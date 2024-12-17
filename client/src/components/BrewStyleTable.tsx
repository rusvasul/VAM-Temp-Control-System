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
import { Edit, Trash2, FileText } from "lucide-react"
import { BrewStyleDialog } from "./BrewStyleDialog"
import { ConfirmDialog } from "./ConfirmDialog"
import { deleteBrewStyle } from "@/api/brewStyles"
import { useToast } from "@/hooks/useToast"
import type { BrewStyle } from "@/types/brewStyle"

interface BrewStyleTableProps {
  styles: BrewStyle[]
  isLoading: boolean
  onUpdate: () => void
}

export function BrewStyleTable({ styles, isLoading, onUpdate }: BrewStyleTableProps) {
  const [editStyle, setEditStyle] = useState<BrewStyle | null>(null)
  const [deleteStyle, setDeleteStyle] = useState<BrewStyle | null>(null)
  const { toast } = useToast()

  const calculateTotalDays = (style: BrewStyle) => {
    let total = 0;
    if (style.operationTiming) {
      total += style.operationTiming.primaryFermentationDays || 0;
      total += style.operationTiming.clarificationDays || 0;
      total += style.operationTiming.conditioningDays || 0;
    }
    return total;
  }

  const handleDelete = async () => {
    if (!deleteStyle?._id) {
      toast({
        title: "Error",
        description: "Invalid style ID",
        variant: "destructive",
      })
      setDeleteStyle(null)
      return
    }

    try {
      await deleteBrewStyle(deleteStyle._id)
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
            <TableHead>Type</TableHead>
            <TableHead>Total Days</TableHead>
            <TableHead>Recipe</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {styles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No brew styles found
              </TableCell>
            </TableRow>
          ) : (
            styles.map((style) => (
              <TableRow key={style._id}>
                <TableCell>{style.name}</TableCell>
                <TableCell className="capitalize">{style.beverageType}</TableCell>
                <TableCell>{calculateTotalDays(style)} days</TableCell>
                <TableCell>
                  {style.recipeDocument?.fileUrl ? (
                    <a 
                      href={style.recipeDocument.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <FileText className="h-4 w-4" />
                      View Recipe
                    </a>
                  ) : (
                    <span className="text-gray-400">No recipe</span>
                  )}
                </TableCell>
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
        editingStyle={editStyle}
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