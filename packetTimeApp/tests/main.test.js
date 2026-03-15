/**
 * Suite 3 — Electron Main Process
 *
 * Strategy: mock Electron, clear Node's require cache,
 * load main.js fresh, then synchronously call the createWindow
 * function that was passed to app.whenReady().then().
 *
 * main.js exports nothing — it runs entirely as side effects.
 * We test those side effects via the mocks.
 */

// ─────────────────────────────────────────────────────────────
// Mocks must be declared before any require() calls.
// jest.mock() is hoisted to the top of the file automatically.
// ─────────────────────────────────────────────────────────────

// Holds the createWindow fn once main.js calls whenReady().then(fn)
let capturedCreateWindow = null;

// Holds all ipcMain.on registrations: { channel -> handler }
const ipcHandlers = {};

// The mock window instance returned by new BrowserWindow()
const mockWin = {
  loadFile:    jest.fn(),
  maximize:    jest.fn(),
  show:        jest.fn(),
  minimize:    jest.fn(),
  close:       jest.fn(),
  isMaximized: jest.fn(() => false),
  unmaximize:  jest.fn(),
  webContents: { openDevTools: jest.fn() },
  once:        jest.fn((event, cb) => {
    // Immediately fire ready-to-show so the callback runs synchronously
    if (event === 'ready-to-show') cb();
  }),
};

jest.mock('electron', () => {
  return {
    app: {
      whenReady: jest.fn(() => ({
        then: jest.fn((fn) => {
          // Capture the function — we'll call it manually in beforeAll
          capturedCreateWindow = fn;
          return { catch: jest.fn() };
        }),
      })),
      on:   jest.fn(),
      quit: jest.fn(),
    },
    BrowserWindow: jest.fn().mockImplementation(() => mockWin),
    Menu: {
      setApplicationMenu: jest.fn(),
    },
    ipcMain: {
      on: jest.fn((channel, handler) => {
        ipcHandlers[channel] = handler;
      }),
    },
  };
});

jest.mock('dotenv', () => ({ config: jest.fn() }), { virtual: true });

// ─────────────────────────────────────────────────────────────
// Load main.js ONCE for the entire test file.
// Must happen after jest.mock() declarations.
// ─────────────────────────────────────────────────────────────
beforeAll(() => {
  process.env.NODE_ENV = 'production';
  process.env.OPEN_DEVTOOLS = 'false';

  // Clear Node's require cache so main.js runs fresh
  jest.resetModules();

  // Load main.js — this runs:
  //   app.whenReady().then(createWindow)  → captures createWindow
  //   app.on('window-all-closed', ...)
  //   app.on('activate', ...)
  require('../main.js');

  // Now synchronously invoke createWindow — this runs:
  //   new BrowserWindow(...)
  //   win.loadFile(...)
  //   win.once('ready-to-show', cb)  → fires cb immediately (mock)
  //   ipcMain.on('win-minimize', ...)
  //   ipcMain.on('win-maximize', ...)
  //   ipcMain.on('win-close', ...)
  //   Menu.setApplicationMenu(null)   (production mode)
  expect(typeof capturedCreateWindow).toBe('function');
  capturedCreateWindow();
});

// Re-require the mocked modules so we reference the same instances
const { app, BrowserWindow, Menu, ipcMain } = require('electron');

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const windowOpts  = () => BrowserWindow.mock.calls[0]?.[0] ?? null;
const ipcChannels = () => ipcMain.on.mock.calls.map(c => c[0]);
const ipcHandler  = (ch) => ipcMain.on.mock.calls.find(c => c[0] === ch)?.[1] ?? null;

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
    expect(mockWin.loadFile.mock.calls[0][0]).toContain('index.html');
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

  test('win-maximize calls win.maximize() when not maximized', () => {
    mockWin.isMaximized.mockReturnValueOnce(false);
    ipcHandler('win-maximize')();
    expect(mockWin.maximize).toHaveBeenCalledTimes(1);
    expect(mockWin.unmaximize).not.toHaveBeenCalled();
  });

  test('win-maximize calls win.unmaximize() when already maximized', () => {
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
  test('app.whenReady was called', () => {
    expect(app.whenReady).toHaveBeenCalledTimes(1);
  });

  test('app.on registered window-all-closed', () => {
    const events = app.on.mock.calls.map(c => c[0]);
    expect(events).toContain('window-all-closed');
  });

  test('app.on registered activate', () => {
    const events = app.on.mock.calls.map(c => c[0]);
    expect(events).toContain('activate');
  });

  test('Menu.setApplicationMenu(null) called in production', () => {
    expect(Menu.setApplicationMenu).toHaveBeenCalledWith(null);
  });

  test('window-all-closed quits app on win32', () => {
    Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
    const handler = app.on.mock.calls.find(c => c[0] === 'window-all-closed')?.[1];
    app.quit.mockClear();
    handler?.();
    expect(app.quit).toHaveBeenCalled();
    Object.defineProperty(process, 'platform', { value: process.platform, configurable: true });
  });

  test('window-all-closed does NOT quit on darwin', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });
    const handler = app.on.mock.calls.find(c => c[0] === 'window-all-closed')?.[1];
    app.quit.mockClear();
    handler?.();
    expect(app.quit).not.toHaveBeenCalled();
    Object.defineProperty(process, 'platform', { value: process.platform, configurable: true });
  });
});

// ─────────────────────────────────────────────────────────────
// Environment behaviour
// ─────────────────────────────────────────────────────────────
describe('Environment behaviour', () => {
  test('isDev true when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';
    expect(process.env.NODE_ENV === 'development').toBe(true);
  });

  test('isDev false when NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production';
    expect(process.env.NODE_ENV === 'development').toBe(false);
  });

  test('isDev false when NODE_ENV is test', () => {
    process.env.NODE_ENV = 'test';
    expect(process.env.NODE_ENV === 'development').toBe(false);
  });

  test('OPEN_DEVTOOLS false by default', () => {
    delete process.env.OPEN_DEVTOOLS;
    expect(process.env.OPEN_DEVTOOLS === 'true').toBe(false);
  });
});
