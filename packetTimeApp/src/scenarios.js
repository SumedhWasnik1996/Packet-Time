// ============================================================
// PACKETTIME DEBUGGER — ALL SCENARIOS DATA
// ============================================================

const SCENARIOS = [

// ─────────────────────────────────────────────
// 1. ARP PROCESS
// ─────────────────────────────────────────────
{
  id: 'arp',
  title: 'ARP Process',
  subtitle: 'Address Resolution Protocol',
  icon: '🔍',
  color: '#e3b341',
  description: 'How a device discovers the MAC address of another device on the same network using ARP broadcast and reply.',
  topology: [
    { id: 0, x: 100, y: 180, icon: '💻', label: 'PC-A', sub: '192.168.1.10' },
    { id: 1, x: 300, y: 100, icon: '🔀', label: 'Switch', sub: 'Layer 2' },
    { id: 2, x: 500, y: 180, icon: '💻', label: 'PC-B', sub: '192.168.1.20' },
    { id: 3, x: 300, y: 260, icon: '🖨️', label: 'Printer', sub: '192.168.1.30' },
  ],
  edges: [[0,1],[1,2],[1,3]],
  frames: [
    {
      id: 0, name: 'PC-A Wants to Send to PC-B', device: 'PC-A', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 0,
      direction: null,
      packet: { type: 'ARP', subtype: 'Pending', srcIP: '192.168.1.10', dstIP: '192.168.1.20', srcMAC: 'AA:BB:CC:11:22:33', dstMAC: '??' },
      log: [
        'PC-A (192.168.1.10) has data to send to 192.168.1.20.',
        'PC-A checks its ARP cache. No entry found for 192.168.1.20.',
        'Without the MAC address, PC-A cannot create an Ethernet frame.',
        'PC-A must perform an ARP Request to discover the MAC address.',
        'The ARP process begins at the Network Layer (Layer 3).',
        'ARP cache status: EMPTY for target IP 192.168.1.20.'
      ]
    },
    {
      id: 1, name: 'ARP Broadcast Sent', device: 'PC-A', layer: 'Data Link', osiClass: 'osi-link', layerClass: 'layer-link', activeHop: 0,
      direction: 'broadcast',
      packet: { type: 'ARP Request', subtype: 'Broadcast', srcIP: '192.168.1.10', dstIP: '192.168.1.20', srcMAC: 'AA:BB:CC:11:22:33', dstMAC: 'FF:FF:FF:FF:FF:FF', opcode: '0x0001 (Request)' },
      log: [
        'PC-A constructs an ARP Request packet.',
        'ARP Opcode: 0x0001 — this is a Request.',
        'Sender MAC: AA:BB:CC:11:22:33 (PC-A\'s own MAC).',
        'Sender IP: 192.168.1.10 (PC-A\'s own IP).',
        'Target MAC: FF:FF:FF:FF:FF:FF — broadcast to ALL devices.',
        'Target IP: 192.168.1.20 — "Who has this IP? Tell 192.168.1.10".',
        'Ethernet destination: FF:FF:FF:FF:FF:FF (Layer 2 broadcast).',
        'The frame is transmitted to the switch for flooding.'
      ]
    },
    {
      id: 2, name: 'Switch Floods Broadcast', device: 'Switch', layer: 'Data Link', osiClass: 'osi-link', layerClass: 'layer-link', activeHop: 1,
      direction: 'flood',
      packet: { type: 'ARP Request', subtype: 'Flooded', srcIP: '192.168.1.10', dstIP: '192.168.1.20', srcMAC: 'AA:BB:CC:11:22:33', dstMAC: 'FF:FF:FF:FF:FF:FF', opcode: '0x0001 (Request)' },
      log: [
        'The switch receives the ARP broadcast frame on Port 1.',
        'Destination MAC is FF:FF:FF:FF:FF:FF — this is a broadcast.',
        'Switch Rule: broadcasts are FLOODED out all ports except the incoming port.',
        'The ARP Request is forwarded to Port 2 (PC-B) and Port 3 (Printer).',
        'The switch also learns: Port 1 = AA:BB:CC:11:22:33 (PC-A).',
        'This MAC learning entry is stored in the CAM table.',
        'All devices on the network will receive this ARP Request.'
      ]
    },
    {
      id: 3, name: 'PC-B Receives ARP Request', device: 'PC-B', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 2,
      direction: null,
      packet: { type: 'ARP Request', subtype: 'Received', srcIP: '192.168.1.10', dstIP: '192.168.1.20', srcMAC: 'AA:BB:CC:11:22:33', dstMAC: 'FF:FF:FF:FF:FF:FF', opcode: '0x0001 (Request)' },
      log: [
        'PC-B (192.168.1.20) receives the ARP Request frame.',
        'PC-B checks: "Is the Target IP (192.168.1.20) my IP?" — YES.',
        'PC-B also learns PC-A\'s mapping: 192.168.1.10 → AA:BB:CC:11:22:33.',
        'PC-B adds this to its own ARP cache for future use.',
        'PC-B must now send an ARP Reply directly back to PC-A.',
        'Printer also received the broadcast but ignores it (wrong target IP).'
      ]
    },
    {
      id: 4, name: 'ARP Reply Sent (Unicast)', device: 'PC-B', layer: 'Data Link', osiClass: 'osi-link', layerClass: 'layer-link', activeHop: 2,
      direction: 'unicast',
      packet: { type: 'ARP Reply', subtype: 'Unicast', srcIP: '192.168.1.20', dstIP: '192.168.1.10', srcMAC: 'DD:EE:FF:44:55:66', dstMAC: 'AA:BB:CC:11:22:33', opcode: '0x0002 (Reply)' },
      log: [
        'PC-B constructs an ARP Reply packet.',
        'ARP Opcode: 0x0002 — this is a Reply.',
        'Sender MAC: DD:EE:FF:44:55:66 (PC-B\'s MAC — the answer PC-A needed).',
        'Sender IP: 192.168.1.20.',
        'Target MAC: AA:BB:CC:11:22:33 (PC-A\'s MAC — direct reply).',
        'Target IP: 192.168.1.10.',
        'Unlike the Request, this Reply is UNICAST — sent directly to PC-A only.',
        'The frame is sent to the switch for forwarding.'
      ]
    },
    {
      id: 5, name: 'Switch Forwards ARP Reply', device: 'Switch', layer: 'Data Link', osiClass: 'osi-link', layerClass: 'layer-link', activeHop: 1,
      direction: 'forward',
      packet: { type: 'ARP Reply', subtype: 'Forwarded', srcIP: '192.168.1.20', dstIP: '192.168.1.10', srcMAC: 'DD:EE:FF:44:55:66', dstMAC: 'AA:BB:CC:11:22:33', opcode: '0x0002 (Reply)' },
      log: [
        'The switch receives the ARP Reply from PC-B on Port 2.',
        'Destination MAC is AA:BB:CC:11:22:33 — this is a UNICAST.',
        'The switch looks up AA:BB:CC:11:22:33 in its CAM table.',
        'Found: AA:BB:CC:11:22:33 is on Port 1.',
        'The frame is forwarded ONLY to Port 1 (PC-A). No flooding needed.',
        'Switch also learns: Port 2 = DD:EE:FF:44:55:66 (PC-B).'
      ]
    },
    {
      id: 6, name: 'ARP Cache Updated', device: 'PC-A', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 0,
      direction: null,
      packet: { type: 'ARP Complete', subtype: 'Cache Updated', srcIP: '192.168.1.10', dstIP: '192.168.1.20', srcMAC: 'AA:BB:CC:11:22:33', dstMAC: 'DD:EE:FF:44:55:66', opcode: 'Resolved', arpCache: '192.168.1.20 → DD:EE:FF:44:55:66' },
      log: [
        'PC-A receives the ARP Reply from PC-B.',
        'PC-A extracts the Sender MAC: DD:EE:FF:44:55:66.',
        'ARP Cache UPDATED: 192.168.1.20 → DD:EE:FF:44:55:66.',
        'This entry is cached for ~20 minutes (OS dependent).',
        'PC-A can now create proper Ethernet frames addressed to PC-B.',
        'ARP Process COMPLETE. Communication can begin.',
        'Future packets will skip ARP entirely — the cache will be used.'
      ]
    },
  ]
},

// ─────────────────────────────────────────────
// 2. DHCP IP ASSIGNMENT
// ─────────────────────────────────────────────
{
  id: 'dhcp',
  title: 'DHCP Assignment',
  subtitle: 'Dynamic Host Configuration Protocol',
  icon: '📋',
  color: '#3fb950',
  description: 'How a new device automatically gets an IP address, subnet mask, gateway, and DNS server from a DHCP server.',
  topology: [
    { id: 0, x: 80, y: 180, icon: '💻', label: 'New PC', sub: '0.0.0.0' },
    { id: 1, x: 250, y: 180, icon: '🔀', label: 'Switch', sub: 'Layer 2' },
    { id: 2, x: 420, y: 100, icon: '📡', label: 'Router/DHCP', sub: '192.168.1.1' },
    { id: 3, x: 420, y: 260, icon: '🖥️', label: 'DHCP Server', sub: '192.168.1.1' },
  ],
  edges: [[0,1],[1,2],[1,3],[2,3]],
  frames: [
    {
      id: 0, name: 'DHCP Discover (Broadcast)', device: 'New PC', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 0,
      packet: { type: 'DHCP Discover', srcIP: '0.0.0.0', dstIP: '255.255.255.255', srcMAC: 'CC:DD:EE:FF:00:11', dstMAC: 'FF:FF:FF:FF:FF:FF', srcPort: 68, dstPort: 67, transactionID: '0x3903F326' },
      log: [
        'A new PC connects to the network. It has no IP address yet.',
        'The PC sends a DHCP Discover message to find any DHCP server.',
        'Source IP: 0.0.0.0 — the PC has no IP yet.',
        'Destination IP: 255.255.255.255 — broadcast to all devices.',
        'Source Port: 68 (DHCP client), Destination Port: 67 (DHCP server).',
        'Transaction ID: 0x3903F326 — used to match replies to this request.',
        'The message is broadcast — all devices receive it, only DHCP servers respond.'
      ]
    },
    {
      id: 1, name: 'DHCP Offer', device: 'DHCP Server', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 3,
      packet: { type: 'DHCP Offer', srcIP: '192.168.1.1', dstIP: '255.255.255.255', srcMAC: 'AA:11:22:33:44:55', dstMAC: 'FF:FF:FF:FF:FF:FF', srcPort: 67, dstPort: 68, offeredIP: '192.168.1.50', leaseTime: '86400s (24h)', subnetMask: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8' },
      log: [
        'The DHCP Server receives the Discover message.',
        'The server selects an available IP from its pool: 192.168.1.50.',
        'DHCP Offer is sent with the proposed configuration:',
        '  → Offered IP: 192.168.1.50',
        '  → Subnet Mask: 255.255.255.0',
        '  → Default Gateway: 192.168.1.1',
        '  → DNS Server: 8.8.8.8',
        '  → Lease Time: 86400 seconds (24 hours)',
        'The IP is temporarily reserved for this client during negotiation.'
      ]
    },
    {
      id: 2, name: 'DHCP Request', device: 'New PC', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 0,
      packet: { type: 'DHCP Request', srcIP: '0.0.0.0', dstIP: '255.255.255.255', srcMAC: 'CC:DD:EE:FF:00:11', dstMAC: 'FF:FF:FF:FF:FF:FF', requestedIP: '192.168.1.50', serverID: '192.168.1.1', transactionID: '0x3903F326' },
      log: [
        'The PC receives one or more DHCP Offers (there may be multiple servers).',
        'The PC selects the first offer received (from 192.168.1.1).',
        'A DHCP Request is broadcast to formally accept the offered IP.',
        'The broadcast informs OTHER DHCP servers their offers were declined.',
        'The Request includes the Server Identifier so the chosen server knows it was selected.',
        'Still using 0.0.0.0 as source — the IP isn\'t assigned until the ACK.',
        'Transaction ID 0x3903F326 matches the original Discover.'
      ]
    },
    {
      id: 3, name: 'DHCP ACK — IP Assigned!', device: 'DHCP Server', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 3,
      packet: { type: 'DHCP ACK', srcIP: '192.168.1.1', dstIP: '255.255.255.255', assignedIP: '192.168.1.50', subnetMask: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8', leaseTime: '86400s', renewalTime: '43200s' },
      log: [
        'The DHCP Server sends a DHCP ACK to confirm the IP assignment.',
        'The IP 192.168.1.50 is now officially leased to CC:DD:EE:FF:00:11.',
        'Full configuration delivered:',
        '  → IP Address: 192.168.1.50',
        '  → Subnet Mask: 255.255.255.0 (/24)',
        '  → Default Gateway: 192.168.1.1',
        '  → DNS Server: 8.8.8.8',
        '  → Lease Duration: 24 hours',
        '  → Renewal Time: 12 hours (T1)',
        'The PC configures its network interface with these values.',
        'DHCP process complete. The PC is now fully connected to the network.'
      ]
    },
  ]
},

// ─────────────────────────────────────────────
// 3. DNS RESOLUTION
// ─────────────────────────────────────────────
{
  id: 'dns',
  title: 'DNS Resolution',
  subtitle: 'Domain Name System',
  icon: '🗺️',
  color: '#58a6ff',
  description: 'How a domain name like "example.com" is translated into an IP address through a chain of DNS servers.',
  topology: [
    { id: 0, x: 80,  y: 180, icon: '💻', label: 'Client', sub: '192.168.1.10' },
    { id: 1, x: 230, y: 180, icon: '📡', label: 'Local DNS', sub: '192.168.1.1' },
    { id: 2, x: 380, y: 80,  icon: '🌍', label: 'Root DNS', sub: '198.41.0.4' },
    { id: 3, x: 530, y: 80,  icon: '🏷️', label: 'TLD DNS', sub: '.com servers' },
    { id: 4, x: 380, y: 280, icon: '📛', label: 'Auth. DNS', sub: 'example.com NS' },
    { id: 5, x: 530, y: 280, icon: '✅', label: 'Answer', sub: '93.184.216.34' },
  ],
  edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[1,5]],
  frames: [
    {
      id: 0, name: 'Browser Requests example.com', device: 'Client PC', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 0,
      packet: { type: 'DNS Query', query: 'example.com', queryType: 'A Record (IPv4)', queryID: '0xA1B2', srcIP: '192.168.1.10', dstIP: '192.168.1.1', srcPort: 53124, dstPort: 53, proto: 'UDP' },
      log: [
        'The user types "example.com" in the browser.',
        'The OS checks its local DNS cache — no entry found.',
        'The OS also checks the hosts file — no entry.',
        'A DNS Query is sent to the configured DNS Resolver (192.168.1.1).',
        'Query Type: A Record — requesting an IPv4 address.',
        'Query ID: 0xA1B2 — used to match the response.',
        'Protocol: UDP on Port 53 (DNS uses UDP for queries under 512 bytes).'
      ]
    },
    {
      id: 1, name: 'Recursive Resolver Checks Cache', device: 'Local DNS Resolver', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 1,
      packet: { type: 'DNS Cache Check', query: 'example.com', cacheStatus: 'MISS', ttl: 'N/A', nextStep: 'Query Root Servers' },
      log: [
        'The local DNS resolver (recursive resolver) receives the query.',
        'It checks its own cache for "example.com" — CACHE MISS.',
        'The resolver must now perform a RECURSIVE lookup on behalf of the client.',
        'This means it will contact multiple DNS servers to find the answer.',
        'Starting the resolution chain: Root → TLD → Authoritative.',
        'The client waits while the resolver does all the work.',
        'This resolver is often provided by your ISP or Google (8.8.8.8) / Cloudflare (1.1.1.1).'
      ]
    },
    {
      id: 2, name: 'Query Root Name Server', device: 'Root DNS Server', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 2,
      packet: { type: 'DNS Referral', query: 'example.com', response: 'Referral to .com TLD', rootServer: 'a.root-servers.net (198.41.0.4)', referredTo: '.com TLD servers: 192.5.6.30, 192.26.92.30...', ttl: '518400s' },
      log: [
        'The resolver contacts one of 13 Root Name Servers (a-m.root-servers.net).',
        'Root servers know the authoritative servers for each Top-Level Domain.',
        'Response: "I don\'t have example.com, but here are the .com TLD servers."',
        'The Root Server returns a REFERRAL, not an answer.',
        'Referred to .com TLD servers: 192.5.6.30, 192.26.92.30, etc.',
        'There are 13 root server clusters with hundreds of anycast instances globally.',
        'TTL: 518400 seconds (6 days) — this referral is cached for a long time.'
      ]
    },
    {
      id: 3, name: 'Query .com TLD Server', device: '.com TLD Server', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 3,
      packet: { type: 'DNS Referral', query: 'example.com', response: 'Referral to Authoritative NS', tldServer: 'a.gtld-servers.net', referredTo: 'ns1.example.com (205.251.196.1)', ns2: 'ns2.example.com (205.251.197.1)', ttl: '172800s' },
      log: [
        'The resolver contacts the .com TLD server.',
        'TLD servers know which name servers are authoritative for each .com domain.',
        'Response: "I don\'t have the IP, but here are the name servers for example.com."',
        'Authoritative NS: ns1.example.com at 205.251.196.1',
        'Authoritative NS: ns2.example.com at 205.251.197.1',
        'Another REFERRAL — not the final answer yet.',
        'TTL: 172800 seconds (2 days) for this NS record.'
      ]
    },
    {
      id: 4, name: 'Query Authoritative DNS Server', device: 'Authoritative DNS', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 4,
      packet: { type: 'DNS Answer', query: 'example.com', answer: '93.184.216.34', recordType: 'A', authoritative: 'YES', ttl: '3600s', additionalRecords: 'AAAA: 2606:2800:220:1:248:1893:25c8:1946' },
      log: [
        'The resolver queries the authoritative name server for example.com.',
        'This server is THE authoritative source — it holds the actual DNS records.',
        'Response: AUTHORITATIVE ANSWER — example.com = 93.184.216.34.',
        'Record Type: A (IPv4 address).',
        'Also returned: AAAA record for IPv6: 2606:2800:220:1:248:1893:25c8:1946.',
        'TTL: 3600 seconds (1 hour) — the resolver can cache this for 1 hour.',
        'The resolver stores this in its cache and sends the answer back to the client.'
      ]
    },
    {
      id: 5, name: 'Answer Returned to Client', device: 'Client PC', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 5,
      packet: { type: 'DNS Response', query: 'example.com', resolvedIP: '93.184.216.34', queryID: '0xA1B2', totalTime: '~50ms', cached: 'YES (TTL 3600s)', nextStep: 'TCP connection to 93.184.216.34:80' },
      log: [
        'The local resolver returns the final answer to the client.',
        'example.com resolves to 93.184.216.34.',
        'Query ID 0xA1B2 matches the original request — confirmed.',
        'The client OS caches this result for the TTL duration (3600 seconds).',
        'Total DNS resolution time: approximately 50ms.',
        'Future requests for example.com will be answered from cache instantly.',
        'The browser can now initiate a TCP connection to 93.184.216.34 on Port 80.',
        'DNS Resolution COMPLETE. Next: TCP Handshake → HTTP Request.'
      ]
    },
  ]
},

// ─────────────────────────────────────────────
// 4. TCP 3-WAY HANDSHAKE
// ─────────────────────────────────────────────
{
  id: 'tcp',
  title: 'TCP 3-Way Handshake',
  subtitle: 'Transmission Control Protocol',
  icon: '🤝',
  color: '#a371f7',
  description: 'How a reliable TCP connection is established between a client and server using SYN, SYN-ACK, and ACK.',
  topology: [
    { id: 0, x: 100, y: 180, icon: '💻', label: 'Client', sub: '192.168.1.10:54321' },
    { id: 1, x: 300, y: 180, icon: '🌐', label: 'Internet', sub: 'Routers' },
    { id: 2, x: 500, y: 180, icon: '🖥️', label: 'Server', sub: '93.184.216.34:80' },
  ],
  edges: [[0,1],[1,2]],
  frames: [
    {
      id: 0, name: 'SYN — Client Initiates', device: 'Client', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 0,
      packet: { type: 'TCP SYN', srcIP: '192.168.1.10', dstIP: '93.184.216.34', srcPort: 54321, dstPort: 80, seq: 1000, ack: 0, flags: 'SYN', windowSize: '65535', mss: '1460' },
      log: [
        'The client initiates a TCP connection to the server.',
        'A SYN (Synchronize) segment is sent.',
        'Source Port: 54321 (random ephemeral port chosen by OS).',
        'Destination Port: 80 (HTTP).',
        'Sequence Number: 1000 (ISN — Initial Sequence Number, chosen randomly).',
        'The ISN is random to prevent old duplicate connection attacks.',
        'Window Size: 65535 — how many bytes the client can receive before ACK.',
        'MSS Option: 1460 bytes (Maximum Segment Size for Ethernet).',
        'ACK flag is 0 — nothing to acknowledge yet.',
        'Server state after receiving: SYN_RECEIVED.',
        'Client state: SYN_SENT.'
      ]
    },
    {
      id: 1, name: 'SYN-ACK — Server Responds', device: 'Server', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 2,
      packet: { type: 'TCP SYN-ACK', srcIP: '93.184.216.34', dstIP: '192.168.1.10', srcPort: 80, dstPort: 54321, seq: 5000, ack: 1001, flags: 'SYN, ACK', windowSize: '65535', mss: '1460' },
      log: [
        'The server receives the SYN and responds with SYN-ACK.',
        'SYN flag: Server is also synchronizing its own sequence numbers.',
        'ACK flag: Server acknowledges the client\'s SYN.',
        'Server\'s own Sequence Number: 5000 (server\'s random ISN).',
        'Acknowledgement Number: 1001 — "I received up to byte 1000, expecting 1001 next."',
        'ACK Number = Client\'s ISN + 1. This confirms the client\'s SYN was received.',
        'The server allocates resources for this connection (memory, sockets).',
        'Server state: SYN_RECEIVED → waiting for final ACK.',
        'Client state upon receiving SYN-ACK: ESTABLISHED (client side ready).'
      ]
    },
    {
      id: 2, name: 'ACK — Connection Established', device: 'Client', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 0,
      packet: { type: 'TCP ACK', srcIP: '192.168.1.10', dstIP: '93.184.216.34', srcPort: 54321, dstPort: 80, seq: 1001, ack: 5001, flags: 'ACK', windowSize: '65535', connectionState: 'ESTABLISHED' },
      log: [
        'The client sends the final ACK to complete the handshake.',
        'Sequence Number: 1001 (incremented from 1000).',
        'Acknowledgement Number: 5001 — "I received the server\'s SYN (seq 5000), expecting 5001."',
        'Only ACK flag is set — no SYN this time.',
        'Both sides now have confirmed sequence numbers for each other.',
        'Connection state: ESTABLISHED on both client and server.',
        'The three-way handshake is COMPLETE.',
        'Data transfer (HTTP request) can now begin.',
        'Total round trips to establish: 1.5 RTT (SYN → SYN-ACK → ACK).'
      ]
    },
    {
      id: 3, name: 'HTTP GET Request Sent', device: 'Client', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 0,
      packet: { type: 'TCP DATA + HTTP', srcIP: '192.168.1.10', dstIP: '93.184.216.34', srcPort: 54321, dstPort: 80, seq: 1001, ack: 5001, flags: 'ACK, PSH', httpMethod: 'GET', httpPath: '/', httpHost: 'example.com', dataBytes: 78 },
      log: [
        'With the TCP connection established, the client sends the HTTP GET request.',
        'TCP PSH flag: Push — instructs receiver to deliver data to application immediately.',
        'HTTP Request: GET / HTTP/1.1',
        'Host: example.com',
        'The TCP segment carries 78 bytes of HTTP payload.',
        'Sequence Number: 1001, next expected after this: 1079.',
        'This data travels inside the already-established TCP connection.',
        'Server will ACK this data and process the HTTP request.'
      ]
    },
    {
      id: 4, name: 'TCP Connection Close (FIN)', device: 'Client', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 0,
      packet: { type: 'TCP FIN', srcIP: '192.168.1.10', dstIP: '93.184.216.34', srcPort: 54321, dstPort: 80, seq: 1079, ack: 5001, flags: 'FIN, ACK', connectionState: 'FIN_WAIT_1' },
      log: [
        'After data exchange, the client initiates connection termination.',
        'FIN (Finish) flag sent — "I have no more data to send."',
        'TCP uses a 4-way FIN termination process (FIN, ACK, FIN, ACK).',
        'Client state: FIN_WAIT_1.',
        'The server will ACK the FIN, then send its own FIN.',
        'After the final ACK, both sides enter TIME_WAIT then close.',
        'TIME_WAIT lasts 2×MSL (Maximum Segment Lifetime) ≈ 60–240 seconds.',
        'This ensures all delayed packets in transit are discarded before reuse.'
      ]
    },
  ]
},

// ─────────────────────────────────────────────
// 5. DNS + TCP + HTTP FULL WEB REQUEST
// ─────────────────────────────────────────────
{
  id: 'http',
  title: 'HTTP/HTTPS Web Request',
  subtitle: 'Full end-to-end journey',
  icon: '🌐',
  color: '#58a6ff',
  description: 'Complete journey of a web request: ARP → DNS → TCP Handshake → HTTP GET → Response, across all OSI layers.',
  topology: [
    { id: 0, x: 60,  y: 180, icon: '💻', label: 'User PC', sub: '192.168.1.10' },
    { id: 1, x: 180, y: 120, icon: '🔀', label: 'Switch', sub: 'Layer 2' },
    { id: 2, x: 300, y: 180, icon: '📡', label: 'Router', sub: '192.168.1.1' },
    { id: 3, x: 420, y: 120, icon: '🌐', label: 'ISP', sub: 'ISP Router' },
    { id: 4, x: 540, y: 180, icon: '🖥️', label: 'Web Server', sub: '93.184.216.34' },
  ],
  edges: [[0,1],[1,2],[2,3],[3,4]],
  frames: [
    {
      id: 0, name: 'Request Created', device: 'User PC', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 0,
      packet: { type: 'HTTP', method: 'GET', url: 'http://example.com/', host: 'example.com', userAgent: 'Mozilla/5.0', proto: 'HTTP/1.1' },
      log: ['The browser generates an HTTP GET request for example.com.', 'This starts at the Application Layer (Layer 7).', 'At this stage: pure HTTP text — no TCP, IP, or Ethernet headers yet.', 'Next steps: DNS resolution → TCP handshake → HTTP send.']
    },
    {
      id: 1, name: 'TCP Header Added', device: 'User PC', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 0,
      packet: { type: 'TCP Segment', srcPort: 54321, dstPort: 80, seq: 1000, ack: 0, flags: 'SYN', proto: 'TCP' },
      log: ['Transport Layer wraps the HTTP data in a TCP segment.', 'Source Port: 54321 (ephemeral). Destination Port: 80 (HTTP).', 'SYN flag set — initiating TCP 3-way handshake.', 'Sequence Number: 1000 (random ISN).']
    },
    {
      id: 2, name: 'IP Packet Created', device: 'User PC', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 0,
      packet: { type: 'IP Packet', srcIP: '192.168.1.10', dstIP: '93.184.216.34', ttl: 64, proto: 'TCP (6)' },
      log: ['Network Layer encapsulates the TCP segment in an IP packet.', 'Source IP: 192.168.1.10, Destination IP: 93.184.216.34 (from DNS).', 'TTL: 64 — decremented at each router hop.', 'Protocol field: 6 (TCP).']
    },
    {
      id: 3, name: 'Ethernet Frame Created', device: 'User PC', layer: 'Data Link', osiClass: 'osi-link', layerClass: 'layer-link', activeHop: 0,
      packet: { type: 'Ethernet Frame', srcMAC: '00:1A:2B:3C:4D:5E', dstMAC: '00:AA:BB:CC:DD:EE', etherType: '0x0800 (IPv4)' },
      log: ['Data Link Layer wraps the IP packet in an Ethernet frame.', 'Destination MAC: 00:AA:BB:CC:DD:EE (router MAC, from ARP cache).', 'EtherType: 0x0800 = IPv4.', 'Frame is ready for physical transmission.']
    },
    {
      id: 4, name: 'Sent to Switch', device: 'Local Switch', layer: 'Physical', osiClass: 'osi-physical', layerClass: 'layer-physical', activeHop: 1,
      packet: { type: 'Ethernet Frame', srcMAC: '00:1A:2B:3C:4D:5E', dstMAC: '00:AA:BB:CC:DD:EE', signal: 'Electrical (1000BASE-T)' },
      log: ['Physical Layer: electrical signals on Cat6 cable.', 'Switch receives and decodes the frame.', 'Switch looks up destination MAC in CAM table.', 'Frame forwarded to router port.']
    },
    {
      id: 5, name: 'Router Processing', device: 'Home Router', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 2,
      packet: { type: 'IP Packet', srcIP: '192.168.1.10', dstIP: '93.184.216.34', ttl: 63, srcMAC: '00:FF:EE:DD:CC:BB', dstMAC: 'ISP-MAC' },
      log: ['Router strips Ethernet header (only valid for local segment).', 'Examines IP packet. Destination: 93.184.216.34 — external.', 'Consults routing table. Next hop: ISP router.', 'TTL decremented: 64 → 63.', 'New Ethernet frame created for WAN link.']
    },
    {
      id: 6, name: 'ISP Routing', device: 'ISP Router', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 3,
      packet: { type: 'IP Packet', srcIP: '192.168.1.10', dstIP: '93.184.216.34', ttl: 62, proto: 'BGP routed' },
      log: ['ISP router receives and inspects IP packet.', 'TTL: 63 → 62.', 'BGP routing table consulted for 93.184.216.34.', 'Belongs to AS15133 (Akamai). Forwarded via backbone link.']
    },
    {
      id: 7, name: 'Server Receives & Responds', device: 'Web Server', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 4,
      packet: { type: 'HTTP Response', status: '200 OK', contentType: 'text/html', contentLength: '1270 bytes', server: 'ECS (dcb/7EA2)', ttl: 58 },
      log: ['Web server receives the complete HTTP GET request.', 'TCP/IP/Ethernet headers are all stripped layer by layer.', 'HTTP request parsed: GET / HTTP/1.1 Host: example.com.', 'Server generates HTTP 200 OK response.', 'Response travels back through the same path in reverse.', 'Full round-trip complete. Web page delivered to browser.']
    },
  ]
},

// ─────────────────────────────────────────────
// 6. TLS/SSL HANDSHAKE
// ─────────────────────────────────────────────
{
  id: 'tls',
  title: 'TLS/SSL Handshake',
  subtitle: 'Transport Layer Security',
  icon: '🔒',
  color: '#ff7b72',
  description: 'How HTTPS establishes an encrypted channel using TLS 1.3: key exchange, certificate verification, and session keys.',
  topology: [
    { id: 0, x: 100, y: 180, icon: '💻', label: 'Client', sub: 'Browser' },
    { id: 1, x: 300, y: 180, icon: '🛡️', label: 'TLS Layer', sub: 'Port 443' },
    { id: 2, x: 500, y: 180, icon: '🖥️', label: 'HTTPS Server', sub: 'example.com' },
  ],
  edges: [[0,1],[1,2]],
  frames: [
    {
      id: 0, name: 'Client Hello', device: 'Browser (Client)', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 0,
      packet: { type: 'TLS ClientHello', tlsVersion: 'TLS 1.3', supportedCiphers: 'TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256', clientRandom: '0x4A3F...9C12 (32 bytes)', sessionID: 'None (TLS 1.3)', SNI: 'example.com', supportedGroups: 'x25519, P-256, P-384' },
      log: [
        'The client initiates the TLS handshake after TCP connection is established.',
        'ClientHello contains the client\'s capabilities.',
        'Supported cipher suites listed in preference order.',
        'Client Random: 32 random bytes used in key derivation.',
        'SNI (Server Name Indication): "example.com" — tells server which cert to use.',
        'TLS 1.3: The client also sends its key share (Diffie-Hellman public key).',
        'In TLS 1.3, the handshake is faster — only 1 round trip needed.'
      ]
    },
    {
      id: 1, name: 'Server Hello + Certificate', device: 'HTTPS Server', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 2,
      packet: { type: 'TLS ServerHello', selectedCipher: 'TLS_AES_256_GCM_SHA384', serverRandom: '0x7B2E...1A4F (32 bytes)', certificate: 'example.com cert (signed by DigiCert)', certExpiry: '2025-12-31', serverKeyShare: 'x25519 public key', ALPN: 'http/1.1' },
      log: [
        'Server responds with ServerHello, Certificate, and KeyShare.',
        'Selected cipher: TLS_AES_256_GCM_SHA384 (AES-256 encryption + SHA-384 HMAC).',
        'Server sends its X.509 certificate for identity verification.',
        'Certificate contains: domain name, public key, issuer (CA), expiry date.',
        'Server Key Share: server\'s Diffie-Hellman public key for x25519.',
        'Both sides now have enough to compute the shared secret.',
        'In TLS 1.3, this is done via ECDHE (Elliptic Curve DH Ephemeral).'
      ]
    },
    {
      id: 2, name: 'Certificate Verification', device: 'Browser (Client)', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 0,
      packet: { type: 'Certificate Verification', issuer: 'DigiCert SHA2 Secure Server CA', rootCA: 'DigiCert Global Root CA', validFrom: '2024-01-15', validTo: '2025-12-31', keyAlgorithm: 'RSA 2048-bit', signatureAlgo: 'SHA256withRSA', status: 'VALID ✓' },
      log: [
        'The browser verifies the server\'s certificate.',
        'Step 1: Check the certificate\'s digital signature using the CA\'s public key.',
        'Step 2: Verify the certificate chain up to a trusted Root CA.',
        'Step 3: Check the domain name matches "example.com".',
        'Step 4: Verify the certificate has not expired.',
        'Step 5: Check Certificate Revocation List (CRL) or OCSP.',
        'All checks PASSED. The server is who it claims to be.',
        'Man-in-the-middle attacks are prevented by this verification.'
      ]
    },
    {
      id: 3, name: 'Key Exchange & Session Keys', device: 'Both Client & Server', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 1,
      packet: { type: 'Key Derivation', sharedSecret: 'x25519 ECDHE (never transmitted)', masterSecret: 'Derived via HKDF', clientWriteKey: 'AES-256 key (client→server)', serverWriteKey: 'AES-256 key (server→client)', ivClient: '96-bit IV', ivServer: '96-bit IV' },
      log: [
        'Both sides independently compute the shared secret using ECDHE.',
        'The private keys never leave their respective devices.',
        'Shared secret is derived from: client private key × server public key.',
        'Due to ECDHE math: client_priv × server_pub = server_priv × client_pub.',
        'From the shared secret, session keys are derived using HKDF.',
        'Separate keys for each direction: client→server and server→client.',
        'The shared secret itself is NEVER transmitted over the network.',
        'Even if an attacker captures all packets, they cannot decrypt them.',
        'This property is called Perfect Forward Secrecy (PFS).'
      ]
    },
    {
      id: 4, name: 'Handshake Finished — Encrypted', device: 'Both', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 1,
      packet: { type: 'TLS Finished', clientFinished: 'HMAC of all handshake messages ✓', serverFinished: 'HMAC of all handshake messages ✓', encryptionActive: 'YES — AES-256-GCM', applicationDataReady: 'YES', totalHandshakeTime: '~1 RTT (TLS 1.3)' },
      log: [
        'Both sides send a "Finished" message encrypted with the new session keys.',
        'The Finished message contains an HMAC over all previous handshake messages.',
        'This confirms: (1) handshake integrity — nothing was tampered with.',
        'And (2) both sides derived the same session keys.',
        'From this point, ALL data is encrypted with AES-256-GCM.',
        'TLS 1.3 completes in 1 RTT (vs 2 RTT in TLS 1.2).',
        'The HTTPS padlock in the browser is now active.',
        'HTTPS is now active. HTTP GET request can be sent encrypted.'
      ]
    },
  ]
},

// ─────────────────────────────────────────────
// 7. ICMP PING / TRACEROUTE
// ─────────────────────────────────────────────
{
  id: 'icmp',
  title: 'ICMP Ping & Traceroute',
  subtitle: 'Internet Control Message Protocol',
  icon: '📡',
  color: '#39d353',
  description: 'How ping uses ICMP Echo Request/Reply to test reachability, and how traceroute uses TTL expiry to map network hops.',
  topology: [
    { id: 0, x: 80,  y: 180, icon: '💻', label: 'Source', sub: '192.168.1.10' },
    { id: 1, x: 220, y: 180, icon: '📡', label: 'Router 1', sub: '192.168.1.1' },
    { id: 2, x: 360, y: 120, icon: '🌐', label: 'Router 2', sub: '10.0.0.1' },
    { id: 3, x: 360, y: 240, icon: '🌐', label: 'Router 3', sub: '72.14.204.1' },
    { id: 4, x: 500, y: 180, icon: '🖥️', label: 'Destination', sub: '8.8.8.8' },
  ],
  edges: [[0,1],[1,2],[2,4],[1,3],[3,4]],
  frames: [
    {
      id: 0, name: 'Ping: ICMP Echo Request Sent', device: 'Source PC', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 0,
      packet: { type: 'ICMP Echo Request', srcIP: '192.168.1.10', dstIP: '8.8.8.8', icmpType: '8 (Echo Request)', icmpCode: '0', identifier: '0x1234', sequence: '1', ttl: 64, payload: '32 bytes (abcdefgh...)' },
      log: [
        'User runs: ping 8.8.8.8',
        'The OS creates an ICMP Echo Request packet.',
        'ICMP Type 8, Code 0 = Echo Request.',
        'Identifier: 0x1234 — matches replies to this ping process.',
        'Sequence: 1 — first in a series of pings.',
        'Payload: 32 bytes of data (pattern: abcdefghijklmnop...).',
        'TTL: 64 — will be decremented at each router.',
        'No TCP/UDP headers — ICMP is encapsulated directly in IP.',
        'ICMP is a Layer 3 protocol — it operates at the Network Layer.'
      ]
    },
    {
      id: 1, name: 'Routers Forward the ICMP Packet', device: 'Router 1', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 1,
      packet: { type: 'ICMP Echo Request', srcIP: '192.168.1.10', dstIP: '8.8.8.8', ttl: 63, forwarding: 'Normal routing — TTL decremented' },
      log: [
        'The ICMP packet traverses routers along the path.',
        'Each router: (1) receives, (2) decrements TTL, (3) forwards.',
        'Router 1: TTL 64 → 63.',
        'Router 2: TTL 63 → 62.',
        'Packet continues toward destination 8.8.8.8.',
        'Routers do not generate replies for normal forwarding.',
        'Only the destination (8.8.8.8) will respond to the Echo Request.'
      ]
    },
    {
      id: 2, name: 'Destination Replies', device: 'Destination (8.8.8.8)', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 4,
      packet: { type: 'ICMP Echo Reply', srcIP: '8.8.8.8', dstIP: '192.168.1.10', icmpType: '0 (Echo Reply)', icmpCode: '0', identifier: '0x1234', sequence: '1', ttl: 118, roundTrip: '~14ms' },
      log: [
        '8.8.8.8 (Google DNS) receives the Echo Request.',
        'It generates an ICMP Echo Reply (Type 0, Code 0).',
        'Identifier 0x1234 and Sequence 1 are echoed back.',
        'The same 32-byte payload is returned.',
        'Reply TTL: 118 (started at 128 from Google\'s end, decremented by hops back).',
        'The reply travels back through the network to 192.168.1.10.',
        'Round-trip time measured: ~14ms.',
        'Ping output: Reply from 8.8.8.8: bytes=32 time=14ms TTL=118'
      ]
    },
    {
      id: 3, name: 'Traceroute: TTL=1, Router 1 Responds', device: 'Router 1', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 1,
      packet: { type: 'ICMP Time Exceeded', srcIP: '192.168.1.1', dstIP: '192.168.1.10', icmpType: '11 (Time Exceeded)', icmpCode: '0 (TTL expired in transit)', originalDst: '8.8.8.8', hopNumber: 1, rtt: '1ms' },
      log: [
        'Traceroute works by deliberately setting TTL=1 on the first probe.',
        'When a router receives a packet with TTL=1, it must drop it.',
        'The router sends back ICMP Type 11 "Time Exceeded" to the source.',
        'This reveals the router\'s IP address: 192.168.1.1.',
        'traceroute output: "1  192.168.1.1  1ms"',
        'Next probe: TTL=2 — gets past Router 1, TTL expires at Router 2.',
        'Each TTL increment reveals the next hop in the path.',
        'This builds a map of the entire route to the destination.'
      ]
    },
    {
      id: 4, name: 'Traceroute: Full Path Revealed', device: 'All Hops', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 4,
      packet: { type: 'Traceroute Complete', hop1: '192.168.1.1 (1ms)', hop2: '10.0.0.1 (8ms)', hop3: '72.14.204.1 (12ms)', hop4: '8.8.8.8 (14ms)', totalHops: 4 },
      log: [
        'Traceroute complete. Full path to 8.8.8.8 discovered:',
        '1  192.168.1.1      1 ms   — Home Router',
        '2  10.0.0.1         8 ms   — ISP Gateway',
        '3  72.14.204.1     12 ms   — Google Peering',
        '4  8.8.8.8         14 ms   — Destination',
        'Traceroute uses 3 probes per hop for reliability.',
        'Asterisks (*) appear when routers block ICMP or don\'t respond.',
        'Useful for diagnosing: routing loops, high-latency hops, path changes.'
      ]
    },
  ]
},

// ─────────────────────────────────────────────
// 8. NAT TRANSLATION
// ─────────────────────────────────────────────
{
  id: 'nat',
  title: 'NAT Translation',
  subtitle: 'Network Address Translation',
  icon: '🔄',
  color: '#ffa657',
  description: 'How a home router translates private IP addresses to a public IP, allowing multiple devices to share one internet connection.',
  topology: [
    { id: 0, x: 80,  y: 120, icon: '💻', label: 'PC-A', sub: '192.168.1.10' },
    { id: 1, x: 80,  y: 240, icon: '📱', label: 'Phone', sub: '192.168.1.20' },
    { id: 2, x: 280, y: 180, icon: '📡', label: 'Router+NAT', sub: 'Public: 203.0.113.5' },
    { id: 3, x: 480, y: 180, icon: '🖥️', label: 'Web Server', sub: '93.184.216.34' },
  ],
  edges: [[0,2],[1,2],[2,3]],
  frames: [
    {
      id: 0, name: 'PC-A Sends Request (Private IP)', device: 'PC-A', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 0,
      packet: { type: 'IP Packet (Private)', srcIP: '192.168.1.10', dstIP: '93.184.216.34', srcPort: 54321, dstPort: 80, note: 'Private IP — not routable on internet' },
      log: [
        'PC-A (192.168.1.10) wants to connect to 93.184.216.34:80.',
        'The source IP 192.168.1.10 is a PRIVATE IP address (RFC 1918).',
        'Private IP ranges: 10.x.x.x, 172.16-31.x.x, 192.168.x.x.',
        'Private IPs are NOT routable on the public internet.',
        'Internet routers would DROP packets from 192.168.1.10.',
        'The router must translate this to the public IP before forwarding.',
        'The packet leaves PC-A with: src=192.168.1.10:54321, dst=93.184.216.34:80.'
      ]
    },
    {
      id: 1, name: 'Router: NAT Table Created', device: 'Router (NAT)', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 2,
      packet: { type: 'NAT Entry Created', privateIP: '192.168.1.10', privatePort: 54321, publicIP: '203.0.113.5', publicPort: 40001, protocol: 'TCP', natType: 'PAT (Port Address Translation)' },
      log: [
        'The router intercepts the outbound packet from PC-A.',
        'NAT (Network Address Translation) is applied.',
        'A new entry is created in the NAT translation table:',
        '  Private: 192.168.1.10:54321 → Public: 203.0.113.5:40001',
        'The router maps a unique public port (40001) to identify this connection.',
        'This type of NAT is called PAT (Port Address Translation) or NAT Overload.',
        'PAT allows MANY private devices to share ONE public IP.',
        'The mapping is stored until the connection ends or times out.'
      ]
    },
    {
      id: 2, name: 'Packet Sent with Public IP', device: 'Router → Internet', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 2,
      packet: { type: 'IP Packet (Public)', srcIP: '203.0.113.5', dstIP: '93.184.216.34', srcPort: 40001, dstPort: 80, translated: 'YES — private IP replaced with public IP' },
      log: [
        'The router rewrites the IP packet headers.',
        'Source IP changed: 192.168.1.10 → 203.0.113.5 (public IP).',
        'Source Port changed: 54321 → 40001 (NAT port mapping).',
        'The packet now looks like it originates from 203.0.113.5.',
        'IP checksum and TCP checksum are recalculated after the change.',
        'The web server will see the request coming from 203.0.113.5:40001.',
        'It has no knowledge of the private 192.168.1.10 address.'
      ]
    },
    {
      id: 3, name: 'Phone Also Sends Request', device: 'Phone', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 1,
      packet: { type: 'NAT Entry (Phone)', privateIP: '192.168.1.20', privatePort: 33456, publicIP: '203.0.113.5', publicPort: 40002, natTable: '2 entries active' },
      log: [
        'Simultaneously, the Phone (192.168.1.20) connects to the same server.',
        'A second NAT entry is created:',
        '  Private: 192.168.1.20:33456 → Public: 203.0.113.5:40002',
        'Both PC-A and the Phone share the same public IP (203.0.113.5).',
        'The different public ports (40001 vs 40002) distinguish the connections.',
        'NAT table now has 2 entries, both mapping to the same public IP.',
        'The web server sees two connections — both from 203.0.113.5.',
        'This is how millions of home users share limited IPv4 addresses.'
      ]
    },
    {
      id: 4, name: 'Server Reply: Reverse NAT', device: 'Router (NAT)', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 2,
      packet: { type: 'Reverse NAT', incomingDst: '203.0.113.5:40001', translatedTo: '192.168.1.10:54321', lookup: 'NAT table match found', result: 'Forwarded to PC-A' },
      log: [
        'The web server sends a reply to 203.0.113.5:40001.',
        'The router receives the reply on its public interface.',
        'The router looks up destination port 40001 in the NAT table.',
        'NAT Table lookup: 40001 → 192.168.1.10:54321.',
        'Destination IP rewritten: 203.0.113.5 → 192.168.1.10.',
        'Destination Port rewritten: 40001 → 54321.',
        'The packet is forwarded to PC-A on the internal network.',
        'PC-A receives the reply as if the server spoke directly to it.',
        'The NAT translation is completely transparent to both endpoints.'
      ]
    },
  ]
},

// ─────────────────────────────────────────────
// 9. BGP ROUTING
// ─────────────────────────────────────────────
{
  id: 'bgp',
  title: 'BGP Routing',
  subtitle: 'Border Gateway Protocol',
  icon: '🗺️',
  color: '#d2a8ff',
  description: 'How the internet\'s backbone routing protocol exchanges network reachability information between Autonomous Systems.',
  topology: [
    { id: 0, x: 80,  y: 180, icon: '🏢', label: 'AS65001', sub: 'Your ISP' },
    { id: 1, x: 240, y: 100, icon: '🌍', label: 'AS3356', sub: 'Level3' },
    { id: 2, x: 240, y: 260, icon: '🌍', label: 'AS1299', sub: 'Telia' },
    { id: 3, x: 400, y: 180, icon: '🌍', label: 'AS15169', sub: 'Google' },
    { id: 4, x: 540, y: 180, icon: '🖥️', label: '8.8.8.8', sub: 'Google DNS' },
  ],
  edges: [[0,1],[0,2],[1,3],[2,3],[3,4]],
  frames: [
    {
      id: 0, name: 'BGP Peering Established', device: 'AS65001 ↔ AS3356', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 0,
      packet: { type: 'BGP OPEN', bgpVersion: 4, myAS: 65001, holdTime: '90 seconds', routerID: '203.0.113.1', capabilities: 'MULTIPROTOCOL, ROUTE-REFRESH, 4-byte ASN' },
      log: [
        'BGP (Border Gateway Protocol) is the routing protocol of the internet.',
        'BGP operates between Autonomous Systems (AS) — independently managed networks.',
        'AS65001 (your ISP) establishes a BGP peer with AS3356 (Level3/Lumen).',
        'BGP runs over TCP port 179 — it needs a reliable connection.',
        'BGP OPEN message: "I am AS65001, my router ID is 203.0.113.1."',
        'Hold Time: 90 seconds — if no message in 90s, the peering drops.',
        'After OPEN exchange, the peering enters ESTABLISHED state.',
        'BGP is called an EGP (Exterior Gateway Protocol) — between different ASes.'
      ]
    },
    {
      id: 1, name: 'BGP UPDATE: Routes Advertised', device: 'AS3356 → AS65001', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 1,
      packet: { type: 'BGP UPDATE', nlri: '8.8.8.0/24', asPath: 'AS3356 AS15169', nextHop: '10.0.0.2', localPref: 100, med: 0, communities: 'NO_EXPORT, 3356:1000' },
      log: [
        'AS3356 sends a BGP UPDATE advertising the route to 8.8.8.0/24.',
        'NLRI (Network Layer Reachability Info): 8.8.8.0/24 = Google\'s DNS range.',
        'AS_PATH: AS3356 AS15169 — to reach 8.8.8.0/24, traffic goes through these ASes.',
        'AS_PATH is used to detect and prevent routing loops.',
        'NEXT_HOP: 10.0.0.2 — the IP of the router to send traffic toward.',
        'LOCAL_PREF: 100 (internal preference — used within an AS).',
        'BGP Communities: tags used for policy decisions (e.g., 3356:1000 = "customer route").',
        'AS65001 installs this route: 8.8.8.0/24 via AS3356.'
      ]
    },
    {
      id: 2, name: 'Multiple Paths — Best Path Selection', device: 'AS65001 Router', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 0,
      packet: { type: 'BGP Best Path', destination: '8.8.8.0/24', path1: 'via AS3356 → AS15169 (2 hops)', path2: 'via AS1299 → AS15169 (2 hops)', winner: 'AS3356 path (higher LOCAL_PREF)', criterion: 'BGP Best Path Algorithm' },
      log: [
        'AS65001 has received two paths to 8.8.8.0/24.',
        'Path 1: via AS3356 → AS15169 (LOCAL_PREF=100)',
        'Path 2: via AS1299 → AS15169 (LOCAL_PREF=90)',
        'BGP Best Path Algorithm selects the winner:',
        '  1. Highest Weight (Cisco-specific)',
        '  2. Highest LOCAL_PREF ← wins here (100 > 90)',
        '  3. Shortest AS_PATH',
        '  4. Lowest MED',
        '  5. eBGP over iBGP',
        '  6. Lowest IGP metric to next hop',
        'Winner: Path via AS3356 installed in routing table.'
      ]
    },
    {
      id: 3, name: 'Packet Forwarded via BGP Path', device: 'Internet Backbone', layer: 'Network', osiClass: 'osi-network', layerClass: 'layer-network', activeHop: 1,
      packet: { type: 'IP Forwarding', srcIP: '192.168.1.10', dstIP: '8.8.8.8', ttl: 60, route: '8.8.8.0/24 via AS3356', nextHop: '10.0.0.2' },
      log: [
        'A packet destined for 8.8.8.8 is forwarded based on BGP routes.',
        'Routing table lookup: 8.8.8.8 matches prefix 8.8.8.0/24.',
        'Next hop: AS3356 router at 10.0.0.2.',
        'The packet travels: AS65001 → AS3356 → AS15169 → 8.8.8.8.',
        'BGP only selects the path — actual forwarding is done by the IP routing table.',
        'BGP routes are redistributed into the local routing table (FIB).',
        'TTL continues to decrement at each router hop.'
      ]
    },
    {
      id: 4, name: 'BGP KEEPALIVE & Convergence', device: 'All BGP Peers', layer: 'Application', osiClass: 'osi-app', layerClass: 'layer-app', activeHop: 3,
      packet: { type: 'BGP KEEPALIVE', interval: '30 seconds', holdTimer: '90 seconds', routingTableSize: '~900,000 prefixes (full internet table)', convergenceTime: '60–300 seconds after change' },
      log: [
        'BGP KEEPALIVE messages are sent every 30 seconds.',
        'If no KEEPALIVE in 90 seconds, the peering drops and routes are withdrawn.',
        'The full internet BGP routing table contains ~900,000+ prefixes.',
        'When a link fails, BGP sends WITHDRAW messages for affected routes.',
        'Other ASes recalculate best paths — this is called BGP convergence.',
        'BGP convergence can take 60–300 seconds, which is why internet outages happen.',
        'BGP is intentionally slow — rapid changes cause global routing instability.',
        'Famous BGP incidents: Pakistan Telecom hijacking YouTube (2008), Facebook outage (2021).'
      ]
    },
  ]
},

// ─────────────────────────────────────────────
// 10. UDP vs TCP COMPARISON
// ─────────────────────────────────────────────
{
  id: 'udp_tcp',
  title: 'UDP vs TCP',
  subtitle: 'Transport Protocol Comparison',
  icon: '⚡',
  color: '#79c0ff',
  description: 'Side-by-side comparison of UDP and TCP behaviours — connection setup, reliability, ordering, and use cases.',
  topology: [
    { id: 0, x: 80,  y: 180, icon: '💻', label: 'Sender', sub: '192.168.1.10' },
    { id: 1, x: 290, y: 100, icon: '⚡', label: 'UDP Path', sub: 'No handshake' },
    { id: 2, x: 290, y: 260, icon: '🤝', label: 'TCP Path', sub: '3-way handshake' },
    { id: 3, x: 500, y: 180, icon: '🖥️', label: 'Receiver', sub: '93.184.216.34' },
  ],
  edges: [[0,1],[1,3],[0,2],[2,3]],
  frames: [
    {
      id: 0, name: 'UDP: Fire and Forget', device: 'Sender (UDP)', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 0,
      packet: { type: 'UDP Datagram', srcPort: 5000, dstPort: 53, length: 40, checksum: '0xA3B1', headerSize: '8 bytes', handshake: 'NONE', reliability: 'NONE', ordering: 'NONE' },
      log: [
        'UDP (User Datagram Protocol) — a lightweight, connectionless protocol.',
        'UDP has no handshake — data is sent immediately without setup.',
        'UDP header is just 8 bytes: src port, dst port, length, checksum.',
        'Compare to TCP header: 20+ bytes.',
        'NO acknowledgements — the sender never knows if data arrived.',
        'NO retransmission — lost packets stay lost.',
        'NO ordering — packets may arrive out of sequence.',
        'But: VERY LOW latency — ideal when speed > reliability.',
        'Uses: DNS, video streaming, VoIP, online gaming, DHCP.'
      ]
    },
    {
      id: 1, name: 'UDP: Packet Loss (No Recovery)', device: 'Network', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 1,
      packet: { type: 'UDP — Packet Lost', pkt1: 'Sent ✓', pkt2: 'LOST ✗ (dropped by router)', pkt3: 'Sent ✓', pkt4: 'Sent ✓', result: 'Receiver gets pkts 1, 3, 4 — gap at pkt 2' },
      log: [
        'A router under load drops UDP packet #2 due to buffer overflow.',
        'With UDP, nothing happens. There is no recovery mechanism.',
        'The sender continues sending packets 3, 4, 5...',
        'The receiver gets packets 1, 3, 4, 5 — with a gap at packet 2.',
        'In video streaming: a brief glitch or pixelation appears.',
        'In VoIP: a small audio dropout — often imperceptible.',
        'In DNS: the client just re-sends the query if no response arrives.',
        'Applications using UDP implement their own reliability if needed (QUIC, SRTP).'
      ]
    },
    {
      id: 2, name: 'TCP: Connection + Reliability', device: 'Sender (TCP)', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 2,
      packet: { type: 'TCP Segment', headerSize: '20 bytes min', features: 'Seq numbers, ACK, retransmit, flow control, congestion control', windowSize: '65535 bytes', retransmitTimeout: 'RTO (adaptive)', mss: '1460 bytes' },
      log: [
        'TCP (Transmission Control Protocol) — reliable, ordered, connection-oriented.',
        'TCP guarantees: (1) delivery, (2) ordering, (3) no duplicates.',
        'Every byte has a Sequence Number for ordering and tracking.',
        'Receiver sends ACKs to confirm received bytes.',
        'If ACK not received within RTO, the segment is retransmitted.',
        'Flow Control: Window Size prevents overwhelming the receiver.',
        'Congestion Control (CUBIC/BBR): detects network congestion and backs off.',
        'Cost: higher latency due to handshake, ACKs, and potential retransmits.',
        'Uses: HTTP/HTTPS, email (SMTP/IMAP), file transfer (FTP/SFTP), SSH.'
      ]
    },
    {
      id: 3, name: 'TCP: Retransmission on Loss', device: 'TCP Stack', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 2,
      packet: { type: 'TCP Retransmit', lostSeq: 1001, detection: '3 Duplicate ACKs (Fast Retransmit)', retransmitted: 'Seq 1001 resent', receiverAck: 'ACK 1461 (caught up)', cwnd: 'Halved (congestion control)' },
      log: [
        'TCP Sequence 1001 (the segment carrying bytes 1001-1460) is dropped.',
        'The receiver gets seq 1461 and sends ACK 1001 (requesting missing bytes).',
        'The receiver sends 3 duplicate ACKs for 1001.',
        'Sender detects 3 DUP-ACKs → triggers FAST RETRANSMIT.',
        'Seq 1001 is immediately resent without waiting for RTO timer.',
        'Receiver now gets seq 1001, buffers it, and delivers 1001-2000 in order.',
        'Receiver sends ACK 2001 to confirm everything up to byte 2000 received.',
        'TCP congestion window (cwnd) is halved to reduce network load.',
        'Application never sees the gap — the stream is seamless.'
      ]
    },
    {
      id: 4, name: 'Use Case Comparison', device: 'Protocol Selector', layer: 'Transport', osiClass: 'osi-transport', layerClass: 'layer-transport', activeHop: 1,
      packet: { type: 'Comparison Summary', udpUseCases: 'DNS, VoIP, Video Stream, Gaming, DHCP, QUIC', tcpUseCases: 'HTTP, HTTPS, SSH, FTP, Email, Database', udpLatency: '< 1ms overhead', tcpLatency: '1.5 RTT handshake + ACK overhead', udpThroughput: 'Max (no ACK wait)', tcpThroughput: 'High but limited by window/RTT' },
      log: [
        'Choosing between TCP and UDP:',
        '',
        'Choose UDP when:',
        '  → Real-time: VoIP, video calls (a lost frame is worthless if late)',
        '  → DNS: small query/response, easy to retry',
        '  → Live streaming: new data makes old data irrelevant',
        '  → Games: position updates — latest state matters, not old packets',
        '',
        'Choose TCP when:',
        '  → Every byte must arrive: file downloads, web pages, email',
        '  → Order matters: HTTP, database queries',
        '  → Security matters: SSH, TLS (TLS runs on top of TCP)',
        '',
        'Modern protocol: QUIC (HTTP/3) — UDP-based but with TCP-like reliability built in.'
      ]
    },
  ]
},

]; // end SCENARIOS

if (typeof module !== 'undefined') module.exports = { SCENARIOS };
