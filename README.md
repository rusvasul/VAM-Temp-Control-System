# Vam Tank Control

Vam Tank Control is an advanced system designed to monitor and control the temperature of fermentation tanks in a brewing environment. It features real-time temperature monitoring, automated solenoid valve control, and a web interface for remote access and management. The system ensures the safety and efficiency of the brewing process by preventing simultaneous heating and cooling operations and providing automated alarm notifications for temperature deviations.

## Overview

### System Architecture Requirements

The system is composed of the following core components:
- 9 fermentation tanks with individual temperature monitoring.
- 1 central chiller system.
- 1 central heating system.
- Common header distribution system.
- Individual solenoid valves for each tank.
- Hot/cold interlock safety system.
- Database for historical data.
- Web interface for monitoring and control.

### Control System Requirements

- **Temperature Control**: All tanks operate in the same mode (either heating or cooling). Each tank has individual temperature monitoring and control with automated solenoid valve control. A safety interlock prevents simultaneous heating and cooling operations.
- **Automation Features**: Real-time temperature monitoring, remote access capability, automated alarm notifications, and recipe management.

### Database Requirements

- **Data Collection**: Collects temperature readings, equipment status, alarm history, recipe, batch information, and system events.
- **Data Management**: Centralized database structure with regular backups and data retention policies.

### Web Interface Requirements

- **User Interface Features**: Real-time system overview, individual tank control, temperature trending displays, equipment status visualization, alarm management, and mobile-responsive design.
- **Security Requirements**: User authentication, role-based access control, secure communication protocols, and audit trails.

### Implementation Recommendations

- **Control Platform Options**: Industrial PLC with HMI, Ignition SCADA platform, web-based control system using modern frameworks, and integration with standard industrial protocols.
- **Development Considerations**: Proper data validation, error handling, scalability, comprehensive documentation, operator training, and regular system backups.

### Technologies Used

- **Frontend**: Vite-based React app located in the `client/` folder, running on port 5173.
- **Backend**: Express app located in the `server/` folder, running on port 3000.
- **Database**: MongoDB for storing historical data and system status.
- **Concurrent Execution**: Uses `concurrently` to run both client and server together.

## Features

- Real-time temperature monitoring and logging.
- Remote access for monitoring and control.
- Automated alarm notifications for temperature deviations.
- Recipe management and process parameter storage.
- User-friendly web interface with mobile responsiveness.
- Secure user authentication and role-based access control.

## Getting Started

### Requirements

- Node.js (version 14.x or higher)
- npm (version 6.x or higher)
- MongoDB (version 4.x or higher)

### Quickstart

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vam-tank-control.git
   cd vam-tank-control
   ```

2. **Install dependencies for the frontend**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Install dependencies for the backend**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**
   - Create a `.env` file in the `server` directory with the following content:
     ```
     PORT=3000
     DATABASE_URL=mongodb://localhost:27017/vam-tank-control
     SESSION_SECRET=your_secret_key
     ```

5. **Run the application**
   ```bash
   npm run start
   ```

   This command uses `concurrently` to run both the frontend and backend servers.

6. **Access the application**
   - Frontend: Open your browser and navigate to `http://localhost:5173`.
   - Backend: API endpoints are available at `http://localhost:3000`.

### License

The project is proprietary (not open source).

```
Copyright (c) 2024.
```