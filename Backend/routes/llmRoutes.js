// routes/llmRoutes.js
const express = require('express');
const router = express.Router();
const llmController = require('../controllers/llmModelController');

// Get all LLM models
router.get('/', llmController.getAllLLMModels);

// Add a new LLM model
router.post('/', llmController.addLLMModel);

// Get all LLM max token configurations
router.get('/max-tokens', llmController.getAllMaxTokenEntries);

// Update a specific LLM max token configuration
router.put('/max-tokens/:id', llmController.updateMaxTokenEntry);

module.exports = router;
