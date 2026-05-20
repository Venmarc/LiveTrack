/* eslint-disable @typescript-eslint/no-require-imports */
// run_migration.js
// Applies a specified DDL migration SQL file to the remote Supabase project.
// Usage: node run_migration.js <filename.sql>

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getAccessToken() {
  if (process.env.SUPABASE_ACCESS_TOKEN) {
    return process.env.SUPABASE_ACCESS_TOKEN;
  }
  const paths = [
    path.resolve(__dirname, '.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env')
  ];
  for (const envPath of paths) {
    try {
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/^SUPABASE_ACCESS_TOKEN\s*=\s*(.*)$/m);
        if (match) {
          return match[1].trim();
        }
      }
    } catch (e) {
      // Ignore
    }
  }
  console.error('Error: SUPABASE_ACCESS_TOKEN is missing. Please set it in your .env file.');
  process.exit(1);
}

const accessToken = getAccessToken();
const projectRef = 'cftpqzjrlebgadvpmlfe';

// Get the migration file name from CLI arguments
const migrationFileName = process.argv[2];
if (!migrationFileName) {
  console.error('Error: Please specify the migration SQL file name.');
  console.error('Usage: node run_migration.js <filename.sql>');
  process.exit(1);
}

const sqlPath = path.join(__dirname, 'migrations', migrationFileName);
if (!fs.existsSync(sqlPath)) {
  console.error(`Error: SQL file not found at ${sqlPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');

const payload = {
  query: sql,
  read_only: false
};

const tempJsonPath = path.join(__dirname, `temp_payload_${Date.now()}.json`);
fs.writeFileSync(tempJsonPath, JSON.stringify(payload));

try {
  console.log(`Applying migration [${migrationFileName}] to Supabase project ${projectRef}...`);
  
  // Use curl with file payload to bypass TLS/certificate issues and handle queries safely
  const cmd = `curl -s -w "\\nHTTP_STATUS:%{http_code}" -X POST "https://api.supabase.com/v1/projects/${projectRef}/database/query" \
    -H "Authorization: Bearer ${accessToken}" \
    -H "Content-Type: application/json" \
    -d "@${tempJsonPath}"`;
    
  const response = execSync(cmd, { encoding: 'utf8' });
  
  const lines = response.split('\n');
  const statusLine = lines[lines.length - 1];
  const httpStatus = statusLine.split(':')[1];
  const body = lines.slice(0, -1).join('\n');
  
  console.log(`HTTP Status: ${httpStatus}`);
  if (httpStatus === '200' || httpStatus === '201') {
    console.log(`Success! Migration [${migrationFileName}] successfully applied.`);
    console.log(body);
  } else {
    console.error(`Error applying migration [${migrationFileName}]:`);
    console.error(body);
    process.exit(1);
  }
} catch (error) {
  console.error('Execution failed:', error.message);
  process.exit(1);
} finally {
  if (fs.existsSync(tempJsonPath)) {
    fs.unlinkSync(tempJsonPath);
  }
}
