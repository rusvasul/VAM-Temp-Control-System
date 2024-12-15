import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CleaningSchedules } from "@/components/CleaningSchedules"
import { ProductionScheduleDialog } from "@/components/ProductionScheduleDialog"
import { ProductionScheduleTable } from "@/components/ProductionScheduleTable"
import { getProductionSchedules, ProductionSchedule, deleteProductionSchedule } from "@/api/productionSchedules"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { getTanks, Tank } from "@/api/tanks"
import { useToast } from "@/hooks/useToast"

export function Schedules() {
  const { toast } = useToast();
  const [isProductionScheduleDialogOpen, setIsProductionScheduleDialogOpen] = useState(false);
  const [productionSchedules, setProductionSchedules] = useState<ProductionSchedule[]>([]);
  const [scheduleToEdit, setScheduleToEdit] = useState<ProductionSchedule | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  const [tanks, setTanks] = useState<Tank[]>([]);

  useEffect(() => {
    fetchProductionSchedules();
    fetchTanks();
  }, []);

  const fetchTanks = async () => {
    try {
      const tanksData = await getTanks();
      setTanks(tanksData);
    } catch (error) {
      console.error('Error fetching tanks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tanks data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchProductionSchedules = async () => {
    try {
      const schedules = await getProductionSchedules();
      setProductionSchedules(schedules);
    } catch (error) {
      console.error('Error fetching production schedules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch production schedules",
        variant: "destructive",
      });
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tank Schedules</h1>
      </div>

      <Tabs defaultValue="production" className="space-y-6">
        <TabsList>
          <TabsTrigger value="production">Production Schedules</TabsTrigger>
          <TabsTrigger value="cleaning">Cleaning Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="production">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Production Schedules
                <Button onClick={() => setIsProductionScheduleDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Schedule
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
        </TabsContent>

        <TabsContent value="cleaning">
          <Card>
            <CardHeader>
              <CardTitle>Cleaning Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <CleaningSchedules tanks={tanks} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProductionScheduleDialog
        isOpen={isProductionScheduleDialogOpen}
        onClose={() => {
          setIsProductionScheduleDialogOpen(false);
          setScheduleToEdit(null);
        }}
        onSave={handleSaveSchedule}
        tanks={tanks}
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