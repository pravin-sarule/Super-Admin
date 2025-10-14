
const express = require('express');

module.exports = (pool) => {
  const router = express.Router();
  
  const userController = require('../controllers/userController')(pool);
  const { protect, authorize } = require('../middleware/authMiddleware'); // Import protect and authorize

  // 📌 Admin-only user management routes
  
  // Get all users (basic list)
  router.get('/all', protect(pool), authorize(['user-admin','super-admin']), userController.getAllUsers);
  
  // Get all users with their latest session info (main endpoint for frontend)
  router.get('/sessions', protect(pool), authorize(['user-admin','super-admin']), userController.getAllUsersWithLastSession);
  
  // Get specific user sessions
  router.get('/sessions/:userId', protect(pool), authorize(['user-admin','super-admin']), userController.getUserSessions);
  
  // Get user details by ID
  router.get('/:userId', protect(pool), authorize(['user-admin','super-admin']), userController.getUserById);
  
  // Block/unblock user (toggle)
  router.put('/block/:userId', protect(pool), authorize(['user-admin','super-admin']), userController.toggleBlockUser);
  
  // Update user details
  router.put('/edit/:userId', protect(pool), authorize(['user-admin','super-admin']), userController.updateUser);
  
  // Unblock specific user
  router.put('/unblock/:userId', protect(pool), authorize(['user-admin','super-admin']), userController.unblockUser);
  
  // Get user statistics (optional - for dashboard)
  router.get('/stats/overview', protect(pool), authorize(['user-admin','super-admin']), userController.getUserStats);

  return router;
};