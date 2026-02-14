import mongoose from 'mongoose';
import crypto from 'crypto';

const ENC_KEY = process.env.FIELD_ENCRYPTION_KEY || '';

const getKey = () => {
  if (!ENC_KEY) return null;
  const key = Buffer.from(ENC_KEY, 'base64');
  if (key.length !== 32) return null;
  return key;
};

const encryptField = (value) => {
  if (!value) return value;
  const key = getKey();
  if (!key) return value;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
};

const decryptField = (value) => {
  if (!value) return value;
  const key = getKey();
  if (!key) return value;

  const parts = String(value).split(':');
  if (parts.length !== 3) return value;

  try {
    const iv = Buffer.from(parts[0], 'base64');
    const tag = Buffer.from(parts[1], 'base64');
    const content = Buffer.from(parts[2], 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(content), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    return value;
  }
};

const signalementSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String
  },
  description: {
    type: String,
    required: true,
    set: encryptField,
    get: decryptField
  },
  
  // Anonymous reporting
  isAnonymous: {
    type: Boolean,
    required: true,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Location & Village
  village: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Village'
  },
  program: {
    type: String
  },

  // People involved (optional)
  childName: {
    type: String,
    set: encryptField,
    get: decryptField
  },
  abuserName: {
    type: String,
    set: encryptField,
    get: decryptField
  },
  
  // Incident Details
  incidentType: {
    type: String,
    enum: [
      'SANTE',           // Health
      'VIOLENCE_PHYSIQUE',
      'VIOLENCE_PSYCHOLOGIQUE',
      'VIOLENCE_SEXUELLE',
      'NEGLIGENCE',
      'COMPORTEMENT',    // Behavior
      'EDUCATION',
      'FAMILIAL',        // Family issues
      'AUTRE'
    ]
  },
  
  // Urgency Level
  urgencyLevel: {
    type: String,
    enum: ['FAIBLE', 'MOYEN', 'ELEVE', 'CRITIQUE'],
    default: 'MOYEN'
  },
  
  // Status Lifecycle
  status: {
    type: String,
    enum: ['EN_ATTENTE', 'EN_COURS', 'CLOTURE', 'FAUX_SIGNALEMENT'],
    default: 'EN_ATTENTE'
  },
  
  // Classification (by Level 2)
  classification: {
    type: String,
    enum: ['SAUVEGARDE', 'PRISE_EN_CHARGE', 'FAUX_SIGNALEMENT', null],
    default: null
  },
  classifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  classifiedAt: {
    type: Date
  },
  
  // Attachments (photo/audio/video)
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // AI Detection
  aiSuspicionScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  aiFlags: [{
    flag: String,
    confidence: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Workflow reference
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow'
  },
  
  // Assignment (Level 2)
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },

  // Escalation
  escalationStatus: {
    type: String,
    enum: ['NONE', 'ESCALATED'],
    default: 'NONE'
  },
  escalatedTo: {
    type: String,
    enum: ['VILLAGE_DIRECTOR', 'NATIONAL_OFFICE', null],
    default: null
  },
  escalatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  escalatedAt: {
    type: Date
  },
  
  // Sauvegarde (Level 2 takes ownership)
  sauvegardedAt: {
    type: Date
  },
  deadlineAt: {
    type: Date
  },
  
  // Closure
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  closedAt: {
    type: Date
  },
  closureReason: {
    type: String
  },
  
  // Archived by Level 3
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  archivedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

export default mongoose.model('Signalement', signalementSchema);
