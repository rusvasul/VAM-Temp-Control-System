import React, { useState } from 'react';
import { cleaningScheduleService } from '../services/cleaningScheduleService';

const AddSchedule = () => {
  const [schedule, setSchedule] = useState({
    tankId: '',
    schedule: 'Weekly',
    lastCleaning: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await cleaningScheduleService.createSchedule(schedule);
      window.location.href = '/settings';
    } catch (error) {
      setError('Failed to create schedule');
      console.error('Error creating schedule:', error);
    }
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Add Cleaning Schedule</h2>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-schedule-form">
        <div className="form-group">
          <label>Tank ID</label>
          <input
            type="text"
            value={schedule.tankId}
            onChange={(e) => setSchedule({...schedule, tankId: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Frequency</label>
          <select
            value={schedule.schedule}
            onChange={(e) => setSchedule({...schedule, schedule: e.target.value})}
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Biweekly">Biweekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        <div className="form-group">
          <label>Last Cleaning Date</label>
          <input
            type="date"
            value={schedule.lastCleaning}
            onChange={(e) => setSchedule({...schedule, lastCleaning: e.target.value})}
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => window.location.href = '/settings'}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Save Schedule
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSchedule; 