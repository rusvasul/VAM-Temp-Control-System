const express = require('express');
const app = express();
const cleaningScheduleRoutes = require('./routes/cleaningScheduleRoutes');

// ... other middleware
app.use('/api/cleaning-schedules', cleaningScheduleRoutes);

// ... other imports

// ... other middleware

app.listen(3000, () => {
  console.log('Server is running on port 3000');
}); 