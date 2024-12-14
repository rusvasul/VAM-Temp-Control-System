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
import { CleaningSchedules } from "@/components/CleaningSchedules"

export function Settings() {
  const { temperatureUnit, refreshRate, numberOfTanks, updateSettings, isLoading } = useSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SettingsType>({
    temperatureUnit,
    refreshRate,
    numberOfTanks
  });

  const handleSubmit = async () => {
    try {
      await updateSettings(formData);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center justify-between">
            Settings
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
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

      <CleaningSchedules tanks={Array.from({ length: formData.numberOfTanks }, (_, i) => ({
        id: (i + 1).toString(),
        name: `Tank ${i + 1}`
      }))} />
    </div>
  );
}