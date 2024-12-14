import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSettings } from "@/contexts/SettingsContext"
import { useToast } from "@/hooks/useToast"
import { Save, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Settings as SettingsType } from "@/api/settings"

export function Settings() {
  const { temperatureUnit, refreshRate, numberOfTanks, updateSettings, isLoading } = useSettings();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<SettingsType>({
    temperatureUnit,
    refreshRate,
    numberOfTanks
  });

  // Update form data when settings change
  useEffect(() => {
    setFormData({
      temperatureUnit,
      refreshRate,
      numberOfTanks
    });
  }, [temperatureUnit, refreshRate, numberOfTanks]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSettings(formData);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Temperature Unit</Label>
              <Select
                value={formData.temperatureUnit}
                onValueChange={(value: 'celsius' | 'fahrenheit') => 
                  setFormData(prev => ({ ...prev, temperatureUnit: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                  <SelectItem value="celsius">Celsius (°C)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Refresh Rate (seconds)</Label>
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
    </div>
  );
}