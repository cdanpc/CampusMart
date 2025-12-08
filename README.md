# CampusMart — Dev Setup (Windows)

This project has a React (Vite) frontend and a Spring Boot (Gradle) backend. Optional: MySQL (use MySQL Workbench to manage your DB).

## Prerequisites
- JDK 17+ (verify with `java -version`)
- Node.js 18+ and npm (verify with `node -v` and `npm -v`)
- MySQL Server 8.x (optional at first) and MySQL Workbench

## Backend configuration
Edit `backend/src/main/resources/application.properties` and set your local MySQL credentials:
```
spring.datasource.url=jdbc:mysql://localhost:3306/campusmart?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=your_username
spring.datasource.password=your_password
```
Hibernate is set to `ddl-auto=update` to auto-create/update tables in dev.

## First run
Open two terminals or use VS Code tasks.

### Using VS Code tasks
- Open Command Palette → "Tasks: Run Task" → `app: start both`.
  - Starts backend (`gradlew.bat bootRun`) and frontend (`npm run dev`).

### Manual commands (PowerShell)
Backend:
```powershell
cd "backend"
.\u005cgradlew.bat bootRun
```
Frontend (in a new terminal):
```powershell
cd "frontend"
npm install
npm run dev
```
- Frontend dev server: http://localhost:5173
- Backend server: http://localhost:8080

A test endpoint is available at `GET http://localhost:8080/api/hello`.
The frontend is set up to call `/api/hello` and display the result.

## CORS & Proxy
- Backend enables CORS for `http://localhost:5173`.
- Vite dev server proxies `/api` → `http://localhost:8080`.

## Troubleshooting
- If the backend fails with MySQL errors, either:
  - Start MySQL; create DB `campusmart` and fix credentials; or
  - Comment out datasource properties to run API-only endpoints.
- If port 5173 or 8080 is in use, stop the other process or change the port.

## Project structure
- `backend/` — Spring Boot app
- `frontend/` — React app (Vite)
