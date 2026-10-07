@echo off
chcp 65001 > nul
title HydroPrint - Gestione e Stampa Cartellini (Windows 11)

echo ================================================================
echo        HYDRO-MEC - GESTIONE E STAMPA CARTELLINI PRESTAMPATI
echo           Avvio Applicazione Ottimizzata per Windows 11
echo ================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ATTENZIONE] Node.js non e' installato o non e' presente nel PATH.
    echo Scarica e installa la versione LTS gratuita da: https://nodejs.org/
    echo Dopo l'installazione, riavvia questo file AVVIA_APP.bat.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo [1/2] Prima esecuzione rilevata.
    echo       Installazione automatica pacchetti e librerie con npm...
    call npm install --legacy-peer-deps || call npm install --force
    if %errorlevel% neq 0 (
        echo [ERRORE] Impossibile installare le dipendenze npm.
        pause
        exit /b 1
    )
    echo [OK] Dipendenze installate correttamente.
)

echo [2/2] Avvio del server locale HydroPrint su porta 3000...
echo.
echo L'applicazione verra' aperta automaticamente in Microsoft Edge
echo in modalita' applicazione desktop standalone:
echo http://localhost:3000
echo.
echo Per terminare l'applicazione, chiudi questa finestra o premi Ctrl+C.
echo ================================================================
echo.

rem Avvio Edge in modalita' App per esperienza desktop nativa senza barre browser
start msedge --app="http://localhost:3000" 2>nul || start "" "http://localhost:3000"

call npm run dev

pause
