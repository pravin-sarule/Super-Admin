// const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
// const fs = require('fs');
// const path = require('path');
// const os = require('os');

// let secretClient;

// // Decode base64 key and write to temp file ONCE
// function setupGCPClientFromBase64() {
//   const base64Key = process.env.GCS_KEY_BASE64;
//   if (!base64Key) throw new Error('❌ GCS_KEY_BASE64 is not set');

//   const keyJson = Buffer.from(base64Key, 'base64').toString('utf8');
//   const tempFilePath = path.join(os.tmpdir(), 'gcp-key.json');
//   fs.writeFileSync(tempFilePath, keyJson);
//   process.env.GOOGLE_APPLICATION_CREDENTIALS = tempFilePath;

//   secretClient = new SecretManagerServiceClient();
// }

// if (!secretClient) {
//   setupGCPClientFromBase64();
// }

// const GCLOUD_PROJECT_ID = process.env.GCS_PROJECT_ID;
// if (!GCLOUD_PROJECT_ID) {
//   throw new Error('GCLOUD_PROJECT_ID not set in env');
// }

// module.exports = (db) => {
//   // 🔐 1. Fetch secret value from GCP by internal ID
//   const fetchSecretValueFromGCP = async (req, res) => {
//     const { id } = req.params;

//     try {
//       console.log('📦 Fetching secret config from DB for ID:', id);

//       const result = await db.query(
//         'SELECT secret_manager_id, version FROM secret_manager WHERE id = $1',
//         [id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({ error: '❌ Secret config not found in DB' });
//       }

//       const { secret_manager_id, version } = result.rows[0];
//       const secretName = `projects/${GCLOUD_PROJECT_ID}/secrets/${secret_manager_id}/versions/${version}`;

//       console.log('🔐 Fetching from GCP Secret Manager:', secretName);

//       const [accessResponse] = await secretClient.accessSecretVersion({ name: secretName });
//       const secretValue = accessResponse.payload.data.toString('utf8');

//       res.status(200).json({
//         secretManagerId: secret_manager_id,
//         version,
//         value: secretValue,
//       });
//     } catch (err) {
//       console.error('🚨 Error in fetchSecretValueFromGCP:', err.message);
//       res.status(500).json({ error: 'Internal Server Error: ' + err.message });
//     }
//   };

//   // 📥 2. Create secret in GCP and insert into DB
//   const createSecretInGCP = async (req, res) => {
//     const {
//       name,
//       description,
//       secret_manager_id,
//       secret_value,
//       version = '1',
//       created_by = 1,
//       template_type = 'system',
//       status = 'active',
//       usage_count = 0,
//       success_rate = 0,
//       avg_processing_time = 0,
//       template_metadata = {},
//     } = req.body;

//     try {
//       const parent = `projects/${GCLOUD_PROJECT_ID}`;
//       const secretName = `${parent}/secrets/${secret_manager_id}`;

//       // Check if the secret already exists
//       const [secrets] = await secretClient.listSecrets({ parent });
//       const exists = secrets.find((s) => s.name === secretName);

//       if (!exists) {
//         console.log(`🆕 Creating secret: ${secret_manager_id}`);
//         await secretClient.createSecret({
//           parent,
//           secretId: secret_manager_id,
//           secret: { replication: { automatic: {} } },
//         });
//       } else {
//         console.log(`ℹ️ Secret already exists: ${secret_manager_id}`);
//       }

//       // Add secret version
//       const [versionResponse] = await secretClient.addSecretVersion({
//         parent: secretName,
//         payload: { data: Buffer.from(secret_value, 'utf8') },
//       });

//       const versionId = versionResponse.name.split('/').pop();

