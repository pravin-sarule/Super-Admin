// routes/llmRoutes.js
const express = require('express');
const router = express.Router();
const llmController = require('../controllers/llmModelController');

// Get all LLM models
router.get('/', llmController.getAllLLMModels);

// Add a new LLM model
router.post('/', llmController.addLLMModel);

module.exports = router;
