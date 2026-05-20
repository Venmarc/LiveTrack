/* eslint-disable @typescript-eslint/no-require-imports */
// seed.js
// Seeds the database with three mock drivers using the Supabase project Ref and API.

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

const sql = `
-- Clean up any existing mock driver profiles to allow idempotent runs
DELETE FROM public.profiles WHERE id IN ('user_driver_1', 'user_driver_2', 'user_driver_3');

-- Seed Mock Drivers
INSERT INTO public.profiles (id, role, full_name, avatar_url, base_location, max_active_shipments, created_at)
VALUES 
  ('user_driver_1', 'driver', 'Alex Courier', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex', '{"lat": 51.5074, "lng": -0.1278, "address": "London Port Logistics", "city": "London"}', 5, NOW()),
  ('user_driver_2', 'driver', 'Sarah Delivery', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah', '{"lat": 52.4862, "lng": -1.8904, "address": "Birmingham Distribution Hub", "city": "Birmingham"}', 5, NOW()),
  ('user_driver_3', 'driver', 'Dave Transporter', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Dave', '{"lat": 51.4545, "lng": -2.5879, "address": "Bristol Freight Depot", "city": "Bristol"}', 5, NOW());
`;

const payload = {
  query: sql,
  read_only: false
};

const tempJsonPath = path.join(__dirname, `temp_seed_${Date.now()}.json`);
fs.writeFileSync(tempJsonPath, JSON.stringify(payload));

try {
  console.log(`Seeding mock driver profiles to Supabase project ${projectRef}...`);
  
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
    console.log('Success! Mock drivers successfully seeded.');
    console.log(body);
  } else {
    console.error('Error seeding mock drivers:');
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
