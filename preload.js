const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Mood operations
    getMoods: () => ipcRenderer.invoke('get-moods'),
    saveMood: (moodData) => ipcRenderer.invoke('save-mood', moodData),

    // Chat operations
    getChatHistory: () => ipcRenderer.invoke('get-chat-history'),
    saveChatHistory: (chatHistory) => ipcRenderer.invoke('save-chat-history', chatHistory),
    askAI: (prompt) => ipcRenderer.invoke('ask-ai', prompt)
});
