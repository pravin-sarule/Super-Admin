

// const docDB = require('../config/docDB');
// const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
// const fs = require('fs');
// const path = require('path');
// const os = require('os');

// let secretClient;

// // Setup GCP client from base64 key
// function setupGCPClientFromBase64() {
//   try {
//     const base64Key = process.env.GCS_KEY_BASE64;
//     if (!base64Key) throw new Error('GCS_KEY_BASE64 is not set');

//     const cleanedBase64 = base64Key.replace(/^["']|["']$/g, '').trim().replace(/\s/g, '');
//     const keyJson = Buffer.from(cleanedBase64, 'base64').toString('utf8');
//     const keyObject = JSON.parse(keyJson);

//     if (!keyObject.private_key || !keyObject.client_email || !keyObject.project_id) {
//       throw new Error('Invalid GCP key structure');
//     }

//     const tempFilePath = path.join(os.tmpdir(), 'gcp-key.json');
//     fs.writeFileSync(tempFilePath, JSON.stringify(keyObject, null, 2), 'utf8');
//     process.env.GOOGLE_APPLICATION_CREDENTIALS = tempFilePath;

//     secretClient = new SecretManagerServiceClient();
//   } catch (error) {
//     console.error('Error setting up GCP client:', error.message);
//     throw error;
//   }
// }

// if (!secretClient) setupGCPClientFromBase64();
// const GCLOUD_PROJECT_ID = process.env.GCS_PROJECT_ID;
// if (!GCLOUD_PROJECT_ID) throw new Error('GCS_PROJECT_ID not set');

// // ---------------------
// // Fetch all secrets (optionally with values and LLM name)
// // ---------------------
// const getAllSecrets = async (req, res) => {
//   const includeValues = req.query.fetch === 'true';

//   try {
//     const result = await docDB.query(`
//       SELECT s.*, l.name AS llm_name 
//       FROM secret_manager s
//       LEFT JOIN llm_models l ON s.llm_id = l.id
//       ORDER BY s.created_at DESC
//     `);
//     const rows = result.rows;

//     if (!includeValues) return res.status(200).json(rows);

//     const enriched = await Promise.all(
//       rows.map(async (row) => {
//         try {
//           const secretName = `projects/${GCLOUD_PROJECT_ID}/secrets/${row.secret_manager_id}/versions/${row.version}`;
//           const [accessResponse] = await secretClient.accessSecretVersion({ name: secretName });
//           const value = accessResponse.payload.data.toString('utf8');
//           return { ...row, value };
//         } catch (err) {
//           return { ...row, value: '[ERROR: Cannot fetch]' };
//         }
//       })
//     );

//     res.status(200).json(enriched);
//   } catch (err) {
//     console.error('Error fetching secrets:', err.message);
//     res.status(500).json({ error: 'Failed to fetch secrets: ' + err.message });
//   }
// };

// // ---------------------
// // Create secret in GCP and docDB with llm_id
// // ---------------------
// const createSecret = async (req, res) => {
//   const {
//     name,
//     description,
//     secret_manager_id,
//     secret_value,
//     llm_id,             // NEW: LLM ID
//     version = '1',
//     created_by = 1,
//     template_type = 'system',
//     status = 'active',
//     usage_count = 0,
//     success_rate = 0,
//     avg_processing_time = 0,
//     template_metadata = {},
//   } = req.body;

//   if (!llm_id) return res.status(400).json({ message: 'llm_id is required' });

//   try {
//     const parent = `projects/${GCLOUD_PROJECT_ID}`;
//     const secretName = `${parent}/secrets/${secret_manager_id}`;

//     // Check if secret exists
//     let exists = false;
//     try { await secretClient.getSecret({ name: secretName }); exists = true; } 
//     catch (err) { if (err.code !== 5) throw err; }

//     if (!exists) {
//       await secretClient.createSecret({
//         parent,
//         secretId: secret_manager_id,
//         secret: { replication: { automatic: {} } },
//       });
//     }

//     // Add secret version
//     const [versionResponse] = await secretClient.addSecretVersion({
//       parent: secretName,
//       payload: { data: Buffer.from(secret_value, 'utf8') },
//     });
//     const versionId = versionResponse.name.split('/').pop();

