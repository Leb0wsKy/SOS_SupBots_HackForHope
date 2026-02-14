import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
  signalement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Signalement',
    required: true,
    unique: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classification: {
    type: String,
    enum: ['SAUVEGARDE', 'PRISE_EN_CHARGE', 'FAUX_SIGNALEMENT', null],
    default: null
  },
  // Workflow stages
  stages: {
    initialReport: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    dpeReport: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String,
      aiGenerated: { type: Boolean, default: false },
      edited: { type: Boolean, default: false }
    },
    evaluation: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String
    },
    actionPlan: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String
    },
    followUpReport: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String
    },
    finalReport: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String
    },
    closureNotice: {
      completed: { type: Boolean, default: false },
      completedAt: Date,
      completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String
    }
  },
  currentStage: {
    type: String,
    enum: ['INITIAL', 'DPE', 'EVALUATION', 'ACTION_PLAN', 'FOLLOW_UP', 'FINAL_REPORT', 'CLOSURE', 'COMPLETED'],
    default: 'INITIAL'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'COMPLETED', 'ARCHIVED'],
    default: 'ACTIVE'
  },
  notes: [{
    content: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Workflow', workflowSchema);
