const checkRole = (allowedRoles) => 
{
  return (req, res, next) => 
  {
    try 
    {
      const userRole = req.headers['user-role'] || req.body.userRole;
      const username = req.headers['username'] || req.body.username;
      
      if (!userRole || !username) 
      {
        return res.status(401).json(
        { 
          message: 'Authentication required. Please provide user role and username.' 
        });
      }
      
      if (!allowedRoles.includes(userRole)) 
      {
        return res.status(403).json(
        { 
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}` 
        });
      }
      
      req.user = 
      {
        username: username,
        role: userRole
      };
      
      next();
    } 
    catch (error) 
    {
      res.status(500).json({ message: 'Authentication error', error: error.message });
    }
  };
};

// Specific role checks
const managerOnly = checkRole(['Manager']);
const ownerOnly = checkRole(['Owner']);
const managerOrOwner = checkRole(['Manager', 'Owner']);

module.exports = { checkRole, managerOnly, ownerOnly, managerOrOwner };