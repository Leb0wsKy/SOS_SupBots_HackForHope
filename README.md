# SOS Villages d'Enfants Tunisia - Signalement Platform

> **Team SupBots** | Hackathon *Hack For Hope 2026*

## 📋 Overview

A comprehensive child-protection incident reporting and management platform built for **SOS Villages d'Enfants Tunisia**. This full-stack application enables:

- **Field Staff (Level 1)**: Report and document incidents with multi-file uploads
- **Specialists (Level 2)**: Investigate cases through a structured 6-stage workflow with AI-assisted report generation
- **Governance (Level 3)**: Monitor analytics, heatmaps, and make high-level decisions
- **Administrators (Level 4)**: Manage users, villages, and system configuration

The system features strict role-based access control, village scoping, real-time notifications, AI-powered DPE generation, and comprehensive audit logging.

---

## 🏗️ Architecture

This project consists of three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                     │
│  React 18 + Vite + Tailwind CSS + Socket.IO Client          │
│               Runs on http://localhost:5173                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (Express)                     │
│  Node.js + Express + MongoDB + Redis + Socket.IO            │
│    JWT Auth + RBAC + File Uploads + Audit Logging           │
│               Runs on http://localhost:5000                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          False Alarm Classifier (Python/Flask)              │
│       Machine Learning API for fraud detection              │
│               Runs on http://localhost:5001                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
SOS/
├── frontend/                           # React Application
│   ├── src/
│   │   ├── pages/                      # Dashboard pages for each role
│   │   │   ├── DashboardLevel1.jsx     # Field Staff Interface
│   │   │   ├── DashboardLevel2.jsx     # Specialists Interface
│   │   │   ├── DashboardLevel3.jsx     # Analytics Dashboard
│   │   │   ├── DashboardLevel4.jsx     # Admin Panel
│   │   │   ├── DashboardDirecteur.jsx  # Village Director View
│   │   │   └── DashboardNational.jsx   # National Office View
│   │   ├── components/                 # Reusable UI components
│   │   ├── services/                   # API client services
│   │   └── App.jsx                     # Main app with routing
│   └── package.json
│
├── backend/                            # Node.js API Server
│   ├── src/
│   │   ├── models/                     # MongoDB Schemas
│   │   │   ├── User.js                 # User accounts (4 levels + role details)
│   │   │   ├── Signalement.js          # Incident reports with embedded workflow
│   │   │   ├── Village.js              # SOS Villages
│   │   │   ├── Workflow.js             # Legacy workflow (deprecated in favor of embedded)
│   │   │   ├── Notification.js         # Real-time notifications
│   │   │   └── AuditLog.js             # Complete audit trail
│   │   ├── controllers/                # Business logic
│   │   │   ├── authController.js       # Authentication
│   │   │   ├── signalementController.js # Incident CRUD
│   │   │   ├── workflowController.js   # 6-stage workflow management
│   │   │   ├── level2Controller.js     # Specialized Level 2 operations
│   │   │   ├── dpeController.js        # AI-powered DPE generation (Ollama)
│   │   │   ├── analyticsController.js  # Statistics & heatmaps
│   │   │   ├── villageController.js    # Village management
│   │   │   └── adminController.js      # Admin operations
│   │   ├── routes/                     # REST API endpoints
│   │   ├── middleware/                 # Auth, RBAC, uploads, audit, caching
│   │   ├── services/                   # Socket.IO, email, deadlines
│   │   ├── config/                     # Database & Redis config
│   │   └── server.js                   # Express server
│   ├── templates/                      # Report templates
│   ├── uploads/                        # File storage
│   ├── tests/                          # API tests & test scripts
│   ├── seed.js                         # Database seeder
│   ├── addUser.js                      # CLI user creation tool
│   ├── DPE_AI_SETUP.md                # Ollama AI setup guide
│   ├── POLICY_ACCESS_CONTROL.md       # RBAC documentation
│   ├── SAUVEGARDE_FEATURE.md          # 24-hour deadline system
│   ├── REDIS_CACHE_GUIDE.md           # Caching setup & testing
│   ├── LEVEL2_IMPLEMENTATION.md       # Level 2 workflow details
│   └── package.json
│
├── false_alarm_classifier/             # Python ML Service
│   ├── api.py                          # Flask API
│   ├── train_model.py                  # Model training script
│   ├── requirements.txt                # Python dependencies
│   └── README.md                       # ML service documentation
│
├── docker-compose.yml                  # Redis container config
└── README.md                           # This file
```

---

## 🎯 Key Features

### 🔐 4-Level Role-Based Access Control (RBAC)

| Level | Role Details | Permissions |
|-------|--------------|-------------|
| **Level 1** | SOS_MOTHER, EDUCATOR, FIELD_STAFF | Create signalements, upload files, view own village data |
| **Level 2** | PSYCHOLOGIST, SOCIAL_WORKER | All Level 1 + manage workflows, classify cases, generate DPE reports, take ownership (sauvegarde) |
| **Level 3** | VILLAGE_DIRECTOR, NATIONAL_OFFICE | All Level 2 + view all villages, analytics, heatmaps, close/archive cases, export data |
| **Level 4** | SUPER_ADMIN | Full system access, user management, village management |

### 🔄 6-Stage Embedded Workflow System

Level 2 specialists follow a structured process embedded in each signalement:

1. **FICHE_INITIALE_DPE** - Initial assessment and DPE report generation
2. **EVALUATION_COMPLETE** - Complete psychological evaluation
3. **PLAN_ACTION** - Action plan development
4. **RAPPORT_SUIVI** - Follow-up monitoring reports
5. **RAPPORT_FINAL** - Final assessment report
6. **AVIS_CLOTURE** - Closure recommendation

Each step tracks: status (NOT_STARTED → IN_PROGRESS → DONE), timestamps, deadlines, and responsible user.

### 🤖 AI-Powered DPE Generation

- **Ollama Integration**: Local LLM (Llama 3.2) generates professional psychological reports
- **Template Fallback**: Automatic fallback to template generation if Ollama unavailable
- **Structured Output**: JSON-based reports with metadata tracking
- **Offline Processing**: No cloud dependencies, fully local AI

📖 **Setup Guide**: [backend/DPE_AI_SETUP.md](backend/DPE_AI_SETUP.md)

### 🚨 Sauvegarde (24-Hour Ownership System)

- Level 2 users "take ownership" of signalements with one click
- Automatic 24-hour deadline tracking
- Status automatically changes to EN_COURS
- Only assigned user can see and edit their cases
- Deadline notifications and warnings

📖 **Feature Guide**: [backend/SAUVEGARDE_FEATURE.md](backend/SAUVEGARDE_FEATURE.md)

### 🎨 Village Scoping & Access Control

- Level 2 users restricted to assigned villages only
- Multi-village support via `accessibleVillages[]` array
- Automatic filtering of all queries by village access
- Prevents cross-village data leaks

📖 **Access Control Policy**: [backend/POLICY_ACCESS_CONTROL.md](backend/POLICY_ACCESS_CONTROL.md)

### ⚡ Redis Caching Layer

- High-performance caching for villages, analytics, and signalements
- Automatic cache invalidation on data mutations
- Configurable TTL per endpoint (1-30 minutes)
- Docker-based Redis deployment

📖 **Caching Guide**: [backend/REDIS_CACHE_GUIDE.md](backend/REDIS_CACHE_GUIDE.md)

### 📊 Analytics & Governance

- Real-time dashboard with KPIs
- Geographic heatmap of incidents across Tunisia
- Village performance ratings
- Export capabilities for reports
- Audit log tracking every action

### 🔔 Real-Time Features

- Socket.IO notifications for new signalements
- Live workflow updates
- Escalation alerts
- Deadline reminders (cron-based scheduler)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** ≥ 18.x
- **MongoDB** (local or MongoDB Atlas)
- **Docker** (for Redis)
- **Python** 3.8+ (for ML service)
- **Ollama** (optional, for AI-powered DPE generation)

### 1️⃣ Clone & Setup

```bash
git clone <repository-url>
cd SOS
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/sos-villages
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/sos-villages

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_change_this_in_production

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Redis (optional but recommended)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_CACHE_TTL=3600

