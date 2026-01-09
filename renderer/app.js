// ===== Mood Journal App =====
let moodData = [];
let chatHistory = [];
let chart;

// Initialize app
async function init() {
    // Load data from Electron store
    moodData = await window.electronAPI.getMoods();
    chatHistory = await window.electronAPI.getChatHistory();

    // Setup event listeners
    setupEventListeners();

    // Initialize chart
    initChart();

    // Render UI
    updateChart();
    showHistory();
    showSummary();
    renderChatHistory();
}

function setupEventListeners() {
    // Mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => saveMood(btn.dataset.mood));
    });

    // Theme toggle
    document.getElementById('toggle-theme').addEventListener('click', toggleTheme);

    // AI chat
    document.getElementById('askAI').addEventListener('click', askAI);
    document.getElementById('aiInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            askAI();
        }
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    document.getElementById('toggle-theme').textContent = isDark ? '☀️' : '🌙';
}

// ===== Mood Functions =====
async function saveMood(mood) {
    const today = new Date().toISOString().split('T')[0];
    const reflection = document.getElementById('reflectionInput').value;

    const moodEntry = {
        date: today,
        mood: mood,
        note: reflection,
        timestamp: new Date().toISOString()
    };

    moodData.push(moodEntry);
    await window.electronAPI.saveMood(moodEntry);

    document.getElementById('reflectionInput').value = '';

    updateChart();
    showSuggestion(mood);
    showHistory();
    showSummary();
    setThemeByMood(mood);
}

function getMoodCounts() {
    const counts = {};
    moodData.slice(-7).forEach(entry => {
        counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    });
    return counts;
}

function initChart() {
    const ctx = document.getElementById('moodChart');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Jumlah Mood',
                data: [],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(59, 130, 246, 0.8)'
                ],
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function updateChart() {
    const counts = getMoodCounts();
    chart.data.labels = Object.keys(counts);
    chart.data.datasets[0].data = Object.values(counts);
    chart.update();
}

function showSuggestion(mood) {
    const suggestion = document.getElementById('suggestion');
    const tips = {
        'Senang': '✨ Pertahankan semangat positifmu hari ini! Energi baikmu menular ke sekitar.',
        'Netral': '🎨 Coba lakukan hal kecil yang menyenangkan biar harimu lebih berwarna.',
        'Sedih': '💙 Gak apa-apa merasa sedih. Istirahat dulu dan tenangkan diri. Kamu tidak sendiri.',
        'Stres': '🧘‍♂️ Ambil napas dalam-dalam dan coba istirahat sebentar. Satu langkah kecil setiap waktu.',
        'Tenang': '✨ Waktu yang pas buat refleksi dan syukuri hal-hal kecil dalam hidup.',
        'Bersemangat': '💪 Gunakan energimu buat hal produktif hari ini! Kamu luar biasa!'
    };
    suggestion.innerHTML = tips[mood] || '';
}

function showHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    const recent = moodData.slice(-7).reverse();

    if (recent.length === 0) {
        historyList.innerHTML = '<li style="text-align:center; color: var(--text-secondary);">Belum ada riwayat mood</li>';
        return;
    }

    recent.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `
      <strong>${entry.date}</strong> - ${entry.mood}
      ${entry.note ? '<br><small>📝 ' + entry.note + '</small>' : ''}
    `;
        historyList.appendChild(li);
    });
}

function showSummary() {
    if (moodData.length < 7) {
        document.getElementById('summary').innerHTML = 'Catat mood minimal 7 hari untuk melihat ringkasan';
        return;
    }

    const last7 = moodData.slice(-7);
    const counts = {};
    last7.forEach(entry => {
        counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    });

    const dominantMood = Object.keys(counts).reduce((a, b) =>
        counts[a] > counts[b] ? a : b
    );

    const summaryText = {
        'Senang': '🌞 Mood kamu sering Senang minggu ini! Pertahankan energi positifmu!',
        'Sedih': '💙 Kamu tampak sering sedih minggu ini. Coba beri waktu untuk diri sendiri.',
        'Stres': '🧘‍♂️ Banyak hari stres minggu ini. Istirahatlah dan jaga keseimbangan hidup.',
        'Netral': '🎨 Minggu ini cukup stabil, tapi jangan lupa kasih warna di harimu.',
        'Tenang': '✨ Kamu tampak tenang minggu ini, semoga terus damai dan fokus.',
        'Bersemangat': '💪 Luar biasa! Minggu ini kamu bersemangat terus!'
    };

    document.getElementById('summary').innerHTML = summaryText[dominantMood] || '';
}

function setThemeByMood(mood) {
    const colors = {
        'Senang': '#fff8e1',
        'Sedih': '#e3f2fd',
        'Stres': '#fce4ec',
        'Tenang': '#e8f5e9',
        'Netral': '#f4f6f9',
        'Bersemangat': '#fff3e0'
    };

    if (!document.body.classList.contains('dark')) {
        document.body.style.background = colors[mood] || '#f8fafc';
    }
}

// ===== AI Chat Functions =====
function renderChatHistory() {
    const aiHistoryDiv = document.getElementById('aiHistory');
    aiHistoryDiv.innerHTML = '';

    if (chatHistory.length === 0) {
        aiHistoryDiv.innerHTML = '<div style="text-align:center; color: var(--text-secondary); padding: 2rem;">Mulai percakapan dengan AI psikolog 🤖</div>';
        return;
    }

    chatHistory.forEach(msg => {
        const div = document.createElement('div');
        div.className = msg.role === 'user' ? 'ai-message ai-user' : 'ai-message ai-bot';
        div.textContent = msg.content;
        aiHistoryDiv.appendChild(div);
    });

    aiHistoryDiv.scrollTop = aiHistoryDiv.scrollHeight;
}

async function askAI() {
    const input = document.getElementById('aiInput');
    const question = input.value.trim();
    const askBtn = document.getElementById('askAI');

    if (!question) return;

    // Disable button and show loading
    askBtn.disabled = true;
    askBtn.innerHTML = '<span class="btn-text">Mengirim...</span>';

    input.value = '';

    // Add user message
    chatHistory.push({ role: 'user', content: question });
    renderChatHistory();

    try {
        // Call AI through Electron IPC
        const response = await window.electronAPI.askAI(question);

        if (response.success) {
            chatHistory.push({ role: 'assistant', content: response.message });
        } else {
            chatHistory.push({
                role: 'assistant',
                content: '⚠️ ' + response.message
            });
        }

        await window.electronAPI.saveChatHistory(chatHistory);
        renderChatHistory();
    } catch (error) {
        chatHistory.push({
            role: 'assistant',
            content: '❌ Terjadi kesalahan. Pastikan API key sudah diatur dengan benar.'
        });
        renderChatHistory();
    } finally {
        // Re-enable button
        askBtn.disabled = false;
        askBtn.innerHTML = '<span class="btn-text">Kirim</span><span class="btn-icon">✨</span>';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
