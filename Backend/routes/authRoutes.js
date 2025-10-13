// const express = require('express');
// const router = express.Router();
// const { loginAdmin, getAdminProfile } = require('../controllers/authController');
// const authenticateAdmin = require('../middleware/authMiddleware');

// router.post('/login', loginAdmin);
// router.get('/profile', authenticateAdmin, getAdminProfile);

// module.exports = router;
const express = require('express');

module.exports = (pool) => {
  const router = express.Router();
  const { loginAdmin } = require('../controllers/authController')(pool);
  const { protect } = require('../middleware/authMiddleware'); // Import protect

  // Public Route
  router.post('/login', loginAdmin);

  // Protected Test Route
  router.get('/dashboard', protect(pool), (req, res) => { // Use protect with pool
    res.status(200).json({
      message: `Hello Admin ${req.user.id}`, // Use req.user as per updated middleware
      user: req.user
    });
  });

  return router;
};