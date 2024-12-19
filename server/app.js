const cleaningScheduleRoutes = require('./routes/cleaningSchedules');
const productionSchedulesRouter = require('./routes/productionSchedules');
const systemRoutes = require('./routes/systemRoutes');
const userRoutes = require('./routes/userRoutes');
const alarmRoutes = require('./routes/alarmRoutes');

// ... other middleware
app.use('/api/cleaning-schedules', cleaningScheduleRoutes);
app.use('/api/production-schedules', productionSchedulesRouter);
app.use('/api/system', systemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alarms', alarmRoutes);