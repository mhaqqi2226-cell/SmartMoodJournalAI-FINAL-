# Smart Mood Journal

Aplikasi pencatat suasana hati (mood tracker) yang terintegrasi dengan AI Psikolog. Proyek ini dibangun menggunakan **Electron** untuk versi desktop dan **Express.js** untuk versi web, memungkinkan aplikasi diakses secara lokal maupun dibagikan via link.

## 🚀 Cara Penggunaan

Cukup jalankan file **`start.bat`** di folder utama.

Akan muncul menu pilihan:
1. **Aplikasi Desktop**: Membuka aplikasi di window tersendiri (untuk penggunaan pribadi).
2. **Sharing Website**: Membuat server lokal dan link publik (HTTPS) agar aplikasi bisa dibuka oleh orang lain/dosen melalui browser mereka.

> **Catatan:** Untuk mode sharing, pastikan jendela terminal tetap terbuka agar link bisa diakses.

## 🛠 Instalasi

Jika baru pertama kali diunduh, install dulu dependensi yang dibutuhkan:

```bash
npm install
```

## ⚙️ Konfigurasi AI (Opsional)

Fitur chat psikolog menggunakan API dari OpenRouter. Agar berfungsi, buat file `.env` (bisa copy dari `.env.example`) dan isi API Key:

```env
OPENROUTER_API_KEY=masukkan_api_key_disini
```

## ✨ Fitur Utama

*   **Mood Tracker**: Catat emosi harian (Senang, Sedih, Netral, dll).
*   **Statistik**: Grafik mood 7 hari terakhir.
*   **AI Psikolog**: Chatbot untuk curhat dan konsultasi kesehatan mental ringan.
*   **Cross-Platform**: Bisa jalan sebagai software desktop atau website.
*   **Data Persistence**: Penyimpanan data otomatis menggunakan JSON lokal.

---
**UAS PAK NOSA - Sistem Teknologi Informasi**
