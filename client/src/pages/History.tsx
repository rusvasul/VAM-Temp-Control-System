import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getTanks, getTemperatureHistory } from "@/api/tanks"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface HistoryRecord {
  timestamp: string;
  temperature: number;
}

interface Tank {
  id: string;
  name: string;
}

export function History() {
  const [date, setDate] = useState<Date>(new Date())
  const [selectedTank, setSelectedTank] = useState<string>("all")
  const [tanks, setTanks] = useState<Tank[]>([])
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch tanks on component mount
  useEffect(() => {
    const fetchTanks = async () => {
      try {
        const tanksData = await getTanks()
        setTanks(tanksData)
      } catch (error) {
        console.error('Error fetching tanks:', error)
        setError('Failed to fetch tanks')
      }
    }
    fetchTanks()
  }, [])

  // Fetch temperature history when tank or date changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedTank === "all") {
        setHistoryData([])
        return
      }

      try {
        setError(null)
        const startDate = new Date(date)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(date)
        endDate.setHours(23, 59, 59, 999)

        const response = await getTemperatureHistory(
          selectedTank,
          startDate.toISOString(),
          endDate.toISOString()
        )
        setHistoryData(response.history)
      } catch (error) {
        console.error('Error fetching temperature history:', error)
        setError('Failed to fetch temperature history')
      }
    }

    fetchHistory()
  }, [selectedTank, date])

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
                {tanks.map((tank) => (
                  <SelectItem key={tank.id} value={tank.id}>
                    {tank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Temperature History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Temperature</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    {selectedTank === "all" 
                      ? "Please select a tank to view its temperature history" 
                      : "No temperature records found for the selected date"}
                  </TableCell>
                </TableRow>
              ) : (
                historyData.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{record.temperature}°F</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}