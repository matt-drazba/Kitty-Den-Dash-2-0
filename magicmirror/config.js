/* Kitty Den Dash — MagicMirror config
 *
 * DO NOT commit secrets. Set HA_TOKEN in your shell environment and
 * reference it via process.env.HA_TOKEN, or keep a config.js.local
 * that is .gitignored and symlinked on the Pi.
 *
 * Quick-start: copy this file to ~/MagicMirror/config/config.js on the Pi.
 */

let config = {
  address: "localhost",   // serveronly mode: same-Pi Chromium only
  port: 8080,
  basePath: "/",

  // width/height do nothing in serveronly mode — Chromium fullscreens under --kiosk
  // Set resolution in Pi display config (raspi-config or /boot/config.txt)

  language: "en",
  locale: "en-US",
  logLevel: ["INFO", "LOG", "WARN", "ERROR"],
  timeFormat: 12,
  units: "imperial",

  modules: [

    // ── Clock ──────────────────────────────────────────────────────────────
    {
      module: "clock",
      position: "top_left",
      config: {
        dateFormat: "dddd, MMMM Do",
        showSunTimes: false,
      },
    },

    // ── Current weather (NWS — no API key required) ────────────────────────
    // Replace lat/lon with your actual location.
    {
      module: "weather",
      position: "top_right",
      header: "Weather",
      config: {
        weatherProvider: "weathergov",
        type: "current",
        lat: 37.5,    // TODO: set your latitude
        lon: -122.2,  // TODO: set your longitude
      },
    },

    // ── 3-day forecast (same provider, no extra key) ───────────────────────
    {
      module: "weather",
      position: "top_right",
      header: "Forecast",
      config: {
        weatherProvider: "weathergov",
        type: "forecast",
        lat: 37.5,    // TODO: match above
        lon: -122.2,
        maxNumberOfDays: 3,
      },
    },

    // ── Home Assistant sensors ─────────────────────────────────────────────
    // Module: https://github.com/Snille/MMM-homeassistant-sensors
    // Install:
    //   cd ~/MagicMirror/modules
    //   git clone https://github.com/Snille/MMM-homeassistant-sensors
    //   cd MMM-homeassistant-sensors && npm install
    //
    // Long-lived token: HA → Profile → Long-Lived Access Tokens → Create token
    // HA_TOKEN env var: add to ~/.profile or hardcode here (keep out of git)
    {
      module: "MMM-homeassistant-sensors",
      position: "bottom_left",
      header: "Home",
      config: {
        host: "homeassistant.local", // TODO: set your HA host/IP
        port: 8123,
        https: false,
        token: process.env.HA_TOKEN || "REPLACE_WITH_TOKEN",
        updateInterval: 60, // seconds
        sensors: [
          // Add one at a time — uncomment as you confirm each entity ID in HA
          // { name: "Thermostat",  sensor: "climate.thermostat",      icons: { "default": "fa-thermometer-half" } },
          // { name: "Front Door",  sensor: "binary_sensor.front_door", icons: { "default": "fa-door-open" } },
          // { name: "Garage",      sensor: "binary_sensor.garage_door", icons: { "default": "fa-warehouse" } },
          // { name: "Who's Home",  sensor: "person.matt",              icons: { "default": "fa-user" } },
          // { name: "Laundry",     sensor: "switch.laundry_plug",      icons: { "default": "fa-tshirt" } },
          // { name: "Pool Temp",   sensor: "sensor.pool_temperature",  icons: { "default": "fa-water" } },
        ],
      },
    },

    // ── Air quality (Purple Air — Phase 3) ────────────────────────────────
    // Check community module list first: https://modules.magicmirror.builders
    // Purple Air API: api.purpleair.com/v1 — free read key, X-API-Key header
    // Uncomment when ready:
    // {
    //   module: "MMM-AirQuality",   // or custom MMM-PurpleAir module
    //   position: "bottom_right",
    //   config: {
    //     apiKey: process.env.PURPLE_AIR_KEY || "",
    //     sensorId: "",  // TODO: find your nearest sensor at map.purpleair.com
    //   },
    // },

  ],
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") { module.exports = config; }
