const fs = require('fs');
const path = require('path');

// Setup robust logging first
const logFile = path.join(__dirname, 'server.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });
function fileLog(msg) {
    const logMsg = new Date().toISOString() + ': ' + msg + '\n';
    logStream.write(logMsg);
    // Also try to write to stderr so we might see it in console if possible
    process.stderr.write(logMsg);
}

process.on('uncaughtException', (err) => {
    fileLog('CRITICAL ERROR: ' + err.message);
    fileLog(err.stack);
    process.exit(1);
});

fileLog('Server initializing...');

try {
    const express = require('express');
    const axios = require('axios');
    require('dotenv').config();
    fileLog('Modules loaded successfully.');

    const app = express();

    // Try port 3000 first, fallback to random if busy (though usually we want fixed for user)
    // Let's stick to 3000 but handle errors.
    const PORT = process.env.PORT || 3000;

    app.use(express.json());
    app.use(express.static('public'));

    // Data handling
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
        fileLog('Created data directory');
    }
    const storePath = path.join(dataDir, 'web-store.json');

    let store = { moods: [], chatHistory: [] };
    if (fs.existsSync(storePath)) {
        try {
            store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
            fileLog('Store loaded');
        } catch (e) {
            fileLog('Error reading store: ' + e.message);
        }
    }

    function saveStore() {
        try {
            fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
        } catch (e) {
            fileLog('Error saving store: ' + e.message);
        }
    }

    // Routes
    app.get('/api/moods', (req, res) => res.json(store.moods || []));

    app.post('/api/moods', (req, res) => {
        if (!store.moods) store.moods = [];
        store.moods.push(req.body);
        saveStore();
        res.json({ success: true });
    });

    app.get('/api/chat-history', (req, res) => res.json(store.chatHistory || []));

    app.post('/api/chat-history', (req, res) => {
        store.chatHistory = req.body.chatHistory;
        saveStore();
        res.json({ success: true });
    });

    app.post('/api/ask-ai', async (req, res) => {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey || apiKey.trim() === '') {
            return res.json({ success: false, message: 'API Key belum diatur.' });
        }
        try {
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: 'openai/gpt-oss-safeguard-20b',
                    messages: [
                        { role: 'system', content: 'Kamu adalah asisten psikolog...' },
                        { role: 'user', content: req.body.prompt }
                    ]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://smartmoodjournal.app',
                        'X-Title': 'Smart Mood Journal'
                    }
                }
            );
            res.json({ success: true, message: response.data.choices[0].message.content });
        } catch (error) {
            fileLog('AI Error: ' + error.message);
            res.json({ success: false, message: 'AI sedang tidak tersedia.' });
        }
    });

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Start server with explicit error handling
    const server = app.listen(PORT, () => {
        const os = require('os');
        const interfaces = os.networkInterfaces();
        let localIp = 'localhost';

        // Find local IP
        Object.keys(interfaces).forEach((ifname) => {
            interfaces[ifname].forEach((iface) => {
                if (iface.family === 'IPv4' && !iface.internal) {
                    localIp = iface.address;
                }
            });
        });

        const startMsg = `Server successfully running on http://localhost:${PORT}`;
        fileLog(startMsg);

        console.log('\n================================================');
        console.log('   🚀 SMART MOOD JOURNAL - WEB SERVER');
        console.log('================================================');
        console.log(`\n✅ Server Berjalan! Akses melalui:`);
        console.log(`\n   🏠 Local:   http://localhost:${PORT}`);
        console.log(`   🌐 Network: http://${localIp}:${PORT}  (Bagikan link ini ke teman!)`);
        console.log(`\n📝 Tekan Ctrl+C untuk berhenti`);
        console.log('================================================\n');
    });

    server.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
            const fallbackPort = 3001;
            fileLog(`Port ${PORT} is in use! Trying ${fallbackPort}...`);
            app.listen(fallbackPort, () => {
                fileLog(`Server running on fallback port ${fallbackPort}`);
                console.log(`Port ${PORT} sibuk, server berjalan di port ${fallbackPort}`);
            });
        } else {
            fileLog('Server error: ' + e.message);
        }
    });

} catch (e) {
    fileLog('Setup Error: ' + e.message);
    fileLog(e.stack);
}
