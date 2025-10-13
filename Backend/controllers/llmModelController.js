// controllers/llmController.js
const pool = require('../config/docDB'); // import your db pool

// Get all LLM models
const getAllLLMModels = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM llm_models ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching LLM models:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a new LLM model
const addLLMModel = async (req, res) => {
  const { name, is_active } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Model name is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO llm_models (name, is_active) VALUES ($1, $2) RETURNING *',
      [name, is_active ?? true]
    );

    res.status(201).json({ message: 'LLM model added successfully', model: result.rows[0] });
  } catch (error) {
    console.error('Error adding LLM model:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllLLMModels,
  addLLMModel,
};