//       // Insert into DB
//       const result = await db.query(
//         `
//         INSERT INTO secret_manager (
//           id, name, description, template_type, status,
//           usage_count, success_rate, avg_processing_time,
//           created_by, updated_by, created_at, updated_at,
//           activated_at, last_used_at, template_metadata,
//           secret_manager_id, version
//         ) VALUES (
//           gen_random_uuid(), $1, $2, $3, $4,
//           $5, $6, $7,
//           $8, $8, now(), now(),
//           now(), NULL, $9::jsonb,
//           $10, $11
//         ) RETURNING *;
//         `,
//         [
//           name,
//           description,
//           template_type,
//           status,
//           usage_count,
//           success_rate,
//           avg_processing_time,
//           created_by,
//           JSON.stringify(template_metadata),
//           secret_manager_id,
//           versionId,
//         ]
//       );

//       res.status(201).json({
//         message: '✅ Secret created and version added to GCP',
//         gcpSecret: secret_manager_id,
//         gcpVersion: versionId,
//         dbRecord: result.rows[0],
//       });
//     } catch (error) {
//       console.error('🚨 Error creating secret in GCP:', error.message);
//       res.status(500).json({ error: 'Failed to create secret: ' + error.message });
//     }
//   };

//   // 📋 3. Get all secrets (with optional fetch=true to include values)
//   const getAllSecrets = async (req, res) => {
//     const includeValues = req.query.fetch === 'true';

//     try {
//       const result = await db.query('SELECT * FROM secret_manager ORDER BY created_at DESC');
//       const rows = result.rows;

//       if (!includeValues) {
//         return res.status(200).json(rows);
//       }

//       // Add secret values if ?fetch=true
//       const enriched = await Promise.all(
//         rows.map(async (row) => {
//           try {
//             const name = `projects/${GCLOUD_PROJECT_ID}/secrets/${row.secret_manager_id}/versions/${row.version}`;
//             const [accessResponse] = await secretClient.accessSecretVersion({ name });
//             const value = accessResponse.payload.data.toString('utf8');
//             return { ...row, value };
//           } catch (err) {
//             return { ...row, value: '[ERROR: Cannot fetch]' };
//           }
//         })
//       );

//       res.status(200).json(enriched);
//     } catch (error) {
//       console.error('Error fetching secrets:', error);
//       res.status(500).json({ error: 'Failed to fetch secrets' });
//     }
//   };

//   return {
//     getAllSecrets,
//     fetchSecretValueFromGCP,
//     createSecretInGCP,
//   };
// };
// const docDB = require('../config/docDB');
// const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
// const fs = require('fs');
// const path = require('path');
// const os = require('os');

// let secretClient;

// // Decode base64 key and write to temp file ONCE
// function setupGCPClientFromBase64() {
//   try {
//     const base64Key = process.env.GCS_KEY_BASE64;
//     if (!base64Key) {
//       throw new Error('❌ GCS_KEY_BASE64 is not set');
//     }

//     console.log('🔑 Decoding GCP service account key...');
    
//     // Remove quotes if they exist and clean whitespace
//     const cleanedBase64 = base64Key
//       .replace(/^["']|["']$/g, '')  // Remove surrounding quotes
//       .trim()
//       .replace(/\s/g, '');           // Remove all whitespace
    
//     // Decode base64
//     const keyJson = Buffer.from(cleanedBase64, 'base64').toString('utf8');
    
//     // Parse and validate JSON
//     const keyObject = JSON.parse(keyJson);
    
//     if (!keyObject.private_key || !keyObject.client_email || !keyObject.project_id) {
//       throw new Error('❌ Invalid GCP key structure: missing required fields');
//     }
    
//     console.log('✅ GCP key decoded successfully');
//     console.log('📧 Service account:', keyObject.client_email);
//     console.log('📦 Project ID:', keyObject.project_id);
    
//     // Write properly formatted JSON to temp file
//     const tempFilePath = path.join(os.tmpdir(), 'gcp-key.json');
//     fs.writeFileSync(tempFilePath, JSON.stringify(keyObject, null, 2), 'utf8');
    
//     // Set credentials path
//     process.env.GOOGLE_APPLICATION_CREDENTIALS = tempFilePath;
    
//     console.log('📝 Credentials written to:', tempFilePath);

