import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getTanks, getTemperatureHistory } from "@/api/tanks"
import { ThermometerIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function Monitoring() {
  const [tanks, setTanks] = useState([])
  const [selectedTank, setSelectedTank] = useState("1")
  const [tempHistory, setTempHistory] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const [tanksData, historyData] = await Promise.all([
        getTanks(),
        getTemperatureHistory()
      ])
      setTanks(tanksData.tanks)
      setTempHistory(historyData.history)
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Monitoring</h2>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          All tanks are currently operating in cooling mode.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue={selectedTank} onValueChange={setSelectedTank}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-9">
          {tanks.map((tank) => (
            <TabsTrigger key={tank.id} value={tank.id.toString()}>
              Tank {tank.id}
            </TabsTrigger>
          ))}
        </TabsList>
        {tanks.map((tank) => (
          <TabsContent key={tank.id} value={tank.id.toString()}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Temperature Trend</CardTitle>
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
                  <CardTitle>Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ThermometerIcon className="h-4 w-4 text-rose-500" />
                        <span>Current Temperature</span>
                      </div>
                      <span className="text-2xl font-bold">{tank.temperature}°F</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Mode</span>
                        <span className="font-medium">{tank.mode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valve Status</span>
                        <span className="font-medium">{tank.valveStatus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status</span>
                        <span className="font-medium">{tank.status}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}