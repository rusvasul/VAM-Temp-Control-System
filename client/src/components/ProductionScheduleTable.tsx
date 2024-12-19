import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductionSchedule } from "@/api/productionSchedules"
import { format } from "date-fns"
import { Progress } from "@/components/ui/progress"

interface ProductionScheduleTableProps {
  schedules: ProductionSchedule[]
  onEdit: (schedule: ProductionSchedule) => void
  onDelete: (scheduleId: string) => void
}

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    'planned': 'secondary',
    'in-progress': 'default',
    'completed': 'success',
    'cancelled': 'destructive'
  } as const;

  return (
    <Badge variant={variants[status as keyof typeof variants]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export function ProductionScheduleTable({ schedules, onEdit, onDelete }: ProductionScheduleTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Batch #</TableHead>
          <TableHead>Tank</TableHead>
          <TableHead>Beer Style</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Volume</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.map((schedule) => (
          <TableRow key={schedule._id}>
            <TableCell>
              <StatusBadge status={schedule.status} />
            </TableCell>
            <TableCell>{schedule.batchNumber}</TableCell>
            <TableCell>{schedule.tankId}</TableCell>
            <TableCell>{schedule.brewStyle}</TableCell>
            <TableCell>
              {format(new Date(schedule.startDate), 'MMM d, yyyy h:mm a')}
            </TableCell>
            <TableCell>
              {format(new Date(schedule.endDate), 'MMM d, yyyy h:mm a')}
            </TableCell>
            <TableCell>
              <div className="w-full">
                <Progress value={schedule.progress} className="w-[60px]" />
                <span className="text-xs text-muted-foreground ml-2">
                  {schedule.progress}%
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>Expected: {schedule.expectedVolume}L</div>
                {schedule.actualVolume && (
                  <div className="text-muted-foreground">
                    Actual: {schedule.actualVolume}L
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(schedule)}
                >
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onDelete(schedule._id)}
                  disabled={schedule.status === 'in-progress'}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}