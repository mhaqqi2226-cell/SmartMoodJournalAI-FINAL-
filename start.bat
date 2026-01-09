@echo off
title Smart Mood Journal - Launcher

rem --- BAGIAN AUTO-INSTALL (AGAR DOSEN TINGGAL KLIK) ---
if not exist "node_modules" (
    echo ========================================================
    echo  SETUP PERTAMA KALI
    echo ========================================================
    echo  Folder sistem 'node_modules' belum ada.
    echo  Sedang menginstall otomatis agar aplikasi bisa jalan...
    echo  (Mohon tunggu sebentar, butuh internet...)
    echo ========================================================
    call npm install
    if errorlevel 1 (
        echo.
        echo  [GAGAL] Tidak bisa menginstall.
        echo  Pastikan Node.js sudah terinstall di komputer ini.
        pause
        exit
    )
    echo.
    echo  [SUKSES] Instalasi selesai!
    timeout /t 2 >nul
    cls
)

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
    )
)
rem -----------------------------------------------------

:menu
cls
echo ========================================================
echo   SMART MOOD JOURNAL - MENU UTAMA
echo ========================================================
echo.
echo   Mau jalankan yang mana?
echo.
echo   [1] Aplikasi Desktop (Untuk dipakai sendiri)
echo   [2] Sharing Website  (Dapat Link Publik untuk Teman)
echo   [3] Keluar
echo.
echo ========================================================
set /p pilihan="Ketik angka (1/2/3) lalu Enter: "

if "%pilihan%"=="1" goto desktop
if "%pilihan%"=="2" goto sharing
if "%pilihan%"=="3" exit

goto menu

:desktop
cls
echo.
echo Membuka Aplikasi Desktop...
start npm start
exit

:sharing
cls
echo ========================================================
echo   MODE SHARING - SMART MOOD JOURNAL
echo ========================================================
echo.
echo   [1/2] Menyalakan server website...
start /MIN cmd /c "npm run web"
timeout /t 3 >nul

echo   [2/2] Membuat link publik...
echo.
echo ========================================================
echo   LINK WEBSITE PUBLIK:
echo ========================================================
echo.
echo   Tunggu sebentar... Link akan muncul di bawah.
echo   Cari tulisan "Forwarding HTTP://..."
echo.
echo   Link tersebut bisa langsung dibuka teman TANPA password.
echo.
echo   PENTING: JANGAN TUTUP JENDELA INI SELAMA SHARING!
echo --------------------------------------------------------
ssh -o ServerAliveInterval=60 -R 80:localhost:3000 serveo.net
echo --------------------------------------------------------
pause
goto menu
