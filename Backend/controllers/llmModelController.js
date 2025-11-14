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

// Get all LLM max token configurations
const getAllMaxTokenEntries = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT mt.*, lm.name AS llm_model_name
      FROM llm_max_tokens mt
      LEFT JOIN llm_models lm ON mt.model_id = lm.id
      ORDER BY mt.id ASC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching LLM max tokens:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a single LLM max token entry
const updateMaxTokenEntry = async (req, res) => {
  const { id } = req.params;
  const { provider, model_name, max_output_tokens } = req.body;

  if (!id || Number.isNaN(Number(id))) {
    return res.status(400).json({ message: 'Valid entry id is required' });
  }

  if (!provider || !model_name || max_output_tokens === undefined) {
    return res.status(400).json({ message: 'Provider, model name, and max tokens are required' });
  }

  const parsedTokens = parseInt(max_output_tokens, 10);
  if (Number.isNaN(parsedTokens) || parsedTokens <= 0) {
    return res.status(400).json({ message: 'max_output_tokens must be a positive number' });
  }

  try {
    const result = await pool.query(
      `
        UPDATE llm_max_tokens
        SET provider = $1,
            model_name = $2,
            max_output_tokens = $3,
            updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `,
      [provider.trim(), model_name.trim(), parsedTokens, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'LLM max token entry not found' });
    }

    res.status(200).json({
      message: 'LLM max token entry updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating LLM max token entry:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllLLMModels,
  addLLMModel,
  getAllMaxTokenEntries,
  updateMaxTokenEntry,
};
