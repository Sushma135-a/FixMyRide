# FixMyRide – Car Service Booking System

FixMyRide is a full-stack web application that helps users book vehicle servicing online. It uses Angular for the frontend and Spring Boot for the backend.

## Features

- User registration and login
- Vehicle service booking
- Service and booking management
- REST API integration between frontend and backend

*Only describe features that are implemented and working in your current application.*

## Technologies Used

**Frontend:** Angular, TypeScript, HTML, CSS

**Backend:** Java, Spring Boot, Spring Data JPA, REST APIs

**Database:** MySQL

## Project Structure

```text
FixMyRide/
├── frontend/    # Angular frontend application
├── backend/     # Spring Boot backend application
└── README.md
```

## Prerequisites

- Node.js and npm
- Angular CLI compatible with the project
- Java JDK
- Maven
- MySQL

## How to Run the Frontend

Open a terminal in the project folder and run:

```bash
cd frontend
npm install
npm start
```

## How to Run the Backend

Ensure MySQL is running and your database connection settings are configured.

Set the database environment variables in PowerShell:

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = Read-Host "Enter your MySQL password"
```

Then open a separate terminal and run:

```powershell
cd backend
mvn spring-boot:run
```

Keep the backend terminal open while using the application. Configure the frontend API URL or proxy to match the backend settings.

## Future Improvements

- Improve validation and error handling
- Add automated tests
- Enhance responsive design and accessibility

## Author

**Sushma H M**

- GitHub: https://github.com/Sushma135-a
- LinkedIn: https://linkedin.com/in/sushma-h-m-306b8532a
