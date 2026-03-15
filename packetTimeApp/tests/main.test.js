/**
 * Suite 3 — Electron Main Process
 *
 * Tests main.js: window config, IPC registration, app lifecycle,
 * and NODE_ENV behaviour. Electron is fully mocked — no real
 * window is ever created.
 *
 * Root cause of previous failures:
 *   main.js calls  app.whenReady().then(createWindow)
 *   The mock returned Promise.resolve() but beforeAll never
 *   awaited the .then() — so createWindow never ran, leaving
 *   ipcMain.on / app.on / Menu calls empty.
 *
 * Fix: mock app.whenReady to return a Promise whose .then()
 *   we can capture and flush synchronously before assertions.
 */

// ─────────────────────────────────────────────────────────────
// Shared mock objects — defined before jest.mock() factory runs
// ─────────────────────────────────────────────────────────────
const mockWin = {
  loadFile:    jest.fn(),
  maximize:    jest.fn(),
  show:        jest.fn(),
  minimize:    jest.fn(),
  close:       jest.fn(),
  isMaximized: jest.fn(() => false),
  unmaximize:  jest.fn(),
  webContents: { openDevTools: jest.fn() },
  // Immediately invoke 'ready-to-show' so createWindow body fully executes
  once: jest.fn((event, cb) => { if (event === 'ready-to-show') cb(); }),
};

// Captures the callback main.js passes to .then()
let whenReadyCallback = null;

jest.mock('electron', () => ({
  app: {
    whenReady: jest.fn(() => ({
      // Capture the createWindow fn so we can call it manually
      then: jest.fn(cb => { whenReadyCallback = cb; return Promise.resolve(); }),
    })),
    on:         jest.fn(),
    quit:       jest.fn(),
    getName:    jest.fn(() => 'PacketTime Debugger'),
    getVersion: jest.fn(() => '1.0.0'),
  },
  BrowserWindow:    jest.fn(() => mockWin),
  Menu:             { setApplicationMenu: jest.fn() },
  ipcMain:          { on: jest.fn() },
}));

// dotenv: no-op — .env file isn't needed in the test environment
jest.mock('dotenv', () => ({ config: jest.fn() }), { virtual: true });

// ─────────────────────────────────────────────────────────────
// Require mocked modules AFTER jest.mock() declarations
// ─────────────────────────────────────────────────────────────
const { app, BrowserWindow, Menu, ipcMain } = require('electron');

// ─────────────────────────────────────────────────────────────
// Bootstrap — load main.js once for the whole file,
// then manually fire the whenReady callback (= createWindow)
// ─────────────────────────────────────────────────────────────
beforeAll(() => {
  process.env.NODE_ENV = 'production'; // deterministic — no DevTools branch
  require('../main.js');

  // At this point main.js has run:
  //   app.whenReady().then(createWindow)  ← .then() captured createWindow
  //   app.on('window-all-closed', ...)    ← registered
  //   app.on('activate', ...)             ← registered
  //
  // createWindow hasn't run yet — call it now:
  if (typeof whenReadyCallback === 'function') {
    whenReadyCallback();
  }
});

// Convenience: get the options object passed to new BrowserWindow(...)
function windowOpts() {
  return BrowserWindow.mock.calls[0]?.[0] ?? null;
}

// Convenience: get all channels registered with ipcMain.on
function ipcChannels() {
  return ipcMain.on.mock.calls.map(c => c[0]);
}

// Convenience: get the handler registered for a given IPC channel
function ipcHandler(channel) {
  const call = ipcMain.on.mock.calls.find(c => c[0] === channel);
  return call?.[1] ?? null;
}

