import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getTanks, getDetailedTankData, getTemperatureHistory } from "@/api/tanks"
import { ThermometerIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Tank } from "@/api/tanks"

interface TemperatureData {
  timestamp: string;
  temperature: number;
}

export function Monitoring() {
  const [tanks, setTanks] = useState<Tank[]>([])
  const [selectedTank, setSelectedTank] = useState<string>("")
  const [detailedTankData, setDetailedTankData] = useState<Tank | null>(null)
  const [tempHistory, setTempHistory] = useState<TemperatureData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial tanks data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const tanksData = await getTanks()
        setTanks(tanksData)
        if (tanksData.length > 0) {
          setSelectedTank(tanksData[0].id)
        }
      } catch (error) {
        console.error('Error fetching tanks:', error)
        setError('Failed to fetch tanks data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fetch detailed tank data when a tank is selected
  useEffect(() => {
    if (!selectedTank) return;

    const fetchDetailedData = async () => {
      try {
        setError(null)
        const [detailedData, historyData] = await Promise.all([
          getDetailedTankData(selectedTank),
          getTemperatureHistory()
        ])
        setDetailedTankData(detailedData)
        setTempHistory(historyData.history)

        // Set up SSE for real-time temperature updates
        const eventSource = new EventSource(`http://localhost:3000/api/tanks/${selectedTank}/temperature-stream`)
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setDetailedTankData(prevData => prevData ? {
              ...prevData,
              temperature: data.temperature
            } : null)
            setTempHistory(prevHistory => [
              ...prevHistory.slice(-23),
              { timestamp: new Date().toISOString(), temperature: data.temperature }
            ])
          } catch (error) {
            console.error('Error processing temperature update:', error)
          }
        }

        eventSource.onerror = () => {
          console.error('EventSource failed')
          eventSource.close()
        }

        return () => {
          eventSource.close()
        }
      } catch (error) {
        console.error('Error fetching detailed tank data:', error)
        setError('Failed to fetch tank details')
      }
    }

    fetchDetailedData()
  }, [selectedTank])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return (
      <div className="space-y-4 p-8 pt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Monitoring</h2>

      {detailedTankData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            All tanks are currently operating in {detailedTankData.mode.toLowerCase()} mode.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTank} onValueChange={setSelectedTank}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-9">
          {tanks.map((tank) => (
            <TabsTrigger key={tank.id} value={tank.id}>
              {tank.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {detailedTankData && (
          <TabsContent value={selectedTank}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Temperature Trend - {detailedTankData.name}</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tempHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                      />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Current Status - {detailedTankData.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ThermometerIcon className="h-4 w-4 text-rose-500" />
                        <span>Current Temperature</span>
                      </div>
                      <span className="text-2xl font-bold">{detailedTankData.temperature}°F</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Mode</span>
                        <span className="font-medium">{detailedTankData.mode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valve Status</span>
                        <span className="font-medium">{detailedTankData.valveStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status</span>
                        <span className="font-medium">{detailedTankData.status}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}