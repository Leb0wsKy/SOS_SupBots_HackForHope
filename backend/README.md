# Hack For Hope - Backend API

Backend API for SOS Villages d'Enfants Tunisia incident reporting platform.

## 🎯 Features

### Core Functionality
- **3-Level Role-Based Access Control** (LEVEL1, LEVEL2, LEVEL3)
- **Anonymous & Authenticated Reporting**
- **File Upload Support** (images, audio, video, PDF)
- **Structured Workflow Management**
- **AI-Powered Fraud Detection** (placeholder for local NLP model)
- **Real-time Notifications** (Socket.IO ready)
- **Comprehensive Analytics & Heatmaps**
- **Village Management & Ratings**
- **Complete Audit Logging**

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── models/
│   │   ├── User.js                  # User with LEVEL1/2/3 roles
│   │   ├── Signalement.js           # Incident reports with full lifecycle
│   │   ├── Village.js               # SOS Villages
│   │   ├── Workflow.js              # 7-stage workflow process
│   │   └── AuditLog.js              # Security audit trails
│   ├── controllers/
│   │   ├── authController.js        # Authentication & registration
│   │   ├── signalementController.js # Incident CRUD + AI detection
│   │   ├── workflowController.js    # Level 2 workflow management
│   │   ├── villageController.js     # Village management
│   │   └── analyticsController.js   # Statistics, heatmaps, ratings
│   ├── routes/
│   │   ├── auth.js
│   │   ├── signalement.js
│   │   ├── workflow.js
│   │   ├── village.js
│   │   └── analytics.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication
│   │   ├── roles.js                 # Role-based access control
│   │   ├── upload.js                # Multer file uploads
│   │   └── auditLog.js              # Automatic audit logging
│   └── server.js                    # Express server setup
├── uploads/                         # File storage
├── .env                             # Environment variables
├── .gitignore
└── package.json
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hack-for-hope
JWT_SECRET=your_secure_jwt_secret_change_in_production
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running locally or update `MONGODB_URI` with your connection string.

### 4. Seed the Database (Required for First Run)

```bash
npm run seed
```

This creates:
- 4 SOS Villages (Gammarth, Siliana, Mahres, Akouda)
- 4 Test User Accounts (see below)

**Test Accounts:**
- `admin@sos.tn` / `admin123` (LEVEL3 - National Office)
- `psy@sos.tn` / `psy123` (LEVEL2 - Psychologist)
- `fatma@sos.tn` / `fatma123` (LEVEL1 - SOS Mother)
- `ahmed@sos.tn` / `ahmed123` (LEVEL1 - Educator)

### 5. Add New Users (Administrator Only)

```bash
npm run adduser
```

Interactive CLI tool to add new users. Only administrators with database access can run this.

### 6. Run the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/login` | Login user | Public |

> **Note:** Registration is disabled for security. All accounts must be created by administrators directly in the database using the seed script or MongoDB.

### Signalement - Incident Reports (`/api/signalement`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create signalement (with file uploads) | LEVEL1+ |
| GET | `/` | Get all signalements (filtered by role) | All authenticated |
| GET | `/:id` | Get signalement by ID | All authenticated |
| PUT | `/:id` | Update signalement | LEVEL2+ |
| PUT | `/:id/assign` | Assign to Level 2 user | LEVEL2+ |
| PUT | `/:id/close` | Close signalement | LEVEL3 |
| PUT | `/:id/archive` | Archive signalement | LEVEL3 |
| DELETE | `/:id` | Delete signalement | LEVEL3 |

### Workflow Management (`/api/workflow`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/my-workflows` | Get my assigned workflows | LEVEL2+ |
| GET | `/:signalementId` | Get workflow by signalement | LEVEL2+ |
| POST | `/` | Create workflow | LEVEL2+ |
| PUT | `/:workflowId/stage` | Update workflow stage | LEVEL2+ |
| POST | `/:workflowId/generate-dpe` | Generate DPE report with AI | LEVEL2+ |
| PUT | `/:workflowId/classify` | Classify signalement | LEVEL2+ |
| POST | `/:workflowId/notes` | Add note to workflow | LEVEL2+ |

### Village Management (`/api/village`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all villages | All authenticated |
| GET | `/:id` | Get village by ID | All authenticated |
| GET | `/:id/statistics` | Get village statistics | All authenticated |
| POST | `/` | Create new village | LEVEL3 |
| PUT | `/:id` | Update village | LEVEL3 |

### Analytics & Reports (`/api/analytics`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Global analytics dashboard | LEVEL3 |
| GET | `/heatmap` | Heatmap data for Tunisia map | LEVEL3 |
| GET | `/village-ratings` | Village performance ratings | LEVEL3 |
| GET | `/export` | Export data (JSON) | LEVEL3 |

## 🔑 User Roles

### LEVEL 1 - Terrain Users (Declarants)
- **Role Details**: SOS_MOTHER, EDUCATOR, FIELD_STAFF
- **Permissions**:
  - Create signalements
  - Upload attachments
  - View signalements from their village

