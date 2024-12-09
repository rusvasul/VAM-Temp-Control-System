import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSettings } from "@/contexts/SettingsContext"
import { useManagerSettings } from "@/contexts/ManagerSettingsContext"
import { useToast } from "@/hooks/useToast"
import { Trash2, Plus, Save } from "lucide-react"
import { useState } from "react"
import { ProductionScheduleDialog } from "@/components/ProductionScheduleDialog"
import { CleaningScheduleDialog } from "@/components/CleaningScheduleDialog"

export function Settings() {
  const settings = useSettings();
  const managerSettings = useManagerSettings();
  const { toast } = useToast();
  const [isProductionDialogOpen, setIsProductionDialogOpen] = useState(false);
  const [isCleaningDialogOpen, setIsCleaningDialogOpen] = useState(false);

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const handleNumberOfTanksChange = (value: string) => {
    const number = parseInt(value);
    if (!isNaN(number) && number > 0 && number <= 20) {
      settings.updateSettings({ numberOfTanks: number });
    }
  };

  const addProductionSchedule = (newSchedule: any) => {
    managerSettings.updateSettings({
      productionSchedule: [...managerSettings.settings.productionSchedule, newSchedule]
    });

    toast({
      title: "Schedule Added",
      description: "New production schedule has been added successfully."
    });
  };

  const removeProductionSchedule = (index: number) => {
    const updatedSchedule = managerSettings.settings.productionSchedule.filter((_, i) => i !== index);
    managerSettings.updateSettings({
      productionSchedule: updatedSchedule
    });

    toast({
      title: "Schedule Removed",
      description: "Production schedule has been removed successfully."
    });
  };

  const addCleaningSchedule = (newSchedule: any) => {
    managerSettings.updateSettings({
      cleaningSchedules: [...managerSettings.settings.cleaningSchedules, newSchedule]
    });

    toast({
      title: "Schedule Added",
      description: "New cleaning schedule has been added successfully."
    });
  };

  const removeCleaningSchedule = (index: number) => {
    const updatedSchedule = managerSettings.settings.cleaningSchedules.filter((_, i) => i !== index);
    managerSettings.updateSettings({
      cleaningSchedules: updatedSchedule
    });

    toast({
      title: "Schedule Removed",
      description: "Cleaning schedule has been removed successfully."
    });
  };

  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Temperature Unit</Label>
                  <Select
                    value={settings.temperatureUnit}
                    onValueChange={(value) => settings.updateSettings({ temperatureUnit: value })}
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
                    value={settings.refreshRate}
                    onChange={(e) => settings.updateSettings({ refreshRate: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Number of Tanks</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={settings.numberOfTanks}
                    onChange={(e) => handleNumberOfTanksChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Retention (days)</Label>
                  <Input
                    type="number"
                    value={managerSettings.settings.systemSettings.dataRetentionDays}
                    onChange={(e) => managerSettings.updateSettings({
                      systemSettings: {
                        ...managerSettings.settings.systemSettings,
                        dataRetentionDays: Number(e.target.value)
                      }
                    })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoMode"
                  checked={settings.autoMode}
                  onCheckedChange={(checked) => settings.updateSettings({ autoMode: checked })}
                />
                <Label htmlFor="autoMode">Enable Automatic Mode</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Beer Styles Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Style Name</TableHead>
                      <TableHead>Min Temp (°F)</TableHead>
                      <TableHead>Max Temp (°F)</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {managerSettings.settings.beerStyles.map((style) => (
                      <TableRow key={style.id}>
                        <TableCell>
                          <Input
                            value={style.name}
                            onChange={(e) => managerSettings.updateBeerStyle(style.id, { name: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={style.minTemp}
                            onChange={(e) => managerSettings.updateBeerStyle(style.id, { minTemp: Number(e.target.value) })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={style.maxTemp}
                            onChange={(e) => managerSettings.updateBeerStyle(style.id, { maxTemp: Number(e.target.value) })}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => managerSettings.removeBeerStyle(style.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <Button
                className="mt-4"
                onClick={() => managerSettings.addBeerStyle({
                  id: Date.now(),
                  name: "New Style",
                  minTemp: 60,
                  maxTemp: 70
                })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Beer Style
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsProductionDialogOpen(true)} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Production Schedule
              </Button>
              <ScrollArea className="h-[300px] rounded-md border mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tank</TableHead>
                      <TableHead>Beer Style</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {managerSettings.settings.productionSchedule.map((schedule, index) => (
                      <TableRow key={index}>
                        <TableCell>Tank {schedule.tankId}</TableCell>
                        <TableCell>{schedule.beerStyle}</TableCell>
                        <TableCell>{schedule.startDate}</TableCell>
                        <TableCell>{schedule.endDate}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeProductionSchedule(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cleaning Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsCleaningDialogOpen(true)} className="w-full mb-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Cleaning Schedule
              </Button>
              <ScrollArea className="h-[300px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tank</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Last Cleaning</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {managerSettings.settings.cleaningSchedules.map((schedule, index) => (
                      <TableRow key={index}>
                        <TableCell>Tank {schedule.tankId}</TableCell>
                        <TableCell>{schedule.schedule}</TableCell>
                        <TableCell>{schedule.lastCleaning}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeCleaningSchedule(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {managerSettings.settings.userRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <Input
                            value={role.name}
                            onChange={(e) => managerSettings.updateUserRole(role.id, { name: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>{role.permissions.join(", ")}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => managerSettings.removeUserRole(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <Button
                className="mt-4"
                onClick={() => managerSettings.addUserRole({
                  id: Date.now(),
                  name: "New Role",
                  permissions: ["view"]
                })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                Run System Diagnostics
              </Button>
              <Button className="w-full" variant="outline">
                Calibrate Sensors
              </Button>
              <Separator />
              <Button className="w-full" variant="destructive">
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProductionScheduleDialog
        isOpen={isProductionDialogOpen}
        onClose={() => setIsProductionDialogOpen(false)}
        onSave={addProductionSchedule}
        numberOfTanks={settings.numberOfTanks}
      />

      <CleaningScheduleDialog
        isOpen={isCleaningDialogOpen}
        onClose={() => setIsCleaningDialogOpen(false)}
        onSave={addCleaningSchedule}
        numberOfTanks={settings.numberOfTanks}
      />
    </div>
  )
}