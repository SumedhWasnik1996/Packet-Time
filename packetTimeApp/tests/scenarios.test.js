/**
 * Suite 1 — Scenario Data Integrity
 *
 * Validates every scenario in scenarios.js has correct structure,
 * required fields, valid OSI classes, consistent frame IDs,
 * and that topology edges reference real node IDs.
 *
 * These tests catch data entry mistakes — a missing field, a bad
 * activeHop index, or a typo in osiClass would break the UI silently.
 */

const { SCENARIOS } = require('../src/scenarios.js');

// ─────────────────────────────────────────────
// Constants — valid values the UI depends on
// ─────────────────────────────────────────────
const VALID_OSI_CLASSES = [
  'osi-app',
  'osi-transport',
  'osi-network',
  'osi-link',
  'osi-physical',
];

const VALID_LAYER_CLASSES = [
  'layer-app',
  'layer-transport',
  'layer-network',
  'layer-link',
  'layer-physical',
];

const VALID_LAYERS = [
  'Application',
  'Transport',
  'Network',
  'Data Link',
  'Physical',
];

// ─────────────────────────────────────────────
// Top-level array
// ─────────────────────────────────────────────
describe('SCENARIOS array', () => {
  test('exports a non-empty array', () => {
    expect(Array.isArray(SCENARIOS)).toBe(true);
    expect(SCENARIOS.length).toBeGreaterThan(0);
  });

  test('contains exactly 10 scenarios', () => {
    expect(SCENARIOS).toHaveLength(10);
  });

  test('all scenario IDs are unique', () => {
    const ids = SCENARIOS.map(s => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('all scenario titles are unique', () => {
    const titles = SCENARIOS.map(s => s.title);
    const unique = new Set(titles);
    expect(unique.size).toBe(titles.length);
  });
});

// ─────────────────────────────────────────────
// Per-scenario structure
// ─────────────────────────────────────────────
describe.each(SCENARIOS.map(s => [s.id, s]))(
  'Scenario "%s"',
  (id, scenario) => {

    // ── Required top-level fields ──────────────
    test('has all required top-level fields', () => {
      expect(typeof scenario.id).toBe('string');
      expect(typeof scenario.title).toBe('string');
      expect(typeof scenario.subtitle).toBe('string');
      expect(typeof scenario.icon).toBe('string');
      expect(typeof scenario.color).toBe('string');
      expect(typeof scenario.description).toBe('string');
    });

    test('color is a valid hex value', () => {
      expect(scenario.color).toMatch(/^#[0-9a-fA-F]{3,6}$/);
    });

    test('description is non-empty', () => {
      expect(scenario.description.trim().length).toBeGreaterThan(10);
    });

    // ── Topology ──────────────────────────────
    test('has at least 2 topology nodes', () => {
      expect(Array.isArray(scenario.topology)).toBe(true);
      expect(scenario.topology.length).toBeGreaterThanOrEqual(2);
    });

    test('topology node IDs are sequential starting from 0', () => {
      scenario.topology.forEach((node, i) => {
        expect(node.id).toBe(i);
      });
    });

    test('all topology nodes have required fields', () => {
      scenario.topology.forEach(node => {
        expect(typeof node.id).toBe('number');
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
        expect(typeof node.icon).toBe('string');
        expect(typeof node.label).toBe('string');
        expect(typeof node.sub).toBe('string');
      });
    });

    test('topology node coordinates are positive numbers', () => {
      scenario.topology.forEach(node => {
        expect(node.x).toBeGreaterThan(0);
        expect(node.y).toBeGreaterThan(0);
      });
    });

    // ── Edges ─────────────────────────────────
    test('has at least 1 edge', () => {
      expect(Array.isArray(scenario.edges)).toBe(true);
      expect(scenario.edges.length).toBeGreaterThanOrEqual(1);
    });

    test('all edges reference valid topology node IDs', () => {
      const nodeIds = new Set(scenario.topology.map(n => n.id));
      scenario.edges.forEach(([a, b]) => {
        expect(nodeIds.has(a)).toBe(true);
        expect(nodeIds.has(b)).toBe(true);
      });
    });

    test('no self-referencing edges', () => {
      scenario.edges.forEach(([a, b]) => {
        expect(a).not.toBe(b);
      });
    });

    // ── Frames ────────────────────────────────
    test('has at least 1 frame', () => {
      expect(Array.isArray(scenario.frames)).toBe(true);
      expect(scenario.frames.length).toBeGreaterThanOrEqual(1);
    });

    test('frame IDs are sequential starting from 0', () => {
      scenario.frames.forEach((frame, i) => {
        expect(frame.id).toBe(i);
      });
    });

    test('all frames have required fields', () => {
      scenario.frames.forEach(frame => {
        expect(typeof frame.id).toBe('number');
        expect(typeof frame.name).toBe('string');
        expect(typeof frame.device).toBe('string');
        expect(typeof frame.layer).toBe('string');
        expect(typeof frame.osiClass).toBe('string');
        expect(typeof frame.layerClass).toBe('string');
        expect(typeof frame.activeHop).toBe('number');
        expect(typeof frame.packet).toBe('object');
        expect(Array.isArray(frame.log)).toBe(true);
      });
    });

    test('all frames have valid osiClass', () => {
      scenario.frames.forEach(frame => {
        expect(VALID_OSI_CLASSES).toContain(frame.osiClass);
      });
    });

    test('all frames have valid layerClass', () => {
      scenario.frames.forEach(frame => {
        expect(VALID_LAYER_CLASSES).toContain(frame.layerClass);
      });
    });

    test('all frames have valid layer name', () => {
      scenario.frames.forEach(frame => {
        expect(VALID_LAYERS).toContain(frame.layer);
      });
    });

    test('all frame activeHop values reference valid topology nodes', () => {
      const nodeIds = new Set(scenario.topology.map(n => n.id));
      scenario.frames.forEach(frame => {
        expect(nodeIds.has(frame.activeHop)).toBe(true);
      });
    });

    test('all frames have non-empty name', () => {
      scenario.frames.forEach(frame => {
        expect(frame.name.trim().length).toBeGreaterThan(0);
      });
    });

    test('all frames have non-empty device', () => {
      scenario.frames.forEach(frame => {
        expect(frame.device.trim().length).toBeGreaterThan(0);
      });
    });

    test('all frames have at least 1 log entry', () => {
      scenario.frames.forEach(frame => {
        const nonEmpty = frame.log.filter(l => l.trim().length > 0);
        expect(nonEmpty.length).toBeGreaterThanOrEqual(1);
      });
    });

    test('all frame packets have a type field', () => {
      scenario.frames.forEach(frame => {
        expect(frame.packet).toHaveProperty('type');
        expect(typeof frame.packet.type).toBe('string');
      });
    });
  }
);

// ─────────────────────────────────────────────
// Spot-check specific scenario content
// ─────────────────────────────────────────────
describe('Scenario content spot-checks', () => {
  test('ARP scenario has 7 frames', () => {
    const arp = SCENARIOS.find(s => s.id === 'arp');
    expect(arp.frames).toHaveLength(7);
  });

  test('TCP scenario first frame has SYN flag', () => {
    const tcp = SCENARIOS.find(s => s.id === 'tcp');
    expect(tcp.frames[0].packet.flags).toContain('SYN');
  });

  test('DNS scenario resolves to an IP address', () => {
    const dns = SCENARIOS.find(s => s.id === 'dns');
    const answerFrame = dns.frames.find(f => f.packet.resolvedIP);
    expect(answerFrame).toBeDefined();
    expect(answerFrame.packet.resolvedIP).toMatch(/^\d+\.\d+\.\d+\.\d+$/);
  });

  test('HTTP scenario covers all 5 OSI layers', () => {
    const http = SCENARIOS.find(s => s.id === 'http');
    const classes = new Set(http.frames.map(f => f.osiClass));
    expect(classes.has('osi-app')).toBe(true);
    expect(classes.has('osi-transport')).toBe(true);
    expect(classes.has('osi-network')).toBe(true);
    expect(classes.has('osi-link')).toBe(true);
    expect(classes.has('osi-physical')).toBe(true);
  });

  test('TLS scenario has a certificate verification frame', () => {
    const tls = SCENARIOS.find(s => s.id === 'tls');
    const certFrame = tls.frames.find(f =>
      f.name.toLowerCase().includes('cert')
    );
    expect(certFrame).toBeDefined();
  });

  test('NAT scenario has both private and public IP in packet fields', () => {
    const nat = SCENARIOS.find(s => s.id === 'nat');
    const natFrame = nat.frames.find(f => f.packet.privateIP && f.packet.publicIP);
    expect(natFrame).toBeDefined();
  });

  test('DHCP scenario final frame has assignedIP', () => {
    const dhcp = SCENARIOS.find(s => s.id === 'dhcp');
    const ackFrame = dhcp.frames[dhcp.frames.length - 1];
    expect(ackFrame.packet.assignedIP).toBeDefined();
  });

  test('BGP scenario has AS path in at least one frame', () => {
    const bgp = SCENARIOS.find(s => s.id === 'bgp');
    const asFrame = bgp.frames.find(f => f.packet.asPath);
    expect(asFrame).toBeDefined();
  });

  test('UDP/TCP scenario has 5 frames', () => {
    const udpTcp = SCENARIOS.find(s => s.id === 'udp_tcp');
    expect(udpTcp.frames).toHaveLength(5);
  });
});
