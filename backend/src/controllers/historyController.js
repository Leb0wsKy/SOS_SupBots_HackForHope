import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';

/* ══════════════════════════════════════════════════════
   History Controller — Activity log for Level 2 / 3
   Scoped by village for Level 2 (psychologue) & Director,
   all-village for National Office.
   ══════════════════════════════════════════════════════ */

// Actions that are meaningful for case-handling history (exclude noisy VIEW_ actions)
const RELEVANT_ACTIONS = [
  'CREATE_SIGNALEMENT',
  'UPDATE_SIGNALEMENT',
  'DELETE_SIGNALEMENT',
  'CLASSIFY_SIGNALEMENT',
  'ESCALATE_SIGNALEMENT',
  'CLOSE_SIGNALEMENT',
  'ARCHIVE_SIGNALEMENT',
  'ASSIGN_SIGNALEMENT',
  'SAUVEGARDER_SIGNALEMENT',
  'MARK_FAUX_SIGNALEMENT',
  'DIRECTOR_SIGN',
  'DIRECTOR_FORWARD',
  'CREATE_WORKFLOW',
  'UPDATE_WORKFLOW',
  'CLOSE_WORKFLOW',
  'COMPLETE_STAGE',
  'GENERATE_DPE',
  'UPDATE_DPE',
  'SUBMIT_DPE',
  'SAVE_DPE_REPORT',
  'DOWNLOAD_TEMPLATE',
  'DOWNLOAD_ATTACHMENT',
  'PREDICT_FALSE_ALARM',
];

/**
 * GET /api/history
 * Query params: page, limit, action (filter by specific action), startDate, endDate
 */
export const getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 30, action, startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter
    const filter = {
      action: { $in: RELEVANT_ACTIONS },
    };

    // Optional: filter by specific action type
    if (action && RELEVANT_ACTIONS.includes(action)) {
      filter.action = action;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    // Scope by role:
    // Each level only sees history from users at the SAME level.
    // Additionally, LEVEL2 is scoped to same village, LEVEL3 (non-national) to same village.
    const role = req.user.role;
    const roleDetails = req.user.roleDetails;

    // 1) Find users at the same role level
    const sameLevelQuery = { role };

    // 2) Additionally scope by village for non-global roles
    if (role === 'LEVEL4') {
      // Super admin — sees only LEVEL4 actions, all villages
    } else if (role === 'LEVEL3' && roleDetails === 'NATIONAL_OFFICE') {
      // National office — sees only LEVEL3 actions, all villages
    } else {
      // LEVEL1, LEVEL2 or LEVEL3 village-scoped — same level + same village
      const userVillage = req.user.village;
      if (userVillage) {
        sameLevelQuery.village = userVillage;
      }
    }

    const sameLevelUsers = await User.find(sameLevelQuery).select('_id').lean();
    const sameLevelUserIds = sameLevelUsers.map(u => u._id);
    filter.user = { $in: sameLevelUserIds };

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('user', 'name email role roleDetails')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      logs,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
