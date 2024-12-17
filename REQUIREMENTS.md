# Vam Tank Control

Vam Tank Control is a comprehensive system designed for managing and monitoring fermentation tanks in a brewing environment. The system provides real-time temperature control, historical data logging, and a web interface for remote access and management. It integrates various components such as fermentation tanks, a central chiller and heating system, solenoid valves, and a database for data storage.

## Overview

### System Architecture Requirements

**Core Components**
- 9 fermentation tanks with individual temperature monitoring
- 1 central chiller system
- 1 central heating system
- Common header distribution system
- Individual solenoid valves for each tank
- Hot/cold interlock safety system
- Database for historical data
- Web interface for monitoring and control

### Control System Requirements

**Temperature Control**
- All tanks must operate in the same mode (either heating or cooling)
- Each tank requires individual temperature monitoring and control
- Automated solenoid valve control for each tank
- Safety interlock to prevent simultaneous heating and cooling operation

**Automation Features**
- Real-time temperature monitoring and logging
- Remote access capability for monitoring and control
- Automated alarm notifications for temperature deviations
- Recipe management and process parameter storage

### Database Requirements

**Data Collection**
- Temperature readings from all tanks
- Equipment status (valves, heater, chiller)
- Alarm history
- Recipe and batch information
- System events and operator actions

**Data Management**
- Centralized database structure
- Regular data backup procedures
- Data retention policies
- Performance trending capabilities

### Web Interface Requirements

**User Interface Features**
- Real-time system overview dashboard
- Individual tank control and monitoring
- Temperature trending displays
- Equipment status visualization
- Alarm management interface
- Mobile-responsive design

**Security Requirements**
- User authentication and authorization
- Role-based access control
- Secure communication protocols
- Audit trail of user actions

### Implementation Recommendations

**Control Platform Options**
- Industrial PLC with HMI system
- Ignition SCADA platform (maker edition for cost-effectiveness)
- Web-based control system using modern frameworks
- Integration with standard industrial protocols (Modbus, MQTT)

**Development Considerations**
- Implement proper data validation and error handling
- Design for scalability and future expansion
- Include comprehensive system documentation
- Provide operator training materials
- Regular system backup procedures

### Project Structure

The project is divided into two main parts:

**1. Frontend**
- Located in the `client/` folder
- Uses Vite and React
- Runs on port 5173 for user testing

**2. Backend**
- Located in the `server/` folder
- Uses Express
- Runs on port 3001

Concurrently is used to run both client and server together with a single command (`npm run start`).

## Features

- **Real-time Monitoring:** Monitor the temperature and status of each fermentation tank in real-time.
- **Remote Control:** Access and control the system remotely via a web interface.
- **Automated Alarms:** Receive notifications for any deviations in temperature or system errors.
- **Historical Data Logging:** Log and review historical data for temperature, system events, and operator actions.
- **Recipe Management:** Store and manage brewing recipes and process parameters.
- **Role-based Access Control:** Secure access with user authentication and authorization.
- **Mobile-responsive Design:** Access the system on various devices with a responsive web interface. 