### CF Coach Backend ( [CF-Coach](https://cfcoach.web.app) )
[![Live Demo](https://img.shields.io/badge/live-cfcoach.web.app-blue?style=flat-square)](https://cfcoach.web.app)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

Yet another simple student performance managing platform with AI coach for guiding and feedback.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Codeforces Integration](#codeforces-integration)
- [Error Handling](#error-handling)
- [Contributing](#contributing)

## Features
- **Student Management**: Teachers can create, update, retrieve, and delete student profiles.
- **Codeforces Integration**: Fetches user info, ratings, and submission status from the Codeforces API.
- **Authentication**: Secure teacher authentication (assumed to be implemented in `authRoutes`).
- **Email Notifications**: Sends profile access links to students via Nodemailer.
- **Profile Tokens**: Generates unique tokens for secure student profile access without authentication.

## Tech Stack
- **Node.js**: Runtime environment.
- **Express.js**: Web framework for API routing.
- **MongoDB/Mongoose**: Database and ODM for data persistence.
- **Nodemailer**: Email notification system.
- **Axios**: HTTP client for Codeforces API requests.
- **TypeScript**: Type-safe JavaScript for better maintainability.
- **Crypto**: Generates secure profile tokens.
- **dotenv**: Environment variable management.

## Setup and Installation
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd code-coach-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and configure the required variables (see [Environment Variables](#environment-variables)).

4. **Run the application**:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000` (or the configured `PORT`).

5. **Development mode**:
   Use `npm run dev` with `nodemon` for auto-reloading during development.

## Environment Variables
Create a `.env` file with the following variables:
```
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
EMAIL_USER=<your-gmail-address>
EMAIL_PASS=<your-gmail-app-password>
FRONTEND_URL=<your-frontend-base-url>
```

- `PORT`: The port for the Express server.
- `MONGO_URI`: MongoDB connection string (e.g., `mongodb://localhost:27017/code-coach`).
- `EMAIL_USER`: Gmail address for sending emails.
- `EMAIL_PASS`: Gmail app-specific password (not your regular password).
- `FRONTEND_URL`: Base URL of the frontend application (e.g., `http://localhost:3000`).

## API Endpoints
### Authentication Routes (`/api/auth`)
- Implementation details assumed to be in `authRoutes`. Typically includes login, registration, and JWT-based authentication.

### Student Routes (`/api/students`)
- **POST /api/students**: Create a new student.
  - Request Body: `{ name: string, email: string, codeforcesHandle: string }`
  - Authentication: Required (teacher JWT).
  - Response: `201` with student object or `400`/`401` on error.
- **GET /api/students**: Retrieve all students for the authenticated teacher.
  - Authentication: Required.
  - Response: `200` with array of students or `401` on error.
- **GET /api/students/:id**: Retrieve a specific student by ID.
  - Authentication: Required.
  - Response: `200` with student object or `404`/`401` on error.
- **PUT /api/students/:id**: Update a student’s details.
  - Request Body: `{ name: string, email: string, codeforcesHandle: string }`
  - Authentication: Required.
  - Response: `200` with updated student or `404`/`401` on error.
- **DELETE /api/students/:id**: Delete a student.
  - Authentication: Required.
  - Response: `200` with success message or `404`/`401` on error.
- **GET /api/students/token/:token**: Retrieve a student by profile token (no authentication required).
  - Response: `200` with student object or `404` on invalid token.

### Sync Routes (`/api/sync`)
- **POST /api/sync**: Trigger Codeforces data sync for a student.
  - Request Body: `{ studentId: string }`
  - Authentication: Required.
  - Response: `200` with success message or `401`/`500` on error.

## Database Schema
### Student Schema (`Student` model)
- `name`: String, required – Student’s name.
- `email`: String, required – Student’s email address.
- `codeforcesHandle`: String, required – Codeforces username.
- `teacherId`: ObjectId, required – Reference to the teacher.
- `profileToken`: String, required – Unique token for profile access.

### Teacher Schema (`Teacher` model, assumed)
- `name`: String, required – Teacher’s name.
- Other fields (e.g., email, password) assumed to be defined in `authRoutes`.

## Codeforces Integration
The backend integrates with the Codeforces API to fetch:
- **User Info**: Via `/user.info?handles=<handle>` (`fetchUserInfo`).
- **User Rating**: Via `/user.rating?handle=<handle>` (`fetchUserRating`).
- **User Status**: Via `/user.status?handle=<handle>&from=<number>&count=<number>` (`fetchUserStatus`).

The `syncCodeforcesData` utility (assumed in `./utils/codeforcesSync`) handles data synchronization for a student’s Codeforces handle. It is triggered:
- Automatically on student creation.
- Manually via the `/api/sync` endpoint.

## Error Handling
- **400**: Bad request (e.g., missing required fields).
- **401**: Unauthorized (e.g., missing or invalid teacher ID).
- **404**: Resource not found (e.g., student not found).
- **500**: Server error with detailed error message logged to console.

All endpoints use try-catch blocks to handle errors gracefully, returning JSON responses with a `message` and `error` (if applicable).

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request with a detailed description.