# Email (optional)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@sosvillages.tn
```

**Seed the database** (creates villages, users, and sample data):

```bash
npm run seed
```

This creates:
- **4 SOS Villages**: Gammarth, Siliana, Mahres, Akouda
- **4 Test Users**:
  - `admin@sos.tn` / `admin123` (Level 3 - National Office)
  - `psy@sos.tn` / `psy123` (Level 2 - Psychologist)
  - `fatma@sos.tn` / `fatma123` (Level 1 - SOS Mother)
  - `ahmed@sos.tn` / `ahmed123` (Level 1 - Educator)

**Start Redis** (optional but recommended for performance):

```bash
docker-compose up -d redis
```

**Start the backend**:

```bash
npm run dev          # Development mode with auto-reload
# or
npm start            # Production mode
```

Backend runs on **http://localhost:5000**

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

### 4️⃣ Machine Learning Service (Optional)

```bash
cd ../false_alarm_classifier
pip install -r requirements.txt

# Train the model (first time only)
python train_model.py

# Start the API
python api.py
# or on Windows:
.\start.bat
```

ML service runs on **http://localhost:5001**

---

## 🎮 Usage

1. **Navigate to**: http://localhost:5173
2. **Login** with one of the test accounts
3. **Access dashboards** based on your role:
   - Level 1: Create and view signalements
   - Level 2: Manage workflows, generate DPE reports
   - Level 3: View analytics, heatmaps, governance
   - Level 4: Admin panel

---

## 📡 API Endpoints Overview

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/login` | Login (returns JWT + user info) |
| `GET` | `/profile` | Get current user profile |