//     // Insert metadata into docDB
//     const result = await docDB.query(`
//       INSERT INTO secret_manager (
//         id, name, description, template_type, status,
//         usage_count, success_rate, avg_processing_time,
//         created_by, updated_by, created_at, updated_at,
//         activated_at, last_used_at, template_metadata,
//         secret_manager_id, version, llm_id
//       ) VALUES (
//         gen_random_uuid(), $1, $2, $3, $4,
//         $5, $6, $7,
//         $8, $8, now(), now(),
//         now(), NULL, $9::jsonb,
//         $10, $11, $12
//       ) RETURNING *;
//     `, [
//       name, description, template_type, status,
//       usage_count, success_rate, avg_processing_time,
//       created_by, JSON.stringify(template_metadata),
//       secret_manager_id, versionId, llm_id
//     ]);

//     res.status(201).json({
//       message: 'Secret created successfully in GCP and docDB',
//       dbRecord: result.rows[0],
//       gcpVersion: versionId
//     });
//   } catch (err) {
//     console.error('Error creating secret:', err.message);
//     res.status(500).json({ error: 'Failed to create secret: ' + err.message });
//   }
// };

// // ---------------------
// // Fetch secret value by ID
// // ---------------------
// const fetchSecretValueById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await docDB.query(
//       'SELECT secret_manager_id, version, llm_id FROM secret_manager WHERE id = $1',
//       [id]
//     );
//     if (result.rows.length === 0) return res.status(404).json({ error: 'Secret not found' });

//     const { secret_manager_id, version, llm_id } = result.rows[0];
//     const secretName = `projects/${GCLOUD_PROJECT_ID}/secrets/${secret_manager_id}/versions/${version}`;
//     const [accessResponse] = await secretClient.accessSecretVersion({ name: secretName });
//     const value = accessResponse.payload.data.toString('utf8');

//     // Fetch LLM name
//     const llmResult = await docDB.query('SELECT name FROM llm_models WHERE id = $1', [llm_id]);
//     const llmName = llmResult.rows[0]?.name || null;

//     res.status(200).json({ secret_manager_id, version, value, llm_id, llmName });
//   } catch (err) {
//     console.error('Error fetching secret value:', err.message);
//     res.status(500).json({ error: 'Failed to fetch secret: ' + err.message });
//   }
// };

// module.exports = {
//   getAllSecrets,
//   createSecret,
//   fetchSecretValueById
// };



const docDB = require('../config/docDB');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const fs = require('fs');
const path = require('path');
const os = require('os');

let secretClient;

