<div align="center">

# ⬡ Packet Time Debugger

**A visual, interactive network packet time-travel debugger — Windows desktop app.**

Step through real network events frame by frame. Inspect packet headers, follow the OSI layers, watch data transform at every hop, and replay any moment — just like a code debugger, but for networking.

[![Electron](https://img.shields.io/badge/Electron-28-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?logo=windows&logoColor=white)](https://github.com/SumedhWasnik1996/Packet-Time/releases)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/SumedhWasnik1996/Packet-Time?include_prereleases)](https://github.com/SumedhWasnik1996/Packet-Time/releases)

</div>

---

## Download

Go to [**Releases**](https://github.com/SumedhWasnik1996/Packet-Time/releases) and grab the latest:

| File | Description |
|---|---|
| `PacketTime-Debugger-Setup-x.x.x.exe` | NSIS Installer — recommended, adds Start Menu + Desktop shortcuts |
| `PacketTime-Debugger-x.x.x-portable.exe` | Portable — run directly, no install needed |

> No Node.js required to run — everything is bundled inside the `.exe`.

---

## 10 Network Scenarios

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

## Project Structure

```
Packet-Time/                        ← repo root
├── packetTimeApp/                  ← Electron app
│   ├── src/
│   │   ├── index.html              ← entire UI (HTML + CSS + JS)
│   │   ├── scenarios.js            ← all 10 scenario definitions
│   │   └── preload.js              ← Electron IPC bridge
│   ├── main.js                     ← Electron main process
│   ├── package.json                ← dependencies + build config
│   ├── package-lock.json
│   ├── .env.example                ← environment variable template (committed)
│   └── .env                        ← your local secrets (gitignored)
├── .github/
│   └── workflows/
│       └── build-release.yml       ← CI/CD: auto-build + publish on version tag
├── .gitignore
├── LICENSE                         ← Apache 2.0
└── README.md
```

---

## Development Setup

### Prerequisites

| Tool | Version |
|---|---|
| [Node.js](https://nodejs.org) | 18 LTS or 20 LTS |
| Git | Any recent version |
| Windows | 10 / 11 (required to build `.exe`) |

### 1. Clone and install

```bash
git clone https://github.com/SumedhWasnik1996/Packet-Time.git
cd Packet-Time/packetTimeApp
npm install
```

### 2. Configure environment

```bash
# Copy the template — fill in your own values
cp .env.example .env
```

The `.env` file is gitignored and never committed. `.env.example` is committed and shows what variables are available.

### 3. Run in development

```bash
npm start
# or explicitly:
npm run start:dev
```

### 4. Build distributable

```bash
npm run build
# Output → packetTimeApp/dist/
```

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` enables DevTools; `production` disables them |
| `OPEN_DEVTOOLS` | `false` | Auto-open Chrome DevTools on launch |
| `GH_TOKEN` | — | GitHub token — only needed for publishing releases locally |
| `ANTHROPIC_API_KEY` | — | *(Future)* AI assistant feature |

### npm scripts

| Command | Description |
|---|---|
| `npm start` | Launch app (reads `.env`) |
| `npm run start:dev` | Force development mode |
| `npm run start:prod` | Force production mode |
| `npm run build` | Build installer + portable `.exe` for Windows x64 |
| `npm run build:portable` | Build portable `.exe` only |
| `npm run clean` | Delete `dist/` folder |

---

## Releasing

Releases are triggered automatically by pushing a version tag:

```bash
# Inside packetTimeApp/
npm version patch      # 1.0.0 → 1.0.1
npm version minor      # 1.0.0 → 1.1.0
npm version major      # 1.0.0 → 2.0.0

# Push the commit + tag — GitHub Actions does the rest
git push origin main --tags
```

GitHub Actions will build the `.exe` files and publish them to the Releases page automatically. No manual upload needed.

For a pre-release: `git tag v1.1.0-beta && git push origin v1.1.0-beta`

---

## License

[Apache 2.0](LICENSE) © 2025 Sumedh Wasnik
