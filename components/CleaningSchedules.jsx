import React, { useState, useEffect } from 'react';
import { cleaningScheduleService } from '../services/cleaningScheduleService';

const CleaningSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await cleaningScheduleService.getAllSchedules();
      setSchedules(data);
      setError(null);
    } catch (error) {
      console.error('Error loading schedules:', error);
      setError('Failed to load cleaning schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await cleaningScheduleService.deleteSchedule(id);
      loadSchedules();
    } catch (error) {
      setError('Failed to delete schedule');
      console.error('Error deleting schedule:', error);
    }
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Cleaning Schedules</h2>
        <button className="add-button" onClick={() => window.location.href = '/add-schedule'}>
          <span>Add Schedule</span>
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading schedules...</div>
      ) : schedules.length === 0 ? (
        <div className="no-schedules">No cleaning schedules found</div>
      ) : (
        <div className="schedules-grid">
          {schedules.map((schedule) => (
            <div key={schedule._id} className="schedule-card">
              <div className="schedule-info">
                <div className="info-row">
                  <span className="label">Tank ID:</span>
                  <span className="value">{schedule.tankId}</span>
                </div>
                <div className="info-row">
                  <span className="label">Frequency:</span>
                  <span className="value">{schedule.schedule}</span>
                </div>
                <div className="info-row">
                  <span className="label">Last Cleaned:</span>
                  <span className="value">
                    {new Date(schedule.lastCleaning).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button 
                className="delete-button" 
                onClick={() => handleDelete(schedule._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CleaningSchedules; 