### Signalements (`/api/signalements`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/` | List signalements (filtered by role & village) | Level 1+ |
| `POST` | `/` | Create signalement (with file uploads) | Level 1+ |
| `GET` | `/my-deadlines` | Deadline tracking for assigned cases | Level 2+ |
| `GET` | `/:id` | Get single signalement details | All authenticated |
| `GET` | `/:id/attachments/:filename` | Download attachment | All authenticated |
| `PUT` | `/:id` | Update signalement | Level 2 (assigned) |
| `PUT` | `/:id/assign` | Assign to Level 2 user | Level 2+ |
| `PUT` | `/:id/sauvegarder` | Take ownership (24h deadline) | Level 2+ |
| `PUT` | `/:id/close` | Close signalement | Level 3+ |
| `PUT` | `/:id/archive` | Archive signalement | Level 3+ |
| `DELETE` | `/:id` | Delete signalement | Level 3+ |

### Level 2 Operations (`/api/level2`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/signalements` | List signalements with pagination | Level 2+ |
| `GET` | `/signalements/:id` | Get detailed signalement | Level 2+ |
| `PATCH` | `/signalements/:id/classification` | Classify signalement | Level 2+ |
| `PATCH` | `/signalements/:id/workflow` | Update workflow step | Level 2 (assigned) |
| `PUT` | `/signalements/:id/reports/dpe` | Save DPE report | Level 2+ |
| `POST` | `/signalements/:id/escalate` | Escalate to Level 3 | Level 2+ |
| `POST` | `/signalements/:id/close` | Close signalement | Level 2+ |
| `GET` | `/notifications` | Get notifications | Level 2+ |
| `PATCH` | `/notifications/:id/read` | Mark notification as read | Level 2+ |

### Workflows (`/api/workflows`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/my-workflows` | Get assigned workflows | Level 2+ |
| `GET` | `/:signalementId` | Get workflow for a signalement | Level 2+ |
| `POST` | `/` | Create workflow | Level 2+ |
| `PUT` | `/:workflowId/stage` | Advance workflow stage (with upload) | Level 2 (assigned) |
| `PUT` | `/:workflowId/classify` | Classify signalement | Level 2+ |
| `PUT` | `/:workflowId/escalate` | Escalate to Level 3 | Level 2+ |
| `POST` | `/:workflowId/notes` | Add workflow notes | Level 2+ |
| `GET` | `/templates/:templateName` | Download report template | Level 2+ |

### DPE AI Generation (`/api/dpe`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/:signalementId/generate` | Generate DPE draft via Ollama AI | Level 2+ |
| `GET` | `/:signalementId` | Get existing DPE draft | Level 2+ |
| `PUT` | `/:signalementId` | Update DPE draft | Level 2+ |
| `POST` | `/:signalementId/submit` | Submit final DPE | Level 2+ |

### Villages (`/api/villages`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/` | List all villages (cached) | All authenticated |
| `GET` | `/:id` | Get village details | All authenticated |
| `GET` | `/:id/statistics` | Village statistics | All authenticated |
| `POST` | `/` | Create new village | Level 3+ |
| `PUT` | `/:id` | Update village | Level 3+ |

