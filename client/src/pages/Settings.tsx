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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { getCurrentUser, updateProfile, changePassword, updatePreferences, User } from "@/api/users"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export function Settings() {
  const { temperatureUnit, refreshRate, numberOfTanks, updateSettings, isLoading: settingsLoading } = useSettings();
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [formData, setFormData] = useState<SettingsType>({
    temperatureUnit,
    refreshRate,
    numberOfTanks
  });

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await getCurrentUser();
        setUserProfile(userData);
      } catch (error) {
        console.error('Error loading user profile:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive"
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [toast]);

  // Update form data when settings change
  useEffect(() => {
    setFormData({
      temperatureUnit,
      refreshRate,
      numberOfTanks
    });
  }, [temperatureUnit, refreshRate, numberOfTanks]);

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

  const handleProfileSubmit = async () => {
    if (!userProfile) return;

    setIsSavingProfile(true);
    try {
      const updatedUser = await updateProfile({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phoneNumber: userProfile.phoneNumber,
        position: userProfile.position,
        department: userProfile.department
      });
      setUserProfile(updatedUser);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast({
        title: "Success",
        description: "Password changed successfully"
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive"
      });
    }
  };

  const handlePreferencesSubmit = async () => {
    if (!userProfile) return;

    try {
      const updatedUser = await updatePreferences({
        notifications: userProfile.preferences.notifications,
        theme: userProfile.preferences.theme,
        dashboardLayout: userProfile.preferences.dashboardLayout
      });
      setUserProfile(updatedUser);
      toast({
        title: "Success",
        description: "Preferences updated successfully"
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive"
      });
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center justify-between">
                  Profile Information
                  <Button onClick={handleProfileSubmit} disabled={isSavingProfile}>
                    {isSavingProfile ? (
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
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={userProfile?.firstName || ''}
                      onChange={(e) => setUserProfile(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={userProfile?.lastName || ''}
                      onChange={(e) => setUserProfile(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={userProfile?.email || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={userProfile?.phoneNumber || ''}
                      onChange={(e) => setUserProfile(prev => prev ? { ...prev, phoneNumber: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      value={userProfile?.position || ''}
                      onChange={(e) => setUserProfile(prev => prev ? { ...prev, position: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      value={userProfile?.department || ''}
                      onChange={(e) => setUserProfile(prev => prev ? { ...prev, department: e.target.value } : null)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handlePasswordSubmit}>Change Password</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center justify-between">
                  Preferences
                  <Button onClick={handlePreferencesSubmit}>Save Preferences</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label>Email Notifications</Label>
                          <Switch
                            checked={userProfile?.preferences.notifications.email.enabled}
                            onCheckedChange={(checked) => setUserProfile(prev => prev ? {
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                notifications: {
                                  ...prev.preferences.notifications,
                                  email: {
                                    ...prev.preferences.notifications.email,
                                    enabled: checked
                                  }
                                }
                              }
                            } : null)}
                          />
                        </div>
                        {userProfile?.preferences.notifications.email.enabled && (
                          <div className="mt-2 space-y-2">
                            {['system', 'alarms', 'schedules', 'maintenance'].map((type) => (
                              <div key={type} className="flex items-center space-x-2">
                                <Switch
                                  checked={userProfile.preferences.notifications.email.types.includes(type)}
                                  onCheckedChange={(checked) => {
                                    const types = checked
                                      ? [...userProfile.preferences.notifications.email.types, type]
                                      : userProfile.preferences.notifications.email.types.filter(t => t !== type);
                                    setUserProfile(prev => prev ? {
                                      ...prev,
                                      preferences: {
                                        ...prev.preferences,
                                        notifications: {
                                          ...prev.preferences.notifications,
                                          email: {
                                            ...prev.preferences.notifications.email,
                                            types
                                          }
                                        }
                                      }
                                    } : null);
                                  }}
                                />
                                <Label>{type.charAt(0).toUpperCase() + type.slice(1)}</Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <Label>Push Notifications</Label>
                          <Switch
                            checked={userProfile?.preferences.notifications.push.enabled}
                            onCheckedChange={(checked) => setUserProfile(prev => prev ? {
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                notifications: {
                                  ...prev.preferences.notifications,
                                  push: {
                                    ...prev.preferences.notifications.push,
                                    enabled: checked
                                  }
                                }
                              }
                            } : null)}
                          />
                        </div>
                        {userProfile?.preferences.notifications.push.enabled && (
                          <div className="mt-2 space-y-2">
                            {['system', 'alarms', 'schedules', 'maintenance'].map((type) => (
                              <div key={type} className="flex items-center space-x-2">
                                <Switch
                                  checked={userProfile.preferences.notifications.push.types.includes(type)}
                                  onCheckedChange={(checked) => {
                                    const types = checked
                                      ? [...userProfile.preferences.notifications.push.types, type]
                                      : userProfile.preferences.notifications.push.types.filter(t => t !== type);
                                    setUserProfile(prev => prev ? {
                                      ...prev,
                                      preferences: {
                                        ...prev.preferences,
                                        notifications: {
                                          ...prev.preferences.notifications,
                                          push: {
                                            ...prev.preferences.notifications.push,
                                            types
                                          }
                                        }
                                      }
                                    } : null);
                                  }}
                                />
                                <Label>{type.charAt(0).toUpperCase() + type.slice(1)}</Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Theme</h3>
                    <Select
                      value={userProfile?.preferences.theme}
                      onValueChange={(value: 'light' | 'dark' | 'system') => setUserProfile(prev => prev ? {
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          theme: value
                        }
                      } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

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