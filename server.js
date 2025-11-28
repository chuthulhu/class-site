const express = require('express');
const puppeteer = require('puppeteer-core');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Constants
const TOKENS_FILE = path.join(__dirname, 'tokens.json');
const SUBMIT_KEY = process.env.SUBMIT_KEY || 'S-2025-github2025subject'; // Default for dev, should be in .env

// Helper: Delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Get Current Time (KST)
function getKSTDate() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (9 * 60 * 60 * 1000));
}

function getTimestampStr() {
    const kst = getKSTDate();
    const yyyy = kst.getFullYear();
    const mm = String(kst.getMonth() + 1).padStart(2, '0');
    const dd = String(kst.getDate()).padStart(2, '0');
    const hh = String(kst.getHours()).padStart(2, '0');
    const min = String(kst.getMinutes()).padStart(2, '0');
    const ss = String(kst.getSeconds()).padStart(2, '0');
    return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
}

// --- MS Graph API Token Management ---

async function loadTokens() {
    try {
        const data = await fs.readFile(TOKENS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading tokens:', error.message);
        return null;
    }
}

async function saveTokens(tokens) {
    try {
        await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
    } catch (error) {
        console.error('Error saving tokens:', error.message);
    }
}

async function getAccessToken() {
    let tokens = await loadTokens();
    if (!tokens) throw new Error('No tokens found. Please authenticate first.');

    // Check if expired (simple check, assume 50 min validity to be safe)
    const now = Date.now();
    if (tokens.expires_at && now < tokens.expires_at) {
        return tokens.access_token;
    }

    console.log('Token expired, refreshing...');
    try {
        const params = new URLSearchParams();
        params.append('client_id', process.env.MS_CLIENT_ID);
        params.append('client_secret', process.env.MS_CLIENT_SECRET);
        params.append('refresh_token', tokens.refresh_token);
        params.append('grant_type', 'refresh_token');
        params.append('scope', 'Files.ReadWrite.All offline_access');

        const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', params);
        
        const newTokens = response.data;
        tokens.access_token = newTokens.access_token;
        if (newTokens.refresh_token) tokens.refresh_token = newTokens.refresh_token;
        tokens.expires_at = Date.now() + (newTokens.expires_in * 1000) - 60000; // Buffer 1 min

        await saveTokens(tokens);
        return tokens.access_token;
    } catch (error) {
        console.error('Error refreshing token:', error.response?.data || error.message);
        throw new Error('Failed to refresh token');
    }
}

// --- OneDrive Upload Logic ---

async function uploadToOneDrive(buffer, folderPath, filename) {
    const accessToken = await getAccessToken();
    const folderUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodeURIComponent(folderPath)}`;
    
    // Check if file exists to handle duplicates
    let finalFilename = filename;
    try {
        // Try to get file metadata
        await axios.get(`${folderUrl}/${encodeURIComponent(filename)}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        // If successful, file exists. Append timestamp.
        const ext = path.extname(filename);
        const name = path.basename(filename, ext);
        finalFilename = `${name}_${getTimestampStr()}${ext}`;
        console.log(`File exists. Renamed to: ${finalFilename}`);
    } catch (error) {
        if (error.response && error.response.status !== 404) {
            console.warn('Error checking file existence:', error.message);
        }
        // 404 means file doesn't exist, which is good.
    }

    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodeURIComponent(folderPath)}/${encodeURIComponent(finalFilename)}:/content`;

    try {
        await axios.put(uploadUrl, buffer, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/pdf', // or text/html
            }
        });
        console.log(`Uploaded: ${folderPath}/${finalFilename}`);
        return finalFilename;
    } catch (error) {
        console.error('Upload failed:', error.response?.data || error.message);
        throw error;
    }
}

// --- Main Submission Handler ---

app.post('/submit', async (req, res) => {
    // 1. Auth Check
    const clientKey = req.body.apiKey || req.headers['x-submission-key'];
    if (clientKey !== SUBMIT_KEY) {
        return res.status(401).json({ error: 'Invalid API Key' });
    }

    const { htmlContent, studentInfo, subject, activity } = req.body;

    if (!htmlContent || !studentInfo) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    let browser = null;
    try {
        // 2. Prepare Metadata
        const grade = String(studentInfo.grade || '').trim();
        const klass = String(studentInfo.class || '').trim().padStart(2, '0');
        const number = String(studentInfo.number || '').trim().padStart(2, '0');
        const name = String(studentInfo.name || '').trim();
        const studentId = `${grade}${klass}${number}`;
        
        const safeSubject = (subject || 'UnknownSubject').replace(/[\\/:*?"<>|]/g, '_');
        const safeActivity = (activity || 'UnknownActivity').replace(/[\\/:*?"<>|]/g, '_');
        const safeName = name.replace(/[\\/:*?"<>|]/g, '_');
        
        // Folder Structure: 과제제출/{과목}/{활동}/{반}/{학번}_{이름}
        // Note: '반' folder might be useful for sorting.
        const folderPath = `과제제출/${safeSubject}/${safeActivity}/${grade}학년${klass}반/${studentId}_${safeName}`;
        const baseFilename = `${studentId}_${safeName}_${safeActivity}`;

        // 3. Generate PDF
        console.log(`Generating PDF for ${studentId} ${name}...`);
        
        // Launch Puppeteer
        // Note: Adjust executablePath for your environment.
        // For Oracle Cloud ARM (Ubuntu), it's usually /usr/bin/chromium-browser
        // For local Windows dev, omit executablePath to use bundled Chromium or specify path.
        const launchOptions = {
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        };
        
        // Check if running on Linux (likely Oracle Cloud)
        if (process.platform === 'linux') {
            launchOptions.executablePath = '/usr/bin/chromium-browser';
        }

        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        
        // Set content
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
        });

        // 4. Upload to OneDrive
        console.log(`Uploading to OneDrive: ${folderPath}...`);
        
        // Upload PDF
        await uploadToOneDrive(pdfBuffer, folderPath, `${baseFilename}.pdf`);
        
        // Upload HTML (Backup)
        const htmlBuffer = Buffer.from(htmlContent, 'utf8');
        await uploadToOneDrive(htmlBuffer, folderPath, `${baseFilename}.html`);

        res.json({ success: true, message: 'Submission successful', submissionId: `${studentId}_${Date.now()}` });

    } catch (error) {
        console.error('Submission processing error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

// Health Check
app.get('/', (req, res) => {
    res.send('PDF Submission Server is running.');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