### Analytics (`/api/analytics`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/` | Global analytics dashboard (cached) | Level 3+ |
| `GET` | `/heatmap` | Geographic heatmap data (cached) | Level 3+ |
| `GET` | `/village-ratings` | Village performance ratings (cached) | Level 3+ |
| `GET` | `/export` | Export data (JSON) | Level 3+ |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/users` | List all users | Level 4 |
| `POST` | `/users` | Create new user | Level 4 |
| `PUT` | `/users/:id` | Update user | Level 4 |
| `DELETE` | `/users/:id` | Delete user | Level 4 |
| `GET` | `/signalements` | View all signalements | Level 4 |
| `GET` | `/audit-logs` | View audit logs | Level 4 |

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 with React Router 6
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 4 (with `@tailwindcss/vite`)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Real-time**: Socket.IO Client

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Database**: MongoDB with Mongoose 8
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs (password hashing)
- **File Uploads**: Multer
- **Caching**: Redis (ioredis)
- **Real-time**: Socket.IO
- **AI Integration**: Ollama SDK (local LLM)
- **Job Scheduling**: node-cron
- **Email**: nodemailer
- **Development**: nodemon

### Machine Learning
- **Framework**: Flask (Python)
- **ML Library**: scikit-learn
- **Data Processing**: pandas, numpy
- **Model**: Random Forest Classifier

### DevOps & Tools
- **Containerization**: Docker & Docker Compose
- **Version Control**: Git
- **Testing**: PowerShell scripts, Jest (backend)

---

## 🧪 Testing

### Backend API Tests

Run comprehensive API tests:

```bash
cd backend/tests

# Test basic API functionality
.\testLevel2API.ps1

# Test workflow progression (6 stages)
.\testWorkflowProgression.ps1

# Test DPE AI generation
.\testDPE.ps1

# Test Redis caching
.\testRedisCache.ps1

# Test Redis unit operations
node testRedisUnit.js

# Test file uploads
.\testUpload.ps1
node testUpload.js
```

### Testing with Real Data

To upload and test with a real file:

```powershell
cd backend/tests
.\uploadRealFile.ps1
```

---

## 📚 Documentation

Detailed documentation for specific features:

- **[DPE AI Setup Guide](backend/DPE_AI_SETUP.md)** - Ollama installation and configuration
- **[Policy Access Control](backend/POLICY_ACCESS_CONTROL.md)** - Comprehensive RBAC documentation
- **[Sauvegarde Feature](backend/SAUVEGARDE_FEATURE.md)** - 24-hour deadline ownership system
- **[Redis Cache Guide](backend/REDIS_CACHE_GUIDE.md)** - Caching setup and testing
- **[Level 2 Implementation](backend/LEVEL2_IMPLEMENTATION.md)** - Detailed workflow system
- **[Backend README](backend/README.md)** - Backend-specific documentation
- **[ML Service README](false_alarm_classifier/README.md)** - False alarm classifier setup

---

## 🗄️ Database Models

### User
- `name`, `email`, `password` (hashed)
- `role`: LEVEL1 | LEVEL2 | LEVEL3 | LEVEL4
- `roleDetails`: SOS_MOTHER, EDUCATOR, PSYCHOLOGIST, SOCIAL_WORKER, VILLAGE_DIRECTOR, NATIONAL_OFFICE, SUPER_ADMIN
- `village`: Primary village reference
- `accessibleVillages[]`: Multi-village access

### Signalement
- Basic info: `title`, `description`, `incidentType`, `urgencyLevel`
- Location: `village`, `program`
- Status: `EN_ATTENTE` | `EN_COURS` | `CLOTURE` | `FAUX_SIGNALEMENT`
- Assignment: `assignedTo`, `sauvegardedAt`, `deadlineAt`
- Classification: `classification`, `aiSuspicionScore`
- Anonymity: `isAnonymous`, `childName`, `abuserName`
- Files: `attachments[]`, `signature`
- **Embedded Workflow**: `workflow.currentStep`, `workflow.steps[]`
- **Embedded Reports**: `reports.dpeDraft`, `reports.dpeFinal`, etc.

### Village
- `name`, `location`, `region`, `coordinates`
- `programs[]`, `director`, `capacity`
- `totalSignalements`, `activeSignalements`

### Notification
- `user`, `type`, `message`, `priority`
- `isRead`, `readAt`, `relatedSignalement`

### AuditLog
- `user`, `action`, `targetModel`, `targetId`
- `details`, `ipAddress`, `timestamp`

---

## 🔐 Test Accounts

After running `npm run seed`, use these credentials:

| Email | Password | Role | Village | Description |
|-------|----------|------|---------|-------------|
| `admin@sos.tn` | `admin123` | LEVEL3 (NATIONAL_OFFICE) | All villages | Full governance access |
| `psy@sos.tn` | `psy123` | LEVEL2 (PSYCHOLOGIST) | Gammarth | Specialist with workflow access |
| `fatma@sos.tn` | `fatma123` | LEVEL1 (SOS_MOTHER) | Gammarth | Field staff (8 children) |
| `ahmed@sos.tn` | `ahmed123` | LEVEL1 (EDUCATOR) | Siliana | Field staff (6 children) |

---

## 🛠️ Troubleshooting

### Port Already in Use

**Backend (port 5000):**
```powershell
# Windows
$port = 5000
$proc = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($proc) { Stop-Process -Id $proc -Force }

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Frontend (port 5173):**
```powershell
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

### MongoDB Connection Issues

1. Verify MongoDB is running:
   ```bash
   # Local MongoDB
   mongosh
   
   # Check connectivity
   nc -zv localhost 27017
   ```

2. Check connection string in `.env`
3. For MongoDB Atlas: Ensure IP whitelist is configured

### Redis Connection Issues

```bash
# Check if Redis container is running
docker ps | findstr redis