//     // Initialize Secret Manager client
//     secretClient = new SecretManagerServiceClient();
//     console.log('✅ Secret Manager client initialized successfully');
    
//   } catch (error) {
//     console.error('❌ Error setting up GCP client:', error.message);
//     if (error.stack) {
//       console.error('Stack trace:', error.stack);
//     }
//     throw error;
//   }
// }

// // Initialize on module load
// if (!secretClient) {
//   setupGCPClientFromBase64();
// }

// const GCLOUD_PROJECT_ID = process.env.GCS_PROJECT_ID;
// if (!GCLOUD_PROJECT_ID) {
//   throw new Error('❌ GCS_PROJECT_ID not set in env');
// }

// console.log('🔐 Using GCP Project ID:', GCLOUD_PROJECT_ID);

// // 🔐 1. Fetch secret value from GCP by internal ID
// const fetchSecretValueFromGCP = async (req, res) => {
//   const { id } = req.params;

//   try {
//     console.log('📦 Fetching secret config from docDB for ID:', id);

//     const result = await docDB.query(
//       'SELECT secret_manager_id, version FROM secret_manager WHERE id = $1',
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: '❌ Secret config not found in docDB' });
//     }

//     const { secret_manager_id, version } = result.rows[0];
//     const secretName = `projects/${GCLOUD_PROJECT_ID}/secrets/${secret_manager_id}/versions/${version}`;

//     console.log('🔐 Fetching from GCP Secret Manager:', secretName);

//     const [accessResponse] = await secretClient.accessSecretVersion({ name: secretName });
//     const secretValue = accessResponse.payload.data.toString('utf8');

//     res.status(200).json({
//       secretManagerId: secret_manager_id,
//       version,
//       value: secretValue,
//     });
//   } catch (err) {
//     console.error('🚨 Error in fetchSecretValueFromGCP:', err.message);
//     res.status(500).json({ error: 'Internal Server Error: ' + err.message });
//   }
// };

// // 📥 2. Create secret in GCP and insert into docDB
// const createSecretInGCP = async (req, res) => {
//   const {
//     name,
//     description,
//     secret_manager_id,
//     secret_value,
//     version = '1',
//     created_by = 1,
//     template_type = 'system',
//     status = 'active',
//     usage_count = 0,
//     success_rate = 0,
//     avg_processing_time = 0,
//     template_metadata = {},
//   } = req.body;

//   try {
//     console.log('🆕 Creating secret in GCP:', secret_manager_id);
    
//     const parent = `projects/${GCLOUD_PROJECT_ID}`;
//     const secretName = `${parent}/secrets/${secret_manager_id}`;

//     // Check if the secret already exists
//     let exists = false;
//     try {
//       await secretClient.getSecret({ name: secretName });
//       exists = true;
//       console.log(`ℹ️ Secret already exists: ${secret_manager_id}`);
//     } catch (err) {
//       if (err.code !== 5) { // 5 = NOT_FOUND
//         throw err;
//       }
//     }

//     if (!exists) {
//       console.log(`🆕 Creating new secret: ${secret_manager_id}`);
//       await secretClient.createSecret({
//         parent,
//         secretId: secret_manager_id,
//         secret: { 
//           replication: { 
//             automatic: {} 
//           } 
//         },
//       });
//       console.log('✅ Secret created successfully');
//     }

//     // Add secret version
//     console.log('📝 Adding secret version...');
//     const [versionResponse] = await secretClient.addSecretVersion({
//       parent: secretName,
//       payload: { data: Buffer.from(secret_value, 'utf8') },
//     });

//     const versionId = versionResponse.name.split('/').pop();
//     console.log('✅ Version added:', versionId);

