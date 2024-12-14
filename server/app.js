const cleaningScheduleRoutes = require('./routes/cleaningSchedules');
const productionSchedulesRouter = require('./routes/productionSchedules');

// ... other middleware
app.use('/api/cleaning-schedules', cleaningScheduleRoutes);
app.use('/api/production-schedules', productionSchedulesRouter);