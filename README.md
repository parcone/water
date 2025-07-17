# Water Melting Monitoring System

A comprehensive system for monitoring and managing water melting processes using Vue.js, Spring Boot, and MySQL.

## Project Structure
```
water-melt/
├── frontend/          # Vue.js 3 + Element Plus application (active)
└── backend/           # Spring Boot backend application
    ├── src/
    ├── photos/       # Image storage
    └── pom.xml
```

## Features
- Real-time water melting monitoring
- Temperature and status tracking
- Historical data analysis
- Image processing and storage
- User authentication and authorization
- Interactive dashboards and reports

## Technology Stack
- Frontend:
  - Vue.js 3
  - Vuex
  - Vue Router
  - Element Plus
  - Axios
  - ECharts

- Backend:
  - Spring Boot 3.0
  - Spring Security
  - Spring Data JPA
  - MySQL 8.0
  - JWT Authentication
  - WebSocket

## Getting Started

### Backend Setup
1. Install JDK 17 or later
2. Configure MySQL database
3. Update application.properties with your database credentials
4. Run `mvn spring-boot:run`

### Frontend Setup
1. Install Node.js (v16 or later)
2. Navigate to frontend directory
3. Run `npm install`
4. Run `npm run serve`

> 说明：原先存在 `frontend-vite` 目录的 Vite 版本已删除；请统一在 `frontend` 目录进行开发与构建。

## API Documentation
API documentation is available at `/swagger-ui.html` when running the backend server. 