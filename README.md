# Kitty Den Dash — Kitchen Status Dashboard

A kitchen status dashboard for a Raspberry Pi Zero 2 W with a 7" display (800×480px). Runs MagicMirror in server-only mode with Chromium in kiosk mode. No cloud dependency — everything runs locally on the Pi.

## What it shows

- **Clock** — built-in MagicMirror module
- **Weather** — current + 3-day forecast via NWS (no API key)
- **Home Assistant tiles** — thermostat, presence, doors, laundry, pool (via REST API)
- **Air quality** — Purple Air (Phase 3)

## Quick start (on the Pi)

```bash
# Clone the repo
git clone https://github.com/matt-drazba/Kitty-Den-Dash-2-0.git ~/Kitty-Den-Dash-2-0

# Run the setup script (~25 min first run)
bash ~/Kitty-Den-Dash-2-0/magicmirror/setup.sh

# Edit config: set lat/lon and HA host
nano ~/MagicMirror/config/config.js

# Test
cd ~/MagicMirror && node --run server
# Then open http://localhost:8080 in Chromium
```

## Architecture

```
Pi Zero 2 W
├── MagicMirror (node --run server, port 8080)
│   ├── clock
│   ├── weather (NWS, current + forecast)
│   └── MMM-homeassistant-sensors
└── Chromium --kiosk → http://localhost:8080
```

pm2 manages the MagicMirror process (restart on crash, survive reboot).
Chromium autostart lives in `~/.config/autostart/` — it waits for port 8080 before launching.

## Repo layout

```
magicmirror/
  config.js     ← source of truth — symlinked into ~/MagicMirror/config/
  setup.sh      ← one-shot Pi setup
artifacts/
  api-server/   ← V1 archive (superseded, do not edit)
```

## Secrets

`HA_TOKEN` (Home Assistant long-lived token) goes in `~/.profile` as an environment variable — never hardcoded in `config.js` or committed to the repo.

```bash
echo 'export HA_TOKEN=your_token_here' >> ~/.profile
source ~/.profile
```

## V1 archive

The original single-file Express/Replit dashboard is preserved in `artifacts/api-server/dashboard.html` and tagged `v1.0` in git.

## Stack

- MagicMirror² (MagicMirrorOrg/MagicMirror)
- Node.js LTS (installed by sdetweil's community installer)
- MMM-homeassistant-sensors (Snille)
- NWS weather provider (built-in, keyless)
- pm2 for process management
