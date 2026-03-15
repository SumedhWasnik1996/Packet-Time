# ⬡ PacketTime Debugger
### Visual Network Packet Time-Travel Debugging Tool

A dark-themed, interactive Windows desktop app for learning how network
protocols work — frame by frame, layer by layer.

---

## 10 Included Scenarios

| # | Scenario                  | Protocol       | Frames |
|---|---------------------------|----------------|--------|
| 1 | ARP Process               | ARP            | 7      |
| 2 | DHCP IP Assignment        | DHCP / UDP     | 4      |
| 3 | DNS Resolution            | DNS / UDP      | 6      |
| 4 | TCP 3-Way Handshake       | TCP            | 5      |
| 5 | HTTP/HTTPS Web Request    | HTTP / IP / L2 | 8      |
| 6 | TLS/SSL Handshake         | TLS 1.3        | 5      |
| 7 | ICMP Ping & Traceroute    | ICMP           | 5      |
| 8 | NAT Translation           | NAT / PAT      | 5      |
| 9 | BGP Routing               | BGP            | 5      |
|10 | UDP vs TCP Comparison     | TCP / UDP      | 5      |

---

## Setup (Windows) — 5 minutes

### Requirements
- Node.js 18+ → https://nodejs.org (download LTS)

### Install & Run

```
1. Extract this ZIP to a folder (e.g. C:\PacketTime)

2. Open a terminal in that folder:
   - Hold Shift + Right-click the folder → "Open PowerShell window here"

3. Install dependencies:
   npm install

4. Launch the app:
   npm start
```

### Build a standalone .exe (optional)

```
npm run build
```
The installer will appear in the `dist/` folder.

---

## How to Use

| Control          | Action                              |
|------------------|-------------------------------------|
| Sidebar          | Click any scenario to load it       |
| ▶ Play           | Auto-plays all frames               |
| ◀ / ▶ buttons   | Step one frame at a time            |
| Timeline slider  | Drag to jump to any frame           |
| Frame ticks      | Click any tick to jump there        |
| Speed slider     | Control playback speed (½× to 4×)   |
| Packet tab       | View all packet fields (changed = amber) |
| Log tab          | Read multi-line explanation for each frame |
| Diff tab         | See exactly what changed vs previous frame |
| Path tab         | See full network path + scenario description |
| Node click (SVG) | Jump to the frame where that device is active |
| ↺ Replay        | Replay from current frame           |

---

## Project Structure

```
packettime/
├── main.js          — Electron main process (window creation)
├── package.json     — Dependencies + build config
├── src/
│   ├── index.html   — App UI (HTML + CSS + JS, all in one)
│   ├── scenarios.js — All 10 scenario data (frames, packets, logs)
│   └── preload.js   — Electron context bridge
```

---

Built with Electron 28 + vanilla JS. No frameworks, no bundler needed.
