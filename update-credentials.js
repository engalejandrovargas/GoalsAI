#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 DreamPlan AI - Google OAuth Credentials Setup\n');

function updateEnvFile(filePath, key, value) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace existing value or add new line
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}="${value}"`);
    } else {
      content += `\n${key}="${value}"`;
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

async function promptForCredentials() {
  return new Promise((resolve) => {
    rl.question('Enter your Google Client ID: ', (clientId) => {
      rl.question('Enter your Google Client Secret: ', (clientSecret) => {
        resolve({ clientId: clientId.trim(), clientSecret: clientSecret.trim() });
      });
    });
  });
}

async function main() {
  try {
    const { clientId, clientSecret } = await promptForCredentials();
    
    if (!clientId || !clientSecret) {
      console.log('❌ Both Client ID and Client Secret are required');
      process.exit(1);
    }
    
    console.log('\n📝 Updating environment files...');
    
    // Update backend .env
    const backendEnv = path.join(__dirname, 'backend', '.env');
    updateEnvFile(backendEnv, 'GOOGLE_CLIENT_ID', clientId);
    updateEnvFile(backendEnv, 'GOOGLE_CLIENT_SECRET', clientSecret);
    
    // Update frontend .env
    const frontendEnv = path.join(__dirname, 'frontend', '.env');
    updateEnvFile(frontendEnv, 'VITE_GOOGLE_CLIENT_ID', clientId);
    
    console.log('\n🎉 Credentials updated successfully!');
    console.log('\n📚 Next steps:');
    console.log('1. Restart both servers (backend and frontend)');
    console.log('2. Visit http://localhost:5173');
    console.log('3. Click "Continue with Google" to test');
    console.log('\n🔒 Keep your credentials secure and never commit them to version control!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

main();