// const express = require('express');

// module.exports = (db) => {
//   const router = express.Router();
//   const {
//     getAllSecrets,
//     fetchSecretValueFromGCP,
//     createSecretInGCP
//   } = require('../controllers/secretManagerController')(db);

//   // 🔍 GET /api/secrets → list all secrets (use ?fetch=true to include secret values)
//   router.get('/', getAllSecrets);

//   // 🔐 GET /api/secrets/:id → fetch secret value from GCP using internal UUID
//   router.get('/:id', fetchSecretValueFromGCP);

//   // 📥 POST /api/secrets/create → add new secret to GCP + DB
//   router.post('/create', createSecretInGCP);

//   return router;
// };


// FILE: routes/secretManagerRoutes.js
// ============================================
const express = require('express');

module.exports = (docDB) => {
  console.log('🛣️  SECRET MANAGER ROUTES - Initializing with docDB');
  
  const router = express.Router();
  
  // Initialize controller with docDB connection
  const secretManagerController = require('../controllers/secretManagerController');
  
  const {
    getAllSecrets,
    createSecret,
    fetchSecretValueById
  } = secretManagerController;

  // 🔍 GET /api/secrets → list all secrets (use ?fetch=true to include secret values)
  router.get('/', getAllSecrets);

  // 🔐 GET /api/secrets/:id → fetch secret value by ID
  router.get('/:id', fetchSecretValueById);

  // 📥 POST /api/secrets/create → add new secret to GCP + DB
  router.post('/create', createSecret);

  console.log('✅ SECRET MANAGER ROUTES - Registered successfully');

  return router;
};