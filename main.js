const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// Simple JSON storage
const userDataPath = app.getPath('userData');
const storePath = path.join(userDataPath, 'store.json');

// Initialize store
let store = { moods: [], chatHistory: [] };
if (fs.existsSync(storePath)) {
    try {
        store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    } catch (e) {
        console.error('Error reading store:', e);
    }
}

function saveStore() {
    try {
        fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
    } catch (e) {
        console.error('Error saving store:', e);
    }
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        backgroundColor: '#f4f6f9',
        titleBarStyle: 'default',
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    mainWindow.loadFile('renderer/index.html');

    // Open DevTools in development
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ===== IPC Handlers =====

// Get all moods from storage
ipcMain.handle('get-moods', async () => {
    return store.moods || [];
});

// Save mood to storage
ipcMain.handle('save-mood', async (event, moodData) => {
    if (!store.moods) store.moods = [];
    store.moods.push(moodData);
    saveStore();
    return { success: true };
});

// Get AI chat history
ipcMain.handle('get-chat-history', async () => {
    return store.chatHistory || [];
});

// Save chat history
ipcMain.handle('save-chat-history', async (event, chatHistory) => {
    store.chatHistory = chatHistory;
    saveStore();
    return { success: true };
});

// AI Chat with OpenRouter
ipcMain.handle('ask-ai', async (event, prompt) => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
        return {
            success: false,
            message: 'API Key belum diatur. Silakan tambahkan OPENROUTER_API_KEY di file .env'
        };
    }

    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'openai/gpt-oss-safeguard-20b',
                messages: [
                    {
                        role: 'system',
                        content: 'Kamu adalah asisten psikolog yang ramah dan empatik. Berikan saran yang membantu untuk kesehatan mental pengguna.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
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

        return {
            success: true,
            message: response.data.choices[0].message.content
        };
    } catch (error) {
        console.error('OpenRouter API Error:', error.response?.data || error.message);
        return {
            success: false,
            message: 'Maaf, AI sedang tidak tersedia. Periksa API key atau koneksi internet Anda.'
        };
    }
});
