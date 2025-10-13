// const express = require('express');

// module.exports = (pool) => {
//   const router = express.Router();

//   const userController = require('../controllers/userController')(pool);
//   const protect = require('../middleware/authMiddleware'); // JWT validator
//   const adminOnly = require('../middleware/adminMiddleware'); // Admin role validator

//   router.get('/all', protect, adminOnly, userController.getAllUsers);
//   router.put('/block/:userId', protect, adminOnly, userController.toggleBlockUser);
//   router.put('/edit/:userId', protect, adminOnly, userController.updateUser);
//   router.put('/unblock/:userId', protect, adminOnly, userController.unblockUser);

//   return router;
// };
// const express = require('express');

// module.exports = (pool) => {
//   const router = express.Router();

//   const userController = require('../controllers/userController')(pool);
//   const protect = require('../middleware/authMiddleware'); // JWT validator
//   const adminOnly = require('../middleware/adminMiddleware'); // Admin role validator

//   // 📌 Admin-only routes
//   router.get('/all', protect, adminOnly, userController.getAllUsers);
//   router.put('/block/:userId', protect, adminOnly, userController.toggleBlockUser);
//   router.put('/edit/:userId', protect, adminOnly, userController.updateUser);
//   router.put('/unblock/:userId', protect, adminOnly, userController.unblockUser);

//   // 📌 Session tracking routes (also admin only)
//   router.get('/sessions/:userId', protect, adminOnly, userController.getUserSessions); // Get login/logout history for one user
//   router.get('/sessions', protect, adminOnly, userController.getAllUsersWithLastSession); // Get last login/logout for all users

//   return router;
// };
// const express = require('express');

// module.exports = (pool) => {
//   const router = express.Router();

//   const userController = require('../controllers/userController')(pool);
//   const protect = require('../middleware/authMiddleware'); // JWT validator
//   const adminOnly = require('../middleware/adminMiddleware'); // Admin role validator

//   // 📌 Admin-only user management routes
//   router.get('/all', protect, adminOnly, userController.getAllUsers);
//   router.put('/block/:userId', protect, adminOnly, userController.toggleBlockUser);
//   router.put('/edit/:userId', protect, adminOnly, userController.updateUser);
//   router.put('/unblock/:userId', protect, adminOnly, userController.unblockUser);

//   // 📌 New Routes: User Sessions
//   router.get('/sessions/:userId', protect, adminOnly, userController.getUserSessions); // All sessions of one user
//   router.get('/sessions', protect, adminOnly, userController.getAllUsersWithLastSession); // Latest session for all users

//   return router;
// };
const express = require('express');

module.exports = (pool) => {
  const router = express.Router();
  
  const userController = require('../controllers/userController')(pool);
  const { protect, authorize } = require('../middleware/authMiddleware'); // Import protect and authorize

  // 📌 Admin-only user management routes
  
  // Get all users (basic list)
  router.get('/all', protect(pool), authorize(['admin']), userController.getAllUsers);
  
  // Get all users with their latest session info (main endpoint for frontend)
  router.get('/sessions', protect(pool), authorize(['admin']), userController.getAllUsersWithLastSession);
  
  // Get specific user sessions
  router.get('/sessions/:userId', protect(pool), authorize(['admin']), userController.getUserSessions);
  
  // Get user details by ID
  router.get('/:userId', protect(pool), authorize(['admin']), userController.getUserById);
  
  // Block/unblock user (toggle)
  router.put('/block/:userId', protect(pool), authorize(['admin']), userController.toggleBlockUser);
  
  // Update user details
  router.put('/edit/:userId', protect(pool), authorize(['admin']), userController.updateUser);
  
  // Unblock specific user
  router.put('/unblock/:userId', protect(pool), authorize(['admin']), userController.unblockUser);
  
  // Get user statistics (optional - for dashboard)
  router.get('/stats/overview', protect(pool), authorize(['admin']), userController.getUserStats);

  return router;
};