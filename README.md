<div align="center">

# ⬡ Packet Time Debugger

**A visual, interactive network packet time-travel debugger — built as a Windows desktop app.**

Step through real network events frame by frame. Inspect packet headers, follow the OSI layers, watch data transform at every hop, and replay any moment — just like a code debugger, but for networking.

[![Electron](https://img.shields.io/badge/Electron-28-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?logo=windows&logoColor=white)](https://github.com/SumedhWasnik1996/Packet-Time/releases)
[![License](https://img.shields.io/github/license/SumedhWasnik1996/Packet-Time)](LICENSE)
[![Release](https://img.shields.io/github/v/release/SumedhWasnik1996/Packet-Time?include_prereleases)](https://github.com/SumedhWasnik1996/Packet-Time/releases)

</div>

---

## Download

Go to [**Releases**](https://github.com/SumedhWasnik1996/Packet-Time/releases) and download the latest:

| File | Type | Use |
|---|---|---|
| `PacketTime-Debugger-Setup-x.x.x.exe` | NSIS Installer | Recommended — installs with shortcuts |
| `PacketTime-Debugger-x.x.x-portable.exe` | Portable | Run without installing |

> **No Node.js required** to run the installer or portable — everything is bundled.

---

## 10 Network Scenarios

Each scenario is a fully annotated, frame-by-frame simulation with packet headers, OSI layer tracking, detailed logs, and a diff view showing exactly what changed between frames.

| # | Scenario | Protocol | Frames |
|---|---|---|---|
| 🔍 | ARP Process | ARP | 7 |
| 📋 | DHCP IP Assignment | DHCP / UDP | 4 |
| 🗺️ | DNS Resolution | DNS / UDP | 6 |
| 🤝 | TCP 3-Way Handshake | TCP | 5 |
| 🌐 | HTTP/HTTPS Web Request | HTTP / IP / Ethernet | 8 |
| 🔒 | TLS/SSL Handshake | TLS 1.3 | 5 |
| 📡 | ICMP Ping & Traceroute | ICMP | 5 |
| 🔄 | NAT Translation | NAT / PAT | 5 |
| 🗺️ | BGP Routing | BGP | 5 |
| ⚡ | UDP vs TCP Comparison | TCP / UDP | 5 |

---

## Features

- **Time-travel timeline** — drag the slider or click any frame tick to jump instantly to any moment in the simulation
- **Animated network topology** — packet dot moves between nodes with smooth transitions; traversed edges animate with flowing dashes
- **4 inspector tabs** — Packet (all headers), Log (per-line cards with explanations), Diff (changed fields highlighted), Path (network hop tracker)
- **Frame-by-frame diff** — changed packet fields highlighted in amber; new fields in green
- **Play / Pause / Replay** — auto-play at 5 speed levels (½× to 4×); the progress bar fills smoothly like a video player
- **Custom dark terminal theme** — frameless window, maximises on launch, custom min/max/close chrome
- **No frameworks, no bundler** — vanilla JS + Electron, easy to fork and extend

---

## Development Setup

### Requirements

- [Node.js 18+](https://nodejs.org) (LTS recommended)
- Windows 10/11 (for building the `.exe`)

### Run in development

```bash
git clone https://github.com/SumedhWasnik1996/Packet-Time.git
cd Packet-Time/packetTimeApp

# Install dependencies
npm install

# Copy env template and configure
cp .env.example .env
# Edit .env — set NODE_ENV=development

# Launch
npm start
```

Set `OPEN_DEVTOOLS=true` in `.env` to open Chrome DevTools automatically on launch.

### Build distributable

```bash
npm run build
```

Output goes to `dist/`. This produces:
- `PacketTime-Debugger-Setup-x.x.x.exe` — NSIS installer with Start Menu + Desktop shortcuts
- `PacketTime-Debugger-x.x.x-portable.exe` — single portable executable

### Build commands

| Command | Description |
|---|---|
| `npm start` | Launch (reads `NODE_ENV` from `.env`) |
| `npm run start:dev` | Force development mode |
| `npm run start:prod` | Force production mode |
| `npm run build` | Build installer + portable for Windows x64 |
| `npm run build:portable` | Build portable `.exe` only |
| `npm run clean` | Delete `dist/` folder |

### Environment variables

Copy `.env.example` to `.env` to configure your local setup:

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` enables DevTools; `production` disables them |
| `OPEN_DEVTOOLS` | `false` | Auto-open DevTools on launch (dev only) |
| `GH_TOKEN` | — | GitHub token for publishing releases locally |
| `ANTHROPIC_API_KEY` | — | _(Future)_ AI assistant feature |

> `.env` is gitignored — never committed. `.env.example` is committed and shows what variables exist.

---

## Project Structure

```
packetTimeApp/
├── main.js            — Electron main process (frameless window, IPC)
├── package.json       — Dependencies, build config, electron-builder settings
├── src/
│   ├── index.html     — Entire app UI (HTML + CSS + JS in one file)
│   ├── scenarios.js   — All 10 scenario definitions (frames, packets, logs)
│   └── preload.js     — Electron context bridge (window controls IPC)
└── dist/              — Built distributables (gitignored)
```

### Adding a new scenario

All scenarios live in `src/scenarios.js`. Each scenario follows this structure:

```js
{
  id: 'my_scenario',
  title: 'My Scenario',
  subtitle: 'Short description',
  icon: '🔧',
  color: '#58a6ff',           // accent colour used throughout the UI
  description: 'Longer description shown in the Path tab.',
  topology: [                 // nodes shown in the SVG canvas
    { id: 0, x: 100, y: 180, icon: '💻', label: 'Client', sub: '192.168.1.10' },
    { id: 1, x: 400, y: 180, icon: '🖥️', label: 'Server', sub: '10.0.0.1' },
  ],
  edges: [[0, 1]],            // connections between topology nodes
  frames: [
    {
      id: 0,
      name: 'Frame Name',
      device: 'Client',
      layer: 'Application',
      osiClass: 'osi-app',    // osi-app | osi-transport | osi-network | osi-link | osi-physical
      layerClass: 'layer-app',
      activeHop: 0,           // which topology node is active
      packet: {               // key-value pairs shown in Packet tab
        type: 'HTTP',
        srcIP: '192.168.1.10',
        dstIP: '10.0.0.1',
      },
      log: [                  // each string = one log card in Log tab
        'First log line.',
        'Second log line.',
        '',                   // empty string = visual gap between cards
        'After the gap.',
      ]
    },
  ]
}
```

---

## License

[Apache 2.0](LICENSE) © Sumedh Wasnik
