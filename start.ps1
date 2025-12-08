# CampusMart Startup Script
# Starts both backend and frontend servers

Write-Host "Starting CampusMart..." -ForegroundColor Green

# Start Backend in new window
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\barit\CampusMart\backend\CampusMart\technominds'; .\mvnw.cmd spring-boot:run"

# Wait a bit for backend to initialize
Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\barit\CampusMart\frontend'; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "CampusMart is starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8080" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the servers" -ForegroundColor Gray
