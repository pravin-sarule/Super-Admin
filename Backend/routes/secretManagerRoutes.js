

// // FILE: routes/secretManagerRoutes.js
// // ============================================
// const express = require('express');

// module.exports = (docDB) => {
//   console.log('🛣️  SECRET MANAGER ROUTES - Initializing with docDB');
  
//   const router = express.Router();
  
//   // Initialize controller with docDB connection
//   const secretManagerController = require('../controllers/secretManagerController');
  
//   const {
//     getAllSecrets,
//     createSecret,
//     fetchSecretValueById
//   } = secretManagerController;

//   // 🔍 GET /api/secrets → list all secrets (use ?fetch=true to include secret values)
//   router.get('/', getAllSecrets);

//   // 🔐 GET /api/secrets/:id → fetch secret value by ID
//   router.get('/:id', fetchSecretValueById);

//   // 📥 POST /api/secrets/create → add new secret to GCP + DB
//   router.post('/create', createSecret);

//   console.log('✅ SECRET MANAGER ROUTES - Registered successfully');

//   return router;
// };


// FILE: routes/secretManagerRoutes.js
// ============================================
const express = require('express');

module.exports = (docDB) => {
  console.log('🛣️  SECRET MANAGER ROUTES - Initializing with docDB');
  
  const router = express.Router();

  // Import controller
  const secretManagerController = require('../controllers/secretManagerController');

  // Destructure all controller functions
  const {
    getAllSecrets,
    createSecret,
    fetchSecretValueById,
    updateSecret,
    deleteSecret
  } = secretManagerController;

  // 🔍 GET /api/secrets → list all secrets (use ?fetch=true to include secret values)
  router.get('/', getAllSecrets);

  // 🔐 GET /api/secrets/:id → fetch single secret by ID (includes its value)
  router.get('/:id', fetchSecretValueById);

  // 📥 POST /api/secrets/create → create new secret in GCP + docDB
  router.post('/create', createSecret);

  // ✏️ PUT /api/secrets/:id → update existing secret (metadata or value)
  router.put('/:id', updateSecret);

  // 🗑️ DELETE /api/secrets/:id → delete secret from GCP + docDB
  router.delete('/:id', deleteSecret);

  console.log('✅ SECRET MANAGER ROUTES - Registered successfully');
  return router;
};
