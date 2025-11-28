const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
require('dotenv').config();

const CLIENT_ID = process.env.MS_CLIENT_ID;
const CLIENT_SECRET = process.env.MS_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/callback'; // Or whatever you registered
// If you registered a different redirect URI, change it here.
// For a CLI app, usually http://localhost is fine if registered.

const SCOPES = 'Files.ReadWrite offline_access User.Read';

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Error: MS_CLIENT_ID and MS_CLIENT_SECRET must be set in .env');
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getAuthUrl() {
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        response_mode: 'query',
        scope: SCOPES,
        state: '12345'
    });
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
}

async function getTokenFromCode(code) {
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
    });

    try {
        const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', params);
        return response.data;
    } catch (error) {
        console.error('Error getting token:', error.response?.data || error.message);
        throw error;
    }
}

async function main() {
    console.log('--- OneDrive Authentication Helper ---');
    console.log('1. Visit this URL in your browser:');
    console.log('');
    console.log(getAuthUrl());
    console.log('');
    console.log('2. Log in and accept permissions.');
    console.log('3. You will be redirected to a URL (e.g., http://localhost:3000/callback?code=...)');
    console.log('   (The page might fail to load, that is fine. Copy the URL from the address bar)');
    console.log('4. Copy the "code" parameter value from the URL.');
    
    rl.question('Enter the code here: ', async (code) => {
        try {
            const tokens = await getTokenFromCode(code.trim());
            console.log('Successfully obtained tokens!');
            
            // Add expiration time
            tokens.expires_at = Date.now() + (tokens.expires_in * 1000) - 60000;
            
            await fs.writeFile('tokens.json', JSON.stringify(tokens, null, 2));
            console.log('Saved to tokens.json');
        } catch (error) {
            console.error('Failed to authenticate.');
        } finally {
            rl.close();
        }
    });
}

main();