# Restart Redis
docker-compose restart redis

# View Redis logs
docker logs sos_supbots_redis

# Test Redis connectivity
docker exec sos_supbots_redis redis-cli PING
```

### AI/Ollama Not Working

1. **Check if Ollama is installed:**
   ```bash
   ollama --version
   ```

2. **Pull the model:**
   ```bash
   ollama pull llama3.2:3b
   ```

3. **Verify Ollama service:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

4. **Fallback**: The system automatically uses template-based generation if Ollama is unavailable.

### File Upload Issues

- Check `backend/uploads/` directory exists
- Verify disk space
- Check Multer configuration in middleware

---

## 🔒 Security Recommendations

- ✅ All API routes require JWT authentication (except login)
- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ Village-scoped access control prevents data leaks
- ✅ Comprehensive audit logging
- ✅ Anonymous signalements mask sensitive data
- ⚠️ **Before production**:
  - Change `JWT_SECRET` to a strong random string
  - Use environment variables for all secrets
  - Enable HTTPS
  - Configure proper CORS origins
  - Set up MongoDB authentication
  - Configure Redis password
  - Review and restrict file upload types

---

## 🚀 Deployment Notes

### Environment Variables Checklist

```env
# Required
MONGODB_URI=<production-mongodb-connection>
JWT_SECRET=<strong-random-secret>
NODE_ENV=production
CORS_ORIGIN=<production-frontend-url>

# Optional but recommended
REDIS_HOST=<redis-host>
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>
REDIS_CACHE_TTL=3600

# Optional
EMAIL_HOST=<smtp-host>
EMAIL_PORT=587
EMAIL_USER=<smtp-user>
EMAIL_PASS=<smtp-password>
```

### Production Checklist

- [ ] Update all environment variables
- [ ] Change default JWT_SECRET
- [ ] Configure MongoDB with authentication
- [ ] Set up Redis with password
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up backup schedule for MongoDB
- [ ] Configure log rotation
- [ ] Set up monitoring (uptime, errors)
- [ ] Review and test RBAC permissions
- [ ] Test file upload limits
- [ ] Configure email service (nodemailer)

---

## 📝 Additional Commands

### User Management

```bash
# Add a new user interactively
cd backend
npm run adduser

# Seed database (villages + test users)
npm run seed

# Clear all signalements (dev only)
node clearSignalements.js

# Create test signalements
node createTestSignalements.js

# Create test users with specific roles
node createRoleTestUsers.js
```

### Backend Scripts

```bash
# Start with nodemon (auto-reload)
npm run dev

# Start production mode
npm start

# Run tests
npm test

# Test file upload
npm run test:upload
```

### Docker Commands

```bash
# Start Redis
docker-compose up -d redis

# View Redis logs
docker logs -f sos_supbots_redis

# Access Redis CLI
docker exec -it sos_supbots_redis redis-cli

# Stop Redis
docker-compose down

# Remove Redis data volume
docker-compose down -v
```

---

## 👥 Team

**SupBots** — Hack For Hope 2026

**Built for**: SOS Villages d'Enfants Tunisia

---

## 📄 License

This project was developed for the Hack For Hope 2026 hackathon.

---

## 🙏 Acknowledgments

- **SOS Villages d'Enfants Tunisia** for the mission and requirements
- **Hack For Hope 2026** hackathon organizers
- **Ollama** for local LLM capabilities
- Open-source community for amazing tools
