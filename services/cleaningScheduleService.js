import api from '../client/src/api/api';

export const cleaningScheduleService = {
  async createSchedule(scheduleData) {
    const response = await api.post('/cleaning-schedules', scheduleData);
    return response.data;
  },

  async getAllSchedules() {
    const response = await api.get('/cleaning-schedules');
    return response.data;
  },

  async updateSchedule(id, scheduleData) {
    const response = await api.put(`/cleaning-schedules/${id}`, scheduleData);
    return response.data;
  },

  async deleteSchedule(id) {
    const response = await api.delete(`/cleaning-schedules/${id}`);
    return response.data;
  },

  async getScheduleByTankId(tankId) {
    const response = await api.get(`/cleaning-schedules/tank/${tankId}`);
    return response.data;
  },
}; 