// ---------------------
// Setup GCP client from base64 key
// ---------------------
function setupGCPClientFromBase64() {
  try {
    const base64Key = process.env.GCS_KEY_BASE64;
    if (!base64Key) throw new Error('GCS_KEY_BASE64 is not set');

    const cleanedBase64 = base64Key.replace(/^["']|["']$/g, '').trim().replace(/\s/g, '');
    const keyJson = Buffer.from(cleanedBase64, 'base64').toString('utf8');
    const keyObject = JSON.parse(keyJson);

    if (!keyObject.private_key || !keyObject.client_email || !keyObject.project_id) {
      throw new Error('Invalid GCP key structure');
    }

    const tempFilePath = path.join(os.tmpdir(), 'gcp-key.json');
    fs.writeFileSync(tempFilePath, JSON.stringify(keyObject, null, 2), 'utf8');
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tempFilePath;

    secretClient = new SecretManagerServiceClient();
  } catch (error) {
    console.error('Error setting up GCP client:', error.message);
    throw error;
  }
}

if (!secretClient) setupGCPClientFromBase64();
const GCLOUD_PROJECT_ID = process.env.GCS_PROJECT_ID;
if (!GCLOUD_PROJECT_ID) throw new Error('GCS_PROJECT_ID not set');

// ---------------------
// Get all secrets
// ---------------------
const getAllSecrets = async (req, res) => {
  const includeValues = req.query.fetch === 'true';

  try {
    const result = await docDB.query(`
      SELECT s.*, l.name AS llm_name 
      FROM secret_manager s
      LEFT JOIN llm_models l ON s.llm_id = l.id
      ORDER BY s.created_at DESC
    `);
    const rows = result.rows;

    if (!includeValues) return res.status(200).json(rows);

    const enriched = await Promise.all(
      rows.map(async (row) => {
        try {
          const secretName = `projects/${GCLOUD_PROJECT_ID}/secrets/${row.secret_manager_id}/versions/${row.version}`;
          const [accessResponse] = await secretClient.accessSecretVersion({ name: secretName });
          const value = accessResponse.payload.data.toString('utf8');
          return { ...row, value };
        } catch (err) {
          return { ...row, value: '[ERROR: Cannot fetch]' };
        }
      })
    );

    res.status(200).json(enriched);
  } catch (err) {
    console.error('Error fetching secrets:', err.message);
    res.status(500).json({ error: 'Failed to fetch secrets: ' + err.message });
  }
};

// ---------------------
// Create secret
// ---------------------
const createSecret = async (req, res) => {
  const {
    name,
    description,
    secret_manager_id,
    secret_value,
    llm_id,
    version = '1',
    created_by = 1,
    template_type = 'system',
    status = 'active',
    usage_count = 0,
    success_rate = 0,
    avg_processing_time = 0,
    template_metadata = {},
  } = req.body;

  if (!llm_id) return res.status(400).json({ message: 'llm_id is required' });

  try {
    const parent = `projects/${GCLOUD_PROJECT_ID}`;
    const secretName = `${parent}/secrets/${secret_manager_id}`;

    let exists = false;
    try { await secretClient.getSecret({ name: secretName }); exists = true; } 
    catch (err) { if (err.code !== 5) throw err; }

    if (!exists) {
      await secretClient.createSecret({
        parent,
        secretId: secret_manager_id,
        secret: { replication: { automatic: {} } },
      });
    }

    const [versionResponse] = await secretClient.addSecretVersion({
      parent: secretName,
      payload: { data: Buffer.from(secret_value, 'utf8') },
    });
    const versionId = versionResponse.name.split('/').pop();

    const result = await docDB.query(`
      INSERT INTO secret_manager (
        id, name, description, template_type, status,
        usage_count, success_rate, avg_processing_time,
        created_by, updated_by, created_at, updated_at,
        activated_at, last_used_at, template_metadata,
        secret_manager_id, version, llm_id
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4,
        $5, $6, $7,
        $8, $8, now(), now(),
        now(), NULL, $9::jsonb,
        $10, $11, $12
      ) RETURNING *;
    `, [
      name, description, template_type, status,
      usage_count, success_rate, avg_processing_time,
      created_by, JSON.stringify(template_metadata),
      secret_manager_id, versionId, llm_id
    ]);

    res.status(201).json({
      message: 'Secret created successfully in GCP and docDB',
      dbRecord: result.rows[0],
      gcpVersion: versionId
    });
  } catch (err) {
    console.error('Error creating secret:', err.message);
    res.status(500).json({ error: 'Failed to create secret: ' + err.message });
  }
};

// ---------------------
// Fetch secret by ID
// ---------------------
const fetchSecretValueById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await docDB.query(
      'SELECT secret_manager_id, version, llm_id FROM secret_manager WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Secret not found' });

    const { secret_manager_id, version, llm_id } = result.rows[0];
    const secretName = `projects/${GCLOUD_PROJECT_ID}/secrets/${secret_manager_id}/versions/${version}`;
    const [accessResponse] = await secretClient.accessSecretVersion({ name: secretName });
    const value = accessResponse.payload.data.toString('utf8');

    const llmResult = await docDB.query('SELECT name FROM llm_models WHERE id = $1', [llm_id]);
    const llmName = llmResult.rows[0]?.name || null;

    res.status(200).json({ secret_manager_id, version, value, llm_id, llmName });
  } catch (err) {
    console.error('Error fetching secret value:', err.message);
    res.status(500).json({ error: 'Failed to fetch secret: ' + err.message });
  }
};

// ---------------------
// Update secret (value and metadata)
// ---------------------
// const updateSecret = async (req, res) => {
//   const { id } = req.params;
//   const {
//     name,
//     description,
//     status,
//     template_metadata,
//     secret_value,
//     updated_by = 1
//   } = req.body;

