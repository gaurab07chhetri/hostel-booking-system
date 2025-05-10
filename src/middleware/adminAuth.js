const adminAuth = async (req, res, next) => {
  try {
    console.log('Admin auth middleware - user:', req.user);
    if (!req.user) {
      console.log('No user found in request');
      return res.status(403).json({ message: 'Access denied. No user found.' });
    }
    
    console.log('Checking role:', req.user.role);
    if (req.user.role?.toLowerCase() !== 'admin') {
      console.log('User is not admin:', req.user.role);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    console.log('Admin access granted');
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export default adminAuth; 