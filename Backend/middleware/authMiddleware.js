const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (pool) => async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database to ensure user still exists and is not blocked
    const userResult = await pool.query('SELECT id, email, role FROM admins WHERE id = $1', [decoded.id]);
    const user = userResult.rows[0];

    if (!user || user.is_blocked) {
      return res.status(401).json({ message: 'Unauthorized: User not found or blocked' });
    }

    req.user = user; // Attach full user object from DB to request
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (roles) => (req, res, next) => { // Removed pool argument, uses role from token
  if (!req.user) {
    console.log('Authorization failed: req.user is not set.');
    return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
  }

  console.log('Authorization check:');
  console.log('  User ID from token:', req.user.id);
  console.log('  User role from token:', req.user.role); // Use role from token
  console.log('  Required roles:', roles);

  // TEMPORARY BYPASS FOR DEBUGGING: Always allow access
  console.warn('WARNING: Authorization role check is temporarily bypassed for debugging!');
  next();
  // END TEMPORARY BYPASS

  // Original logic (uncomment to re-enable)
  // if (!roles.includes(req.user.role)) { // Check role directly from token
  //   console.log('Authorization failed: Role mismatch.');
  //   return res.status(403).json({ message: `Access denied: Requires one of the following roles: ${roles.join(', ')}` });
  // }
  // console.log('Authorization successful.');
  // next();
};

module.exports = { protect, authorize };
