import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductionSchedule } from "@/api/productionSchedules"

interface ProductionScheduleTableProps {
  schedules: ProductionSchedule[]
}

export function ProductionScheduleTable({ schedules }: ProductionScheduleTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tank ID</TableHead>
          <TableHead>Beer Style</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.map((schedule) => (
          <TableRow key={schedule._id}>
            <TableCell>{schedule.tankId}</TableCell>
            <TableCell>{schedule.beerStyle}</TableCell>
            <TableCell>{new Date(schedule.startDate).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(schedule.endDate).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}