# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Kitty Den Dash is a kitchen status dashboard on an 800×480 HDMI panel, driven by a Raspberry Pi Zero 2 W running Chromium in kiosk mode. The Pi is a **pure thin client** — it renders a MagicMirror² page served from the NAS. No cloud dependency; everything runs on the local network.

Architecture:
```
WD My Cloud EX2 Ultra (NAS)          Pi Zero 2 W (display)
├── MagicMirror (node --run server)  └── Chromium --kiosk → http://<nas-ip>:8080
│   port 8080, address 0.0.0.0
│   ├── clock         (built-in)
│   ├── weather       (built-in, openmeteo — no API key)
│   ├── weather       (forecast, same provider)
│   └── air quality   (PurpleAir — Phase 3)
```

The Replit Express server (`artifacts/api-server/`) is the V1 archive. **Do not edit it.**

## Deployment path decision

**Path B (NAS as interim server)** — decided 2026-06-19.

- MagicMirror server runs on the NAS (Docker, armv7). Pi Zero 2 W is kiosk-only.
- Home Assistant is **deferred**. The first HA tile worth having is **laundry** (power-monitoring plug). When that becomes the priority, a 64-bit host (Pi 4/5 or mini PC) will be added to run HA — at that point the MM server moves there too. **The Pi display setup does not change when that happens.**
- Pre-requisite check before starting Phase 1 (takes ~10 min on the NAS):
  ```bash
  docker info | grep -E "Architecture|Server Version"
  docker run --rm node:22-alpine node --version
  ```
  If that prints `v22.x.x`, Phase 1 is unblocked.

## Two-agent setup

| Agent | Environment | Owns |
|-------|-------------|------|
| Claude Code (this) | Local / VS Code | `CLAUDE.md`, local commits, pushing |
| Replit Agent | Replit workspace | `replit.md`, Replit platform config |

**Do not touch:** `.replit`, `replit.nix`, `artifacts/mockup-sandbox/` — Replit platform files.

## What lives in this repo

| Path | Purpose |
|------|---------|
| `magicmirror/config.js` | MagicMirror config — source of truth (deployed to NAS) |
| `magicmirror/setup.sh` | Pi thin-client setup (kiosk autostart, screen blanking) |
| `artifacts/api-server/dashboard.html` | V1 archive — do not edit |

Config is deployed to the NAS by symlink:
```bash
ln -sf ~/Kitty-Den-Dash-2-0/magicmirror/config.js ~/MagicMirror/config/config.js
```
`setup.sh` runs on the Pi, not the NAS.

## Hard constraints

- **No secrets in config.js** — API keys and `HA_TOKEN` go in `~/.profile` as env vars on the host that runs MagicMirror.
- **`width`/`height` do nothing in server-only mode** — resolution is set at the OS/display level on the Pi.
- **`address: "0.0.0.0"` + `ipWhitelist`** — required so the Pi can reach the MM server over the LAN. Start with `ipWhitelist: []` (allow all) to confirm connectivity, then restrict to the Pi's IP.
- **`node --run server`** — not `node serveronly` (old, broken syntax).
- **`node --run install-mm`** — not `npm install`.
- **`weather` module twice** — once `type: "current"`, once `type: "forecast"`. The old `weatherforecast` module is gone.
- **`openmeteo` for weather** — keyless, global coverage. `weathergov` is US-only.
- **Add modules one at a time** — check RAM after each with `htop` (1 GB on NAS, shared with file services).
- **Wayland on Pi OS Bookworm** — Chromium kiosk needs `--ozone-platform=wayland`, or switch to X11 in raspi-config first (simpler).
- **The sdetweil community installer is Pi OS-specific** — do not run it on the NAS. Use the manual MagicMirror install on the NAS.

## Git

Remote: `git@github.com:matt-drazba/Kitty-Den-Dash-2-0.git`
Auth: SSH via `~/.ssh/id_ed25519` — run `ssh-add ~/.ssh/id_ed25519` if the agent has no identities.

## Roadmap

### Phase 0 — Verify NAS can run MagicMirror (blocking)
Run the two-line Docker check above. If `node:22-alpine` runs on the NAS, proceed.

### Phase 1 — MagicMirror server on NAS
Manual install (not the sdetweil script — that's Pi-only):
```bash
git clone https://github.com/MagicMirrorOrg/MagicMirror.git
cd MagicMirror && node --run install-mm
cp config/config.js.sample config/config.js
```
Set `address: "0.0.0.0"`, `port: 8080`, `ipWhitelist: []`. Enable clock only.
Start: `node --run server`. Verify from another machine on the LAN.

### Phase 2 — Pi thin client (kiosk)
Chromium kiosk autostart in the desktop session, pointed at `http://<nas-ip>:8080`.
Guard launch with a wait-for-port-8080 check. Disable screen blanking / DPMS.
Verify: power-cycle Pi → dashboard loads unattended.

### Phase 3 — Weather + air quality
Add `weather` (current + forecast, `openmeteo`). Add PurpleAir air quality module.
Check modules.magicmirror.builders for an existing PurpleAir module before writing a custom one.

### Phase 4 — Laundry + Home Assistant (triggers 64-bit host purchase)
When laundry monitoring is the priority: add a 64-bit host (Pi 4/5 or mini PC, ≥2 GB RAM).
Run Home Assistant on it. Move the MM server there too (Pi display unchanged).
Use `Snille/MMM-homeassistant-sensors` with HA REST API + long-lived token.
Get entity IDs from HA → Developer Tools → States.
HA must NOT run on the NAS — it dropped 32-bit armv7 support as of 2025.12.

### Phase 5 — Hardening
- pm2 autostart for MM server (restart on crash, survive reboot)
- `pm2 startup` + `pm2 save`
- Full reboot test: both NAS and Pi recover unattended