### LEVEL 2 - Psychologists & Social Workers
- **Role Details**: PSYCHOLOGIST, SOCIAL_WORKER
- **Permissions**:
  - All Level 1 permissions
  - Manage workflows
  - Classify signalements
  - Generate DPE reports with AI
  - Update signalement status

### LEVEL 3 - Governance & Decision Makers
- **Role Details**: VILLAGE_DIRECTOR, NATIONAL_OFFICE
- **Permissions**:
  - All Level 2 permissions
  - View global analytics
  - Access heatmaps
  - View village ratings
  - Close and archive signalements
  - Export data
  - Manage villages

## 📊 Database Models

### User
```javascript
{
  name, email, password,
  role: 'LEVEL1' | 'LEVEL2' | 'LEVEL3',
  roleDetails: 'SOS_MOTHER' | 'EDUCATOR' | 'PSYCHOLOGIST' | ...,
  village: ObjectId,
  accessibleVillages: [ObjectId],
  isActive: Boolean
}
```

### Signalement
```javascript
{
  title, description,
  isAnonymous: Boolean,
  createdBy: ObjectId,
  village: ObjectId,
  program: String,
  incidentType: 'SANTE' | 'VIOLENCE_PHYSIQUE' | ...,
  urgencyLevel: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE',
  status: 'EN_ATTENTE' | 'EN_COURS' | 'CLOTURE' | 'FAUX_SIGNALEMENT',
  classification: 'SAUVEGARDE' | 'PRISE_EN_CHARGE' | 'FAUX_SIGNALEMENT',
  attachments: [{ filename, mimeType, path, ... }],
  aiSuspicionScore: Number (0-100),
  aiFlags: [{ flag, confidence }],
  workflow: ObjectId,
  assignedTo, closedBy, archivedBy
}
```

### Workflow
```javascript
{
  signalement: ObjectId,
  assignedTo: ObjectId,
  classification: String,
  stages: {
    initialReport, dpeReport, evaluation, actionPlan,
    followUpReport, finalReport, closureNotice
  },
  currentStage: String,
  status: 'ACTIVE' | 'SUSPENDED' | 'COMPLETED' | 'ARCHIVED',
  notes: [{ content, createdBy, createdAt }]
}
```

### Village
```javascript
{
  name, location, region,
  director: ObjectId,
  programs: [String],
  totalSignalements: Number,
  urgentSignalements: Number,
  falseSignalements: Number,
  ratingScore: Number,
  coordinates: { latitude, longitude }
}
```

### AuditLog
```javascript
{
  user: ObjectId,
  action: 'CREATE_SIGNALEMENT' | 'UPDATE_SIGNALEMENT' | ...,
  targetModel: String,
  targetId: ObjectId,
  details: Object,
  ipAddress: String,
  timestamp: Date
}
```

## 🔒 Security Features

1. **No Public Registration** - All accounts created by administrators only
2. **JWT Authentication** - 7-day token expiry
3. **Bcrypt Password Hashing** - 10 salt rounds
4. **Role-Based Access Control** - Strict middleware enforcement
5. **Audit Logging** - All sensitive actions tracked
6. **File Upload Validation** - Type and size restrictions
7. **Anonymous Reporting** - Privacy protection for Level 1

## 🤖 AI Integration (Placeholder)

### Fraud Detection
- Located in: `signalementController.js` → `calculateAISuspicionScore()`
- Current: Basic keyword detection
- **TODO**: Integrate local NLP model (no cloud APIs)

### DPE Report Generation
- Located in: `workflowController.js` → `generateDPEReport()`
- Current: Template generation
- **TODO**: Integrate local text generation model

## 📈 Analytics & Visualization

### Heatmap Data
Returns coordinates and severity scores for Tunisia map visualization:
```javascript
{
  village, coordinates, signalementCount, 
  urgentCount, severityScore
}
```

### Village Ratings
Algorithm: `(urgent * 2 + faux) / total * 100`
- 0-20: EXCELLENT
- 20-40: BON
- 40-60: MOYEN
- 60-80: ATTENTION
- 80+: CRITIQUE

## 🔧 Development Notes

### File Uploads
- Max file size: 50MB
- Max files per signalement: 5
- Allowed types: JPEG, PNG, MP3, WAV, MP4, MOV, PDF
- Storage: Local filesystem (`/uploads`)

### Real-time Notifications
Socket.IO is installed but not yet implemented. Ready for Level 2 notification system.

## 🐛 Error Handling

All endpoints return consistent error format:
```javascript
{
  message: "Error description",
  error: "Detailed error (dev mode only)"
}
```

## 📝 Next Steps

1. Install dependencies: `npm install`
2. Configure MongoDB connection
3. **Seed initial data: `npm run seed`** (Creates villages and admin accounts)
4. Test authentication flow with seeded accounts
5. Test signalement creation with file upload
6. Add new users via seed script or MongoDB directly
7. Implement AI models (local/open-source)
8. Add Socket.IO real-time notifications

## 🤝 Contributing

This is a hackathon project for SOS Villages d'Enfants Tunisia.

---

**Built with ❤️ for Hack For Hope 2026**