//     // Insert into docDB
//     console.log('💾 Inserting metadata into docDB...');
//     const result = await docDB.query(
//       `
//       INSERT INTO secret_manager (
//         id, name, description, template_type, status,
//         usage_count, success_rate, avg_processing_time,
//         created_by, updated_by, created_at, updated_at,
//         activated_at, last_used_at, template_metadata,
//         secret_manager_id, version
//       ) VALUES (
//         gen_random_uuid(), $1, $2, $3, $4,
//         $5, $6, $7,
//         $8, $8, now(), now(),
//         now(), NULL, $9::jsonb,
//         $10, $11
//       ) RETURNING *;
//       `,
//       [
//         name,
//         description,
//         template_type,
//         status,
//         usage_count,
//         success_rate,
//         avg_processing_time,
//         created_by,
//         JSON.stringify(template_metadata),
//         secret_manager_id,
//         versionId,
//       ]
//     );

//     console.log('✅ Secret created successfully in both GCP and docDB');

//     res.status(201).json({
//       message: '✅ Secret created and version added to GCP',
//       gcpSecret: secret_manager_id,
//       gcpVersion: versionId,
//       dbRecord: result.rows[0],
//     });
//   } catch (error) {
//     console.error('🚨 Error creating secret in GCP:', error.message);
//     console.error('Error details:', error);
//     res.status(500).json({ 
//       error: 'Failed to create secret: ' + error.message,
//       details: error.code || 'Unknown error code'
//     });
//   }
// };

// // 📋 3. Get all secrets (with optional fetch=true to include values)
// const getAllSecrets = async (req, res) => {
//   const includeValues = req.query.fetch === 'true';

//   try {
//     console.log('📋 Fetching all secrets from docDB...');
//     const result = await docDB.query('SELECT * FROM secret_manager ORDER BY created_at DESC');
//     const rows = result.rows;

//     if (!includeValues) {
//       return res.status(200).json(rows);
//     }

//     // Add secret values if ?fetch=true
//     console.log('🔐 Fetching secret values from GCP...');
//     const enriched = await Promise.all(
//       rows.map(async (row) => {
//         try {
//           const name = `projects/${GCLOUD_PROJECT_ID}/secrets/${row.secret_manager_id}/versions/${row.version}`;
//           const [accessResponse] = await secretClient.accessSecretVersion({ name });
//           const value = accessResponse.payload.data.toString('utf8');
//           return { ...row, value };
//         } catch (err) {
//           console.error(`⚠️ Failed to fetch value for ${row.secret_manager_id}:`, err.message);
//           return { ...row, value: '[ERROR: Cannot fetch]' };
//         }
//       })
//     );

//     res.status(200).json(enriched);
//   } catch (error) {
//     console.error('🚨 Error fetching secrets from docDB:', error.message);
//     res.status(500).json({ error: 'Failed to fetch secrets: ' + error.message });
//   }
// };

// module.exports = {
//   getAllSecrets,
//   fetchSecretValueFromGCP,
//   createSecretInGCP,
// };


const docDB = require('../config/docDB');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const fs = require('fs');
const path = require('path');
const os = require('os');

let secretClient;

// Setup GCP client from base64 key
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
// Fetch all secrets (optionally with values and LLM name)
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
// Create secret in GCP and docDB with llm_id
// ---------------------
const createSecret = async (req, res) => {
  const {
    name,
    description,
    secret_manager_id,
    secret_value,
    llm_id,             // NEW: LLM ID
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

    // Check if secret exists
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

    // Add secret version
    const [versionResponse] = await secretClient.addSecretVersion({
      parent: secretName,
      payload: { data: Buffer.from(secret_value, 'utf8') },
    });
    const versionId = versionResponse.name.split('/').pop();

    // Insert metadata into docDB
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
// Fetch secret value by ID
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

    // Fetch LLM name
    const llmResult = await docDB.query('SELECT name FROM llm_models WHERE id = $1', [llm_id]);
    const llmName = llmResult.rows[0]?.name || null;

    res.status(200).json({ secret_manager_id, version, value, llm_id, llmName });
  } catch (err) {
    console.error('Error fetching secret value:', err.message);
    res.status(500).json({ error: 'Failed to fetch secret: ' + err.message });
  }
};

module.exports = {
  getAllSecrets,
  createSecret,
  fetchSecretValueById
};
