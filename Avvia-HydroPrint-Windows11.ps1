# HydroPrint - Script di Avvio e Creazione Collegamento per Windows 11
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       HYDRO-MEC - GESTIONE E STAMPA CARTELLINI PRESTAMPATI" -ForegroundColor White
Write-Host "          Script PowerShell di Avvio per Windows 11" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verifica Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERRORE] Node.js non trovato. Installare Node.js LTS da https://nodejs.org/" -ForegroundColor Red
    Pause
    Exit 1
}

# 2. Crea collegamento Desktop se non esiste
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ShortcutFile = Join-Path $DesktopPath "Hydro-Mec Stampa Cartellini.lnk"

if (-not (Test-Path $ShortcutFile)) {
    try {
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut($ShortcutFile)
        $CurrentDir = (Get-Item -Path ".").FullName
        $Shortcut.TargetPath = Join-Path $CurrentDir "AVVIA_APP.bat"
        $Shortcut.WorkingDirectory = $CurrentDir
        $Shortcut.Description = "Avvia HydroPrint Cartellini Hydro-Mec su Windows 11"
        $Shortcut.Save()
        Write-Host "[OK] Collegamento creato con successo sul Desktop di Windows 11!" -ForegroundColor Green
    } catch {
        Write-Host "[INFO] Impossibile creare automaticamente il collegamento sul Desktop." -ForegroundColor Gray
    }
}

# 3. Verifica dipendenze
if (-not (Test-Path "node_modules")) {
    Write-Host "[1/2] Installazione librerie npm in corso..." -ForegroundColor Cyan
    npm install --legacy-peer-deps
}

# 4. Avvia browser Edge in modalita' app e avvia Vite
Write-Host "[2/2] Avvio del server locale HydroPrint..." -ForegroundColor Green
Start-Process "msedge" -ArgumentList "--app=http://localhost:3000" -ErrorAction SilentlyContinue

npm run dev
