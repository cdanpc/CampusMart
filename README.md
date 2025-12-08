# CampusMart — Campus Marketplace Platform

A full-stack marketplace application for campus communities, built with React (Vite) frontend and Spring Boot backend.

## 📋 Project Structure

```
CampusMart/
├── backend/                    # Spring Boot backend
│   └── CampusMart/
│       └── technominds/       # Main application
├── frontend/                   # React + Vite frontend
├── docs/                       # Project documentation
│   ├── API_ENDPOINTS.md       # API documentation
│   ├── BACKEND_IMPLEMENTATION_GUIDE.md
│   ├── COMPLETION_CHECKLIST.md
│   ├── ERD_SCHEMA.md          # Database schema
│   ├── FRONTEND_INTEGRATION_CHECKLIST.md
│   ├── HANDOFF_PACKAGE.md
│   ├── MESSAGES_IMPLEMENTATION_SUMMARY.md
│   ├── PRODUCTION_DEPLOYMENT.md
│   └── README.md
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- **JDK 17+** (verify with `java -version`)
- **Node.js 18+** and npm (verify with `node -v` and `npm -v`)
- **MySQL Server 8.x** and MySQL Workbench

### Backend Setup

1. **Configure Database**

Edit `backend/CampusMart/technominds/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/campusmart?createDatabaseIfNotExist=true
spring.datasource.username=your_username
spring.datasource.password=your_password
```

2. **Start Backend**
```powershell
cd backend/CampusMart/technominds
.\mvnw.cmd spring-boot:run
```

Backend runs on: **http://localhost:8080**

### Frontend Setup

1. **Install Dependencies**
```powershell
cd frontend
npm install
```

2. **Start Dev Server**
```powershell
npm run dev
```

Frontend runs on: **http://localhost:5173**

## 🔧 Configuration

### Development (Default)
- Works out-of-the-box with default settings
- Auto-creates database tables
- Debug logging enabled
- CORS allows localhost

### Production
Set environment variables to override defaults:

```bash
export DB_URL="jdbc:mysql://your-host:3306/campusmart"
export DB_PASSWORD="your_secure_password"
export JWT_SECRET="your_256bit_secret"
export CORS_ORIGINS="https://your-domain.com"
export DDL_AUTO="validate"
export SQL_INIT_MODE="never"
export LOG_LEVEL_APP="INFO"
```

See `docs/PRODUCTION_DEPLOYMENT.md` for complete deployment guide.

## 📚 Documentation

- **[API Endpoints](docs/API_ENDPOINTS.md)** - Complete API reference
- **[Database Schema](docs/ERD_SCHEMA.md)** - Entity relationship diagram
- **[Production Deployment](docs/PRODUCTION_DEPLOYMENT.md)** - Deployment guide
- **[Completion Status](docs/COMPLETION_CHECKLIST.md)** - Project completion status

## ✨ Features

### Core Features
- ✅ User authentication (JWT)
- ✅ Product listings (buy/sell/trade)
- ✅ Order management
- ✅ Direct messaging with image support
- ✅ Trade offer system
- ✅ Reviews & ratings
- ✅ Notifications
- ✅ User profiles with image upload

### Technical Features
- ✅ RESTful API
- ✅ JWT authentication
- ✅ File upload support
- ✅ Environment-based configuration
- ✅ CORS configuration
- ✅ Connection pooling (HikariCP)
- ✅ Responsive UI
- ✅ Modern React with hooks

## 🛠️ Technology Stack

### Backend
- **Spring Boot 4.0.0**
- **MySQL 8.0.43**
- **Hibernate 7.1.8**
- **JWT (HS256)**
- **Maven**

### Frontend
- **React 18**
- **Vite 6**
- **React Router 7**
- **Axios**
- **React Icons**

## 🧪 Testing

See integration testing checklist in `docs/COMPLETION_CHECKLIST.md`

## 📝 License

This project is part of an academic requirement.

## 👥 Contributors

- Development Team: TechnoMinds
- Institution: CIT University
