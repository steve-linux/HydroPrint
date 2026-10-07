#!/usr/bin/env bash
set -e

# ================================================================
#        HYDRO-MEC - GESTIONE E STAMPA CARTELLINI PRESTAMPATI
#                  Avvio Applicazione su Linux
# ================================================================

echo "================================================================"
echo "       HYDRO-MEC - GESTIONE E STAMPA CARTELLINI PRESTAMPATI"
echo "                 Avvio Applicazione su Linux"
echo "================================================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Controlla se Node.js e npm sono installati
if ! command -v node >/dev/null 2>&1; then
    echo "[ERRORE] Node.js non è installato su questo sistema Linux."
    echo "Installalo con il gestore pacchetti della tua distribuzione:"
    echo "  - Ubuntu / Debian / Mint:  sudo apt update && sudo apt install -y nodejs npm"
    echo "  - Fedora / RHEL:           sudo dnf install -y nodejs npm"
    echo "  - Arch Linux / Manjaro:    sudo pacman -S nodejs npm"
    echo "  - openSUSE:                sudo zypper install nodejs npm"
    echo "Oppure scarica la versione LTS da: https://nodejs.org/"
    echo ""
    read -p "Premi INVIO per uscire..."
    exit 1
fi

echo "[INFO] Trovato Node.js: $(node -v) (npm: $(npm -v 2>/dev/null || echo 'ok'))"

# Se node_modules non esiste, installa le dipendenze
if [ ! -d "node_modules" ]; then
    echo "[1/2] Prima esecuzione: installazione pacchetti in corso con npm..."
    npm install --legacy-peer-deps || npm install --force
    echo "[OK] Pacchetti installati con successo."
fi

echo "[2/2] Avvio del server locale Hydro-Mec..."
echo "L'applicazione si aprirà su: http://localhost:3000"
echo "Premi Ctrl+C in questa finestra per arrestare il server."
echo "================================================================"
echo ""

# Apri il browser predefinito
(
    sleep 1.5
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:3000" >/dev/null 2>&1 || true
    elif command -v gio >/dev/null 2>&1; then
        gio open "http://localhost:3000" >/dev/null 2>&1 || true
    elif command -v sensible-browser >/dev/null 2>&1; then
        sensible-browser "http://localhost:3000" >/dev/null 2>&1 || true
    elif python3 -c "import webbrowser" >/dev/null 2>&1; then
        python3 -m webbrowser "http://localhost:3000" >/dev/null 2>&1 || true
    fi
) &

exec npm run dev
