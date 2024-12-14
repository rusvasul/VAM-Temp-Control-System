import React, { useState, useEffect } from 'react';
import { getCleaningSchedules, createCleaningSchedule, updateCleaningSchedule, deleteCleaningSchedule } from '../api/cleaningSchedules';
import { CleaningScheduleDialog } from './CleaningScheduleDialog';

export function CleaningSchedulesComponent() {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    console.log('CleaningSchedulesComponent mounted, fetching schedules');
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching cleaning schedules');
      const data = await getCleaningSchedules();
      console.log('Received cleaning schedules:', data);
      setSchedules(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cleaning schedules';
      setError(errorMessage);
      console.error('Error fetching cleaning schedules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSchedule = async (schedule) => {
    try {
      console.log('Saving cleaning schedule:', schedule);
      if (schedule.id) {
        console.log('Updating existing schedule');
        await updateCleaningSchedule(schedule.id, schedule);
      } else {
        console.log('Creating new schedule');
        await createCleaningSchedule(schedule);
      }
      console.log('Schedule saved successfully');
      await fetchSchedules();
      setIsDialogOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save cleaning schedule';
      setError(errorMessage);
      console.error('Error saving cleaning schedule:', err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      console.log('Deleting cleaning schedule:', id);
      await deleteCleaningSchedule(id);
      console.log('Schedule deleted successfully');
      await fetchSchedules();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete cleaning schedule';
      setError(errorMessage);
      console.error('Error deleting cleaning schedule:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cleaning Schedules</h2>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Add New Schedule
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="p-4 border rounded-md shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">Tank: {schedule.tankId}</h3>
                <p className="text-gray-600">Schedule: {schedule.schedule}</p>
                <p className="text-gray-600">
                  Last Cleaning: {new Date(schedule.lastCleaning).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => handleDeleteSchedule(schedule.id)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <CleaningScheduleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveSchedule}
        numberOfTanks={10} // This should be dynamically set based on actual number of tanks
      />
    </div>
  );
}