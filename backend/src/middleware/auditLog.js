import AuditLog from '../models/AuditLog.js';

export const logAudit = (action, targetModel = null) => {
  return async (req, res, next) => {
    try {
      const originalJson = res.json.bind(res);
      
      res.json = function(data) {
        // Log the action
        if (req.user) {
          AuditLog.create({
            user: req.user.id,
            action: action,
            targetModel: targetModel,
            targetId: req.params.id || data?._id || data?.id,
            details: {
              method: req.method,
              path: req.path,
              body: req.body,
              query: req.query
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
          }).catch(err => console.error('Audit log error:', err));
        }
        
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      console.error('Audit middleware error:', error);
      next();
    }
  };
};
