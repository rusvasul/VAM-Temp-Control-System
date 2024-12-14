# Testing Instructions for Temperature History API

## Windows (PowerShell)

### Step #1: Record a temperature reading
Open PowerShell and paste the following command:
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/tanks/1/temperature" -Headers @{"Content-Type"="application/json"} -Body '{"temperature": 68.5}'
```

### Step #2: Get all temperature history
In the same PowerShell window, paste this command:
```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/tanks/1/temperature-history"
```

### Step #3: Get temperature history for a specific date range
Now, paste this command:
```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/tanks/1/temperature-history?start=2023-05-01T00:00:00Z&end=2023-05-02T00:00:00Z"
```

## Unix-based Systems (bash)

### Step #1: Record a temperature reading
Open a terminal and paste the following command:
```bash
curl -X POST http://localhost:3000/api/tanks/1/temperature -H "Content-Type: application/json" -d '{"temperature": 68.5}'
```

### Step #2: Get all temperature history
In the same terminal, paste this command:
```bash
curl http://localhost:3000/api/tanks/1/temperature-history
```

### Step #3: Get temperature history for a specific date range
Now, paste this command:
```bash
curl "http://localhost:3000/api/tanks/1/temperature-history?start=2023-05-01T00:00:00Z&end=2023-05-02T00:00:00Z"
```

## Expected Responses

### Step #1 Response
The API should respond with a JSON object containing the recorded temperature reading:
```json
{
  "tankId": "1",
  "temperature": 68.5,
  "timestamp": "2023-12-14T13:14:33.159Z"
}
```

### Step #2 Response
The API should respond with a JSON array containing all temperature readings for the tank:
```json
{
  "history": [
    {
      "tankId": "1",
      "temperature": 68.5,
      "timestamp": "2023-12-14T13:14:33.159Z"
    },
    // ... additional readings
  ]
}
```

### Step #3 Response
The API should respond with a JSON array containing temperature readings within the specified date range:
```json
{
  "history": [
    {
      "tankId": "1",
      "temperature": 68.5,
      "timestamp": "2023-05-01T12:00:00Z"
    },
    // ... additional readings within date range
  ]
}
```