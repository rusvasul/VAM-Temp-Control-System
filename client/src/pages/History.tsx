import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const mockHistoryData = [
  { timestamp: "2024-01-15 14:30", tankId: 1, temperature: 68.5, event: "Temperature adjusted" },
  { timestamp: "2024-01-15 14:00", tankId: 2, temperature: 70.2, event: "Valve opened" },
  { timestamp: "2024-01-15 13:30", tankId: 3, temperature: 69.8, event: "Mode changed to cooling" },
]

export function History() {
  const [date, setDate] = useState<Date>(new Date())
  const [selectedTank, setSelectedTank] = useState("all")

  return (
    <div className="space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">History</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Date Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTank} onValueChange={setSelectedTank}>
              <SelectTrigger>
                <SelectValue placeholder="Select Tank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tanks</SelectItem>
                {Array.from({ length: 9 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Tank {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Tank</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Event</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHistoryData.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.timestamp}</TableCell>
                  <TableCell>Tank {record.tankId}</TableCell>
                  <TableCell>{record.temperature}°F</TableCell>
                  <TableCell>{record.event}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}