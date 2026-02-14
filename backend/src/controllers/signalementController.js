import Signalement from '../models/Signalement.js';
import Village from '../models/Village.js';

// Create new signalement with file uploads
export const createSignalement = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      village, 
      program,
      incidentType,
      urgencyLevel,
      isAnonymous 
    } = req.body;

    // Process uploaded files
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path
    })) : [];

    // AI detection placeholder - calculate suspicion score
    const aiSuspicionScore = calculateAISuspicionScore(description, incidentType);

    const signalement = new Signalement({
      title,
      description,
      village,
      program,
      incidentType,
      urgencyLevel,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      createdBy: req.user.id,
      attachments,
      aiSuspicionScore,
      aiFlags: aiSuspicionScore > 70 ? [{
        flag: 'HIGH_SUSPICION_SCORE',
        confidence: aiSuspicionScore,
        timestamp: new Date()
      }] : []
    });

    await signalement.save();

    // Update village statistics
    await Village.findByIdAndUpdate(village, {
      $inc: { totalSignalements: 1 }
    });

    // Populate before sending
    await signalement.populate('village', 'name location');
    await signalement.populate('createdBy', 'name email role');

    res.status(201).json(signalement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// AI suspicion score calculator (placeholder)
function calculateAISuspicionScore(description, incidentType) {
  // This is a placeholder. In production, integrate with local NLP model
  let score = 0;
  
  const lowQualityIndicators = [
    'test', 'fake', 'essai', 'blague',
    description.length < 20,
    description.split(' ').length < 5
  ];
  
  lowQualityIndicators.forEach(indicator => {
    if (typeof indicator === 'boolean' && indicator) score += 20;
    else if (typeof indicator === 'string' && description.toLowerCase().includes(indicator)) score += 25;
  });
  
  return Math.min(score, 100);
}

// Get all signalements (with filtering)
export const getSignalements = async (req, res) => {
  try {
    const { status, village, urgencyLevel, incidentType, myVillage } = req.query;
    
    let filter = {};
    
    // Role-based filtering
    if (req.user.role === 'LEVEL1') {
      // Level 1 only sees their own village's reports
      filter.village = req.user.village;
    } else if (req.user.role === 'LEVEL2') {
      // Level 2 sees assigned or their village
      if (myVillage === 'true') {
        filter.village = req.user.village;
      }
    }
    // Level 3 sees all
    
    if (status) filter.status = status;
    if (village) filter.village = village;
    if (urgencyLevel) filter.urgencyLevel = urgencyLevel;
    if (incidentType) filter.incidentType = incidentType;
    
    const signalements = await Signalement.find(filter)
      .populate('createdBy', 'name email role roleDetails')
      .populate('village', 'name location region')
      .populate('assignedTo', 'name email')
      .populate('classifiedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(signalements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get signalement by ID
export const getSignalementById = async (req, res) => {
  try {
    const signalement = await Signalement.findById(req.params.id)
      .populate('createdBy', 'name email role roleDetails')
      .populate('village', 'name location region')
      .populate('assignedTo', 'name email role')
      .populate('classifiedBy', 'name')
      .populate('workflow');

    if (!signalement) {
      return res.status(404).json({ message: 'Signalement not found' });
    }

    res.json(signalement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update signalement (Level 2+)
export const updateSignalement = async (req, res) => {
  try {
    const { id } = req.params;
    const signalement = await Signalement.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    ).populate('village createdBy assignedTo');

    if (!signalement) {
      return res.status(404).json({ message: 'Signalement not found' });
    }

    res.json(signalement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Close signalement (Level 3)
export const closeSignalement = async (req, res) => {
  try {
    const { id } = req.params;
    const { closureReason } = req.body;

    const signalement = await Signalement.findById(id);
    if (!signalement) {
      return res.status(404).json({ message: 'Signalement not found' });
    }

    signalement.status = 'CLOTURE';
    signalement.closedBy = req.user.id;
    signalement.closedAt = new Date();
    signalement.closureReason = closureReason;

    await signalement.save();

    res.json(signalement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Archive signalement (Level 3)
export const archiveSignalement = async (req, res) => {
  try {
    const { id } = req.params;

    const signalement = await Signalement.findById(id);
    if (!signalement) {
      return res.status(404).json({ message: 'Signalement not found' });
    }

    if (signalement.status !== 'CLOTURE') {
      return res.status(400).json({ message: 'Only closed signalements can be archived' });
    }

    signalement.isArchived = true;
    signalement.archivedBy = req.user.id;
    signalement.archivedAt = new Date();

    await signalement.save();

    res.json(signalement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete signalement (Level 3 only - soft delete)
export const deleteSignalement = async (req, res) => {
  try {
    const { id } = req.params;
    const signalement = await Signalement.findByIdAndDelete(id);

    if (!signalement) {
      return res.status(404).json({ message: 'Signalement not found' });
    }

    // Update village statistics
    await Village.findByIdAndUpdate(signalement.village, {
      $inc: { totalSignalements: -1 }
    });

    res.json({ message: 'Signalement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign signalement to Level 2 user
export const assignSignalement = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const signalement = await Signalement.findById(id);
    if (!signalement) {
      return res.status(404).json({ message: 'Signalement not found' });
    }

    signalement.assignedTo = userId;
    signalement.assignedAt = new Date();
    signalement.status = 'EN_COURS';

    await signalement.save();

    res.json(signalement);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
