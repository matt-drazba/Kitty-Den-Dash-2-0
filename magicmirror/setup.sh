#!/usr/bin/env bash
# Kitty Den Dash — Pi setup script (run this on the Pi, not on Replit)
# Tested against Raspberry Pi OS Lite (64-bit), Pi Zero 2 W
# Run as the pi user, not root.
set -euo pipefail

echo "=== Kitty Den Dash Pi setup ==="

# ── 1. Add swap/zram before install (512MB OOM protection) ────────────────
echo ">>> Adding swap..."
if [ ! -f /var/swap ]; then
  sudo dphys-swapfile swapoff 2>/dev/null || true
  sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=512/' /etc/dphys-swapfile
  sudo dphys-swapfile setup
  sudo dphys-swapfile swapon
fi

# ── 2. Install MagicMirror via sdetweil's community installer ─────────────
#    Handles Node LTS install, clone, npm bootstrap — ~25 min on Zero 2 W
echo ">>> Installing MagicMirror (takes ~25 min — don't kill it if it goes quiet)..."
bash -c "$(curl -sL https://raw.githubusercontent.com/sdetweil/MagicMirror_scripts/master/raspberry.sh)"

# ── 3. Copy Kitty Den Dash config ─────────────────────────────────────────
#    Assumes this repo is cloned alongside MagicMirror at ~/Kitty-Den-Dash-2-0
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MM_DIR="$HOME/MagicMirror"

echo ">>> Copying config..."
cp "$REPO_DIR/magicmirror/config.js" "$MM_DIR/config/config.js"
echo "    Edit $MM_DIR/config/config.js to set your lat/lon and HA host."

# ── 4. Install MMM-homeassistant-sensors ──────────────────────────────────
echo ">>> Installing MMM-homeassistant-sensors..."
cd "$MM_DIR/modules"
if [ ! -d "MMM-homeassistant-sensors" ]; then
  git clone https://github.com/Snille/MMM-homeassistant-sensors
  cd MMM-homeassistant-sensors && npm install --production
  cd ..
fi

# ── 5. Set HA_TOKEN env var ───────────────────────────────────────────────
echo ""
echo ">>> ACTION REQUIRED: add your Home Assistant token to ~/.profile"
echo "    echo 'export HA_TOKEN=your_token_here' >> ~/.profile"
echo "    source ~/.profile"
echo ""

# ── 6. pm2 autostart for MM server (installer may have done this already) ─
echo ">>> Configuring pm2 autostart..."
if command -v pm2 &>/dev/null; then
  pm2 start "$MM_DIR/node_modules/.bin/mm2" --name "MagicMirror" -- --serveronly 2>/dev/null || \
  pm2 start "$MM_DIR/serveronly" --name "MagicMirror" 2>/dev/null || \
  echo "    pm2 start: check ~/MagicMirror for correct entry point"
  pm2 startup systemd -u pi --hp /home/pi | tail -1 | bash || true
  pm2 save
else
  echo "    pm2 not found — sdetweil installer should have set it up. Check manually."
fi

# ── 7. Chromium kiosk autostart (desktop session, not rc.local) ───────────
echo ">>> Adding Chromium kiosk to desktop autostart..."
mkdir -p "$HOME/.config/autostart"
cat > "$HOME/.config/autostart/kitty-den-dash-kiosk.desktop" <<'EOF'
[Desktop Entry]
Type=Application
Name=Kitty Den Dash Kiosk
# Wait until MM server is listening on 8080 before launching Chromium
Exec=bash -c 'until curl -sf http://localhost:8080 >/dev/null; do sleep 2; done; chromium-browser --kiosk --noerrdialogs --disable-infobars --disable-session-crashed-bubble --app=http://localhost:8080'
EOF

echo ""
echo "=== Setup complete ==="
echo "Next steps:"
echo "  1. Edit ~/MagicMirror/config/config.js — set lat/lon, HA host, token"
echo "  2. Test: node --run server (in ~/MagicMirror) — then open http://localhost:8080"
echo "  3. Check RAM: htop — should have headroom before adding more modules"
echo "  4. Reboot to test full autostart"
echo ""
echo "Verify clock + weather work BEFORE enabling any HA sensors."
