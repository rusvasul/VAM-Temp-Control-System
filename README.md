# VAM Tank Control System

A web-based monitoring and control system for brewery tank management.

## Supported Operating Systems

This application can be deployed on:
- Windows 10/11
- macOS 10.15 (Catalina) or later
- Linux (Ubuntu 20.04 LTS or later recommended)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (version 16 or higher)
   - Windows: Download installer from https://nodejs.org/
   - macOS: Use Homebrew: `brew install node`
   - Linux: Use apt: `sudo apt install nodejs npm`
   - To verify installation, open a terminal/command prompt and run:
     ```bash
     node --version
     ```

2. **MongoDB** (version 4.4 or higher)
   - Windows: 
     - Download MSI installer from https://www.mongodb.com/try/download/community
     - Install as a service when prompted
   - macOS:
     - Use Homebrew: `brew tap mongodb/brew && brew install mongodb-community`
     - Start service: `brew services start mongodb-community`
   - Linux:
     ```bash
     sudo apt update
     sudo apt install mongodb
     sudo systemctl start mongodb
     ```
   - To verify installation, open a terminal/command prompt and run:
     ```bash
     mongod --version
     ```

3. **Git** (for cloning the repository)
   - Windows: Download from https://git-scm.com/download/win
   - macOS: Included with Xcode Command Line Tools or `brew install git`
   - Linux: `sudo apt install git`

## Installation Steps

### 1. Clone the Repository

1. Open a terminal/command prompt
   - Windows: Use PowerShell or Command Prompt
   - macOS/Linux: Use Terminal
2. Navigate to where you want to install the application
3. Run the following commands:
   ```bash
   git clone [repository-url]
   cd vam-tank-control
   ```

### 2. Set Up the Server

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install server dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory:
   - Windows (PowerShell):
     ```powershell
     New-Item .env -Type File
     Add-Content .env "PORT=3001`nDATABASE_URL=mongodb://localhost:27017/vam-tank-control`nSESSION_SECRET=your-secret-key-here`nNODE_ENV=development"
     ```
   - macOS/Linux:
     ```bash
     echo "PORT=3001
     DATABASE_URL=mongodb://localhost:27017/vam-tank-control
     SESSION_SECRET=your-secret-key-here
     NODE_ENV=development" > .env
     ```
   Replace `your-secret-key-here` with a random string of characters

### 3. Set Up the Client

1. Open a new terminal/command prompt
2. Navigate to the client directory:
   ```bash
   cd client
   ```

3. Install client dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the client directory:
   - Windows (PowerShell):
     ```powershell
     New-Item .env -Type File
     Add-Content .env "VITE_API_URL=http://localhost:3001"
     ```
   - macOS/Linux:
     ```bash
     echo "VITE_API_URL=http://localhost:3001" > .env
     ```

## Running the Application

### 1. Start MongoDB

1. Open a terminal/command prompt
2. Start MongoDB:
   - Windows:
     - MongoDB should be running as a service
     - To check status: `Get-Service MongoDB`
     - To start manually: `"C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe"`
   - macOS:
     ```bash
     brew services start mongodb-community
     ```
   - Linux:
     ```bash
     sudo systemctl start mongodb
     ```

### 2. Start the Server

1. Open a terminal/command prompt
2. Navigate to the server directory
3. Run:
   ```bash
   npm run dev
   ```
4. You should see: "Server is listening on port 3001"

### 3. Start the Client

1. Open another terminal/command prompt
2. Navigate to the client directory
3. Run:
   ```bash
   npm run dev
   ```
4. You should see a URL like: `http://localhost:5173`

### 4. Access the Application

1. Open your web browser (Chrome or Firefox recommended)
2. Go to: `http://localhost:5173`
3. You should see the login page

## Initial Setup

### Create First Admin User

1. Access the application in your browser
2. Click "Register"
3. Fill in the registration form:
   - Email: [your-email]
   - Password: [your-password]
4. Log in with your credentials

## Common Issues and Solutions

### MongoDB Connection Issues

If you see "Failed to connect to database":
1. Verify MongoDB is running
2. Check your DATABASE_URL in `.env`
3. Ensure MongoDB is installed correctly

### Server Won't Start

If you see "Port already in use":
1. Check if another application is using port 3001
2. Change the PORT in server `.env` file
3. Update client `.env` VITE_API_URL to match

### Client Can't Connect to Server

If you see "Failed to fetch" errors:
1. Verify the server is running
2. Check VITE_API_URL in client `.env`
3. Ensure both client and server ports match your configuration

## Monitoring and Maintenance

### Logs

- Server logs are in the terminal running the server
- Client logs are in the browser's developer tools (F12 > Console)

### Updating

To update the application:
1. Stop both client and server (Ctrl+C in terminals)
2. Pull latest changes:
   ```bash
   git pull
   ```
3. Install any new dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
4. Restart both client and server

## Security Considerations

1. Change the SESSION_SECRET in production
2. Use HTTPS in production
3. Regularly update dependencies:
   ```bash
   npm audit
   npm audit fix
   ```

## Production Deployment

For production deployment, additional steps are required:

1. Set NODE_ENV=production in server `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server/index.js
   ```
3. Set up NGINX or Apache as a reverse proxy
4. Configure SSL/TLS certificates
5. Set up proper MongoDB authentication
6. Configure regular backups

## Support

For additional help:
1. Check the logs in both terminals
2. Review the documentation
3. Contact system administrator

## License

[Your License Information Here]