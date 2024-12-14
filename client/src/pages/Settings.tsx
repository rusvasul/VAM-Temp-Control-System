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
import { CleaningSchedules } from "@/components/CleaningSchedules"
import { ProductionScheduleDialog } from "@/components/ProductionScheduleDialog"
import { ProductionScheduleTable } from "@/components/ProductionScheduleTable"
import { getProductionSchedules, ProductionSchedule, deleteProductionSchedule } from "@/api/productionSchedules"
import { ConfirmDialog } from "@/components/ConfirmDialog"

export function Settings() {
  const { temperatureUnit, refreshRate, numberOfTanks, updateSettings, isLoading } = useSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SettingsType>({
    temperatureUnit,
    refreshRate,
    numberOfTanks
  });
  const [isProductionScheduleDialogOpen, setIsProductionScheduleDialogOpen] = useState(false);
  const [productionSchedules, setProductionSchedules] = useState<ProductionSchedule[]>([]);
  const [scheduleToEdit, setScheduleToEdit] = useState<ProductionSchedule | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchProductionSchedules();
  }, []);

  const fetchProductionSchedules = async () => {
    try {
      const schedules = await getProductionSchedules();
      setProductionSchedules(schedules);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch production schedules: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      await updateSettings(formData);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleSaveSchedule = (savedSchedule: ProductionSchedule) => {
    if (scheduleToEdit) {
      setProductionSchedules(productionSchedules.map(schedule =>
        schedule._id === savedSchedule._id ? savedSchedule : schedule
      ));
    } else {
      setProductionSchedules([...productionSchedules, savedSchedule]);
    }
    setScheduleToEdit(null);
  };

  const handleEditSchedule = (schedule: ProductionSchedule) => {
    setScheduleToEdit(schedule);
    setIsProductionScheduleDialogOpen(true);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setScheduleToDelete(scheduleId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSchedule = async () => {
    if (scheduleToDelete) {
      try {
        await deleteProductionSchedule(scheduleToDelete);
        setProductionSchedules(productionSchedules.filter(schedule => schedule._id !== scheduleToDelete));
        toast({
          title: "Success",
          description: "Production schedule deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete production schedule",
          variant: "destructive"
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setScheduleToDelete(null);
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

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center justify-between">
            Production Schedules
            <Button onClick={() => setIsProductionScheduleDialogOpen(true)}>
              Add Production Schedule
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductionScheduleTable
            schedules={productionSchedules}
            onEdit={handleEditSchedule}
            onDelete={handleDeleteSchedule}
          />
        </CardContent>
      </Card>

      <CleaningSchedules tanks={Array.from({ length: formData.numberOfTanks }, (_, i) => ({
        id: (i + 1).toString(),
        name: `Tank ${i + 1}`
      }))} />

      <ProductionScheduleDialog
        isOpen={isProductionScheduleDialogOpen}
        onClose={() => {
          setIsProductionScheduleDialogOpen(false);
          setScheduleToEdit(null);
        }}
        onSave={handleSaveSchedule}
        numberOfTanks={formData.numberOfTanks}
        scheduleToEdit={scheduleToEdit}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteSchedule}
        title="Delete Production Schedule"
        description="Are you sure you want to delete this production schedule? This action cannot be undone."
      />
    </div>
  );
}