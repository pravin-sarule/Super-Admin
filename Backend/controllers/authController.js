

// controllers/adminController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (pool) => {
  const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
      const result = await pool.query('SELECT * FROM super_admins WHERE email = $1', [email]);
      const admin = result.rows[0];

      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: admin.id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log(`JWT token generated for user ID: ${admin.id}, with role: ${admin.role}`); // Log role in token

      res.status(200).json({
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role
        }
      });
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  return {
    loginAdmin,
  };
};
