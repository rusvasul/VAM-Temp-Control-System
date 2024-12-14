import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ProductionSchedule } from "@/api/productionSchedules"

interface ProductionScheduleTableProps {
  schedules: ProductionSchedule[]
  onEdit: (schedule: ProductionSchedule) => void
}

export function ProductionScheduleTable({ schedules, onEdit }: ProductionScheduleTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tank ID</TableHead>
          <TableHead>Beer Style</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.map((schedule) => (
          <TableRow key={schedule._id}>
            <TableCell>{schedule.tankId}</TableCell>
            <TableCell>{schedule.beerStyle}</TableCell>
            <TableCell>{new Date(schedule.startDate).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(schedule.endDate).toLocaleDateString()}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => onEdit(schedule)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}