//   try {
//     const result = await docDB.query('SELECT * FROM secret_manager WHERE id = $1', [id]);
//     if (result.rows.length === 0) return res.status(404).json({ error: 'Secret not found' });
//     const secret = result.rows[0];

//     const secretName = `projects/${GCLOUD_PROJECT_ID}/secrets/${secret.secret_manager_id}`;

//     let versionId = secret.version;
//     if (secret_value) {
//       const [versionResponse] = await secretClient.addSecretVersion({
//         parent: secretName,
//         payload: { data: Buffer.from(secret_value, 'utf8') },
//       });
//       versionId = versionResponse.name.split('/').pop();
//     }

//     const updateQuery = `
//       UPDATE secret_manager 
//       SET 
//         name = COALESCE($1, name),
//         description = COALESCE($2, description),
//         status = COALESCE($3, status),
//         template_metadata = COALESCE($4::jsonb, template_metadata),
//         version = $5,
//         updated_by = $6,
//         updated_at = now()
//       WHERE id = $7
//       RETURNING *;
//     `;
//     const updated = await docDB.query(updateQuery, [
//       name, description, status, template_metadata ? JSON.stringify(template_metadata) : null,
//       versionId, updated_by, id
//     ]);

//     res.status(200).json({
//       message: 'Secret updated successfully',
//       updatedRecord: updated.rows[0]
//     });
//   } catch (err) {
//     console.error('Error updating secret:', err.message);
//     res.status(500).json({ error: 'Failed to update secret: ' + err.message });
//   }
// };
const updateSecret = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    status,
    template_metadata,
    secret_value,
    llm_id,          // ✅ include llm_id from request body
    updated_by = 1
  } = req.body;

  try {
    const result = await docDB.query('SELECT * FROM secret_manager WHERE id = $1', [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Secret not found' });

    const secret = result.rows[0];
    const secretName = `projects/${GCLOUD_PROJECT_ID}/secrets/${secret.secret_manager_id}`;

    let versionId = secret.version;
    if (secret_value) {
      const [versionResponse] = await secretClient.addSecretVersion({
        parent: secretName,
        payload: { data: Buffer.from(secret_value, 'utf8') },
      });
      versionId = versionResponse.name.split('/').pop();
    }

    // ✅ Updated SQL query to include llm_id
    const updateQuery = `
      UPDATE secret_manager 
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        template_metadata = COALESCE($4::jsonb, template_metadata),
        version = $5,
        llm_id = COALESCE($6, llm_id),     -- ✅ update llm_id if provided
        updated_by = $7,
        updated_at = now()
      WHERE id = $8
      RETURNING *;
    `;

    const updated = await docDB.query(updateQuery, [
      name,
      description,
      status,
      template_metadata ? JSON.stringify(template_metadata) : null,
      versionId,
      llm_id || null,
      updated_by,
      id
    ]);

    res.status(200).json({
      message: 'Secret updated successfully',
      updatedRecord: updated.rows[0]
    });
  } catch (err) {
    console.error('Error updating secret:', err.message);
    res.status(500).json({ error: 'Failed to update secret: ' + err.message });
  }
};

// ---------------------
// Delete secret (from GCP + docDB)
// ---------------------
const deleteSecret = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await docDB.query('SELECT * FROM secret_manager WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Secret not found' });

    const { secret_manager_id } = result.rows[0];
    const secretName = `projects/${GCLOUD_PROJECT_ID}/secrets/${secret_manager_id}`;

    try {
      await secretClient.deleteSecret({ name: secretName });
    } catch (err) {
      if (err.code !== 5) console.warn('Warning: Failed to delete from GCP:', err.message);
    }

    await docDB.query('DELETE FROM secret_manager WHERE id = $1', [id]);

    res.status(200).json({ message: 'Secret deleted successfully from GCP and docDB' });
  } catch (err) {
    console.error('Error deleting secret:', err.message);
    res.status(500).json({ error: 'Failed to delete secret: ' + err.message });
  }
};

// ---------------------
module.exports = {
  getAllSecrets,
  createSecret,
  fetchSecretValueById,
  updateSecret,
  deleteSecret
};
