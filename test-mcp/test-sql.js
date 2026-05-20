const fs = require('fs');
const path = require('path');

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

async function runTest() {
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: 'SELECT version();',
      read_only: true
    })
  });

  const data = await response.json();
  console.log('Response Status:', response.status);
  console.log('Response Data:', JSON.stringify(data, null, 2));
}

runTest().catch(console.error);
