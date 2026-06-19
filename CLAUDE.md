# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Jeeves is a kitchen status dashboard running on a Raspberry Pi Zero 2 W with a 7" display (800×480px). The Pi runs Chromium in kiosk mode pointed at a locally-hosted MagicMirror server. **Everything runs on the Pi — no cloud dependency.**

Architecture:
```
Pi Zero 2 W
├── MagicMirror (node --run server, port 8080)
│   ├── clock         (built-in)
│   ├── weather       (built-in, NWS — no API key)
│   ├── weather       (forecast, same provider)
│   └── MMM-homeassistant-sensors  (community module)
└── Chromium --kiosk → http://localhost:8080
```

The Replit Express server (`artifacts/api-server/`) is the V1 archive. It is **superseded** and should not be edited going forward. The canonical config now lives in `magicmirror/`.

## Two-agent setup

This repo is worked on by two AI agents. Respect the boundary:

| Agent | Environment | Owns |
|-------|-------------|------|
| Claude Code (this) | Local / VS Code | `CLAUDE.md`, local commits, pushing |
| Replit Agent | Replit workspace | `replit.md`, Replit platform config |

**Do not touch:** `.replit`, `replit.nix`, `artifacts/mockup-sandbox/` — Replit platform files.

`replit.md` and `CLAUDE.md` are separate files for separate tools — not duplicates.

## What lives in this repo

| Path | Purpose |
|------|---------|
| `magicmirror/config.js` | MagicMirror config — source of truth |
| `magicmirror/setup.sh` | One-shot Pi setup script |
| `artifacts/api-server/dashboard.html` | V1 archive — do not edit |

**Do not track** the full `~/MagicMirror` install directory. Only `config.js` and any custom `MMM-*` modules belong in the repo. Symlink them into the install on the Pi:

```bash
ln -sf ~/Jeeves/magicmirror/config.js ~/MagicMirror/config/config.js
```

## Hard constraints

- **No secrets in config.js** — `HA_TOKEN` and any API keys go in `~/.profile` as env vars, not in the file.
- **width/height are not set in config.js** — they do nothing in serveronly mode. Resolution is set at the OS/display level.
- **NWS for weather** — not OpenWeatherMap. NWS is keyless and has no sign-up friction.
- **MMM-homeassistant-sensors** (Snille) — not MMM-HomeAssistant-Items or MMM-HomeAssistantDisplay.
- **Add modules one at a time** — verify RAM headroom with `htop` after each addition. 512MB is tight.
- **node --run server** — not `node serveronly` (old, broken syntax).

## Git

Remote: `https://github.com/matt-drazba/Jeeves.git`
Auth: HTTPS via osxkeychain.

## Roadmap

### Phase 1 — Pi kiosk + MagicMirror (current)
Run `magicmirror/setup.sh` on the Pi. Verify clock + weather render before proceeding.

### Phase 2 — Home Assistant sensors
Uncomment sensors in `magicmirror/config.js` one at a time. Start with thermostat, then presence, then doors. HA running in Docker on the NAS.

### Phase 3 — Purple Air / air quality
Check community module list at modules.magicmirror.builders first. Custom module is ~50 lines if nothing fits (polls api.purpleair.com/v1, X-API-Key header).

### Phase 4 — Hardening
- zram enabled at runtime
- pm2 restart policies
- Watchdog for Chromium crash recovery
