import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSettings } from "@/contexts/SettingsContext"
import { useToast } from "@/hooks/useToast"
import { Save, Loader2 } from "lucide-react"
import { useState } from "react"
import { Settings as SettingsType } from "@/api/settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Settings() {
  const { temperatureUnit, refreshRate, numberOfTanks, updateSettings, isLoading: settingsLoading } = useSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SettingsType>({
    temperatureUnit,
    refreshRate,
    numberOfTanks
  });

  const handleSubmit = async () => {
    try {
      await updateSettings(formData);
      toast({
        title: "Success",
        description: "Settings updated successfully"
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center justify-between">
                General Settings
                <Button onClick={handleSubmit} disabled={settingsLoading}>
                  {settingsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Temperature Unit</Label>
                  <Select
                    value={formData.temperatureUnit}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, temperatureUnit: value as 'celsius' | 'fahrenheit' }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select temperature unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celsius">Celsius</SelectItem>
                      <SelectItem value="fahrenheit">Fahrenheit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Refresh Rate (seconds)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="3600"
                    value={formData.refreshRate}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= 3600) {
                        setFormData(prev => ({ ...prev, refreshRate: value }));
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Number of Tanks</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.numberOfTanks}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= 20) {
                        setFormData(prev => ({ ...prev, numberOfTanks: value }));
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}