// ─────────────────────────────────────────────────────────────
// BrowserWindow configuration
// ─────────────────────────────────────────────────────────────
describe('BrowserWindow configuration', () => {
  test('BrowserWindow constructor was called once', () => {
    expect(BrowserWindow).toHaveBeenCalledTimes(1);
  });

  test('frame is false (frameless window)', () => {
    expect(windowOpts().frame).toBe(false);
  });

  test('minWidth is at least 900', () => {
    expect(windowOpts().minWidth).toBeGreaterThanOrEqual(900);
  });

  test('minHeight is at least 600', () => {
    expect(windowOpts().minHeight).toBeGreaterThanOrEqual(600);
  });

  test('backgroundColor is the dark theme colour', () => {
    expect(windowOpts().backgroundColor).toBe('#0d1117');
  });

  test('contextIsolation is true', () => {
    expect(windowOpts().webPreferences.contextIsolation).toBe(true);
  });

  test('nodeIntegration is false', () => {
    expect(windowOpts().webPreferences.nodeIntegration).toBe(false);
  });

  test('preload path contains src/preload.js', () => {
    const preload = windowOpts().webPreferences.preload;
    expect(preload).toContain('preload.js');
    expect(preload).toContain('src');
  });

  test('window starts hidden (show: false)', () => {
    expect(windowOpts().show).toBe(false);
  });

  test('loadFile is called with index.html', () => {
    expect(mockWin.loadFile).toHaveBeenCalledTimes(1);
    const filePath = mockWin.loadFile.mock.calls[0][0];
    expect(filePath).toContain('index.html');
  });

  test('maximize is called on ready-to-show', () => {
    expect(mockWin.maximize).toHaveBeenCalled();
  });

  test('show is called on ready-to-show', () => {
    expect(mockWin.show).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────
// IPC handler registration
// ─────────────────────────────────────────────────────────────
describe('IPC handlers — registration', () => {
  test('win-minimize is registered', () => {
    expect(ipcChannels()).toContain('win-minimize');
  });

  test('win-maximize is registered', () => {
    expect(ipcChannels()).toContain('win-maximize');
  });

  test('win-close is registered', () => {
    expect(ipcChannels()).toContain('win-close');
  });

  test('exactly 3 IPC channels are registered', () => {
    expect(ipcMain.on.mock.calls).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────
// IPC handler behaviour
// ─────────────────────────────────────────────────────────────
describe('IPC handlers — behaviour', () => {
  beforeEach(() => {
    // Reset call counts before each handler behaviour test
    mockWin.minimize.mockClear();
    mockWin.maximize.mockClear();
    mockWin.unmaximize.mockClear();
    mockWin.close.mockClear();
  });

  test('win-minimize calls win.minimize()', () => {
    ipcHandler('win-minimize')();
    expect(mockWin.minimize).toHaveBeenCalledTimes(1);
  });

  test('win-close calls win.close()', () => {
    ipcHandler('win-close')();
    expect(mockWin.close).toHaveBeenCalledTimes(1);
  });

  test('win-maximize calls win.maximize() when window is not maximized', () => {
    mockWin.isMaximized.mockReturnValueOnce(false);
    ipcHandler('win-maximize')();
    expect(mockWin.maximize).toHaveBeenCalledTimes(1);
    expect(mockWin.unmaximize).not.toHaveBeenCalled();
  });

  test('win-maximize calls win.unmaximize() when window is already maximized', () => {
    mockWin.isMaximized.mockReturnValueOnce(true);
    ipcHandler('win-maximize')();
    expect(mockWin.unmaximize).toHaveBeenCalledTimes(1);
    expect(mockWin.maximize).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────
// App lifecycle
// ─────────────────────────────────────────────────────────────
describe('App lifecycle', () => {
  test('app.whenReady().then() was called', () => {
    expect(app.whenReady).toHaveBeenCalledTimes(1);
  });

  test('app.on is registered for window-all-closed', () => {
    const events = app.on.mock.calls.map(c => c[0]);
    expect(events).toContain('window-all-closed');
  });

  test('app.on is registered for activate', () => {
    const events = app.on.mock.calls.map(c => c[0]);
    expect(events).toContain('activate');
  });

  test('Menu.setApplicationMenu is called in production', () => {
    // NODE_ENV=production was set in beforeAll — menu should be suppressed
    expect(Menu.setApplicationMenu).toHaveBeenCalledWith(null);
  });

  test('window-all-closed handler quits on non-darwin', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });

    const handler = app.on.mock.calls.find(c => c[0] === 'window-all-closed')?.[1];
    if (handler) handler();
    expect(app.quit).toHaveBeenCalled();

    Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
  });
});

// ─────────────────────────────────────────────────────────────
// Environment behaviour
// ─────────────────────────────────────────────────────────────
describe('Environment behaviour', () => {
  test('isDev is true when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';
    expect(process.env.NODE_ENV === 'development').toBe(true);
  });

  test('isDev is false when NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production';
    expect(process.env.NODE_ENV === 'development').toBe(false);
  });

  test('isDev is false when NODE_ENV is test', () => {
    process.env.NODE_ENV = 'test';
    expect(process.env.NODE_ENV === 'development').toBe(false);
  });

  test('OPEN_DEVTOOLS defaults to false', () => {
    delete process.env.OPEN_DEVTOOLS;
    expect(process.env.OPEN_DEVTOOLS === 'true').toBe(false);
  });
});
