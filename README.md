# Hack For Hope - MERN Stack Project

A minimal MERN stack application for the Hack For Hope hackathon.

## Project Structure

```
SOS_SupBots_HackForHope/
├── frontend/          # React + Vite frontend
└── backend/           # Express + MongoDB backend
```

## Quick Start

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Update `.env` file with your MongoDB connection string

4. Seed the database (first time only):
```bash
npm run seed
```
This creates 4 test villages (Gammarth, Siliana, Mahres, Akouda) and admin accounts.

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

**To add new users (admin only):**
```bash
npm run adduser
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Features

- **Authentication**: JWT-based auth with role-based access control (LEVEL1, LEVEL2, LEVEL3)
- **No Public Registration**: All accounts created by administrators only
- **User Roles**: Level 1 (Terrain Users), Level 2 (Psychologists/Social Workers), Level 3 (Directors/National Office)
- **Signalement Management**: CRUD operations for incident reports with file uploads
- **Workflow System**: Structured 7-stage process for Level 2 users
- **Analytics**: Comprehensive dashboard with heatmaps for Level 3 users

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Axios

### Backend
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for password hashing

## API Endpoints

### Auth
- `POST /api/auth/login` - Login user (registration disabled for security)

### Signalement
- `GET /api/signalement` - Get all signalements (filtered by user role)
- `POST /api/signalement` - Create new signalement with file uploads
- `PUT /api/signalement/:id` - Update signalement (Level 2+)
- `DELETE /api/signalement/:id` - Delete signalement (Level 3)

### Workflow (Level 2+)
- `GET /api/workflow/my-workflows` - Get assigned workflows
- `POST /api/workflow` - Create workflow for signalement
- `PUT /api/workflow/:id/stage` - Update workflow stage
- `POST /api/workflow/:id/generate-dpe` - Generate DPE report with AI

### Analytics (Level 3)
- `GET /api/analytics` - Get analytics (Level 3 only)
- `GET /api/analytics/heatmap` - Get heatmap data for visualization
- `GET /api/analytics/village-ratings` - Get village performance ratings

## Database Models

### User
- name, email, password, role (1, 2, or 3)

### Signalement
- title, description, location, status, createdBy

## Notes

- Make sure MongoDB is running before starting the backend
- Update the JWT_SECRET in `.env` for production
- All API routes (except auth/login) require authentication
- **No public registration** - all accounts must be created by administrators via `npm run seed` or `npm run adduser`

## Test Accounts (After Running `npm run seed`)

- **Level 3 (National Office)**: `admin@sos.tn` / `admin123`
- **Level 2 (Psychologist)**: `psy@sos.tn` / `psy123`
- **Level 1 (SOS Mother)**: `fatma@sos.tn` / `fatma123`
- **Level 1 (Educator)**: `ahmed@sos.tn` / `ahmed123`
