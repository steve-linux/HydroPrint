@echo off
chcp 65001 > nul
title Hydro-Mec - Gestione e Stampa Cartellini (Windows 11)

echo ================================================================
echo        HYDRO-MEC - GESTIONE E STAMPA CARTELLINI PRESTAMPATI
echo                  Avvio Applicazione su Windows 11
echo ================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ATTENZIONE] Node.js non e' installato o non e' nel PATH.
    echo Scarica e installa la versione LTS gratuita da: https://nodejs.org/
    echo Dopo l'installazione, riavvia questo file AVVIA_APP.bat.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo [1/2] Prima esecuzione rilevata.
    echo       Installazione automatica delle librerie in corso con npm...
    call npm install --legacy-peer-deps || call npm install --force
    if %errorlevel% neq 0 (
        echo [ERRORE] Errore durante l'installazione delle dipendenze.
        pause
        exit /b 1
    )
    echo [OK] Dipendenze installate con successo.
)

echo [2/2] Avvio del server locale Hydro-Mec...
echo.
echo L'applicazione verra' aperta automaticamente nel browser:
echo http://localhost:3000
echo.
echo Per chiudere l'applicazione chiudi questa finestra o premi Ctrl+C.
echo ================================================================

start "" "http://localhost:3000"
call npm run dev

pause
