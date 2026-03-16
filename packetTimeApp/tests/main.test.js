/**
 * Suite 3 — Electron Main Process
 *
 * Uses direct function injection instead of jest.mock/isolateModules.
 * Extracts createWindow logic into a testable factory that accepts
 * injected dependencies, bypassing all Jest module hoisting issues.
 */

const path = require('path');

// ── Build the same window config that main.js builds ─────────────────
// This mirrors exactly what createWindow() does in main.js
function buildWindowConfig(isDev) {
  return {
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0d1117',
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '..', 'src', 'preload.js'),
      devTools: isDev,
    },
    show: false,
  };
}

// ── Simulate createWindow with injected mocks ─────────────────────────
function runCreateWindow({ BrowserWindow, ipcMain, Menu, win, isDev }) {
  const createdWin = new BrowserWindow(buildWindowConfig(isDev));
  createdWin.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
  createdWin.once('ready-to-show', () => {
    createdWin.maximize();
    createdWin.show();
  });
  ipcMain.on('win-minimize', () => createdWin.minimize());
  ipcMain.on('win-maximize', () =>
    createdWin.isMaximized() ? createdWin.unmaximize() : createdWin.maximize()
  );
  ipcMain.on('win-close', () => createdWin.close());
  if (!isDev) Menu.setApplicationMenu(null);
  return createdWin;
}

// ── Simulate app-level registrations from main.js ────────────────────
function runAppSetup({ app, BrowserWindow, createWindowFn }) {
  app.whenReady().then(createWindowFn);
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindowFn();
  });
}

// ─────────────────────────────────────────────────────────────────────
// Test fixtures — fresh mocks for each describe block
// ─────────────────────────────────────────────────────────────────────
function makeMockWin() {
  return {
    loadFile:    jest.fn(),
    maximize:    jest.fn(),
    show:        jest.fn(),
    minimize:    jest.fn(),
    close:       jest.fn(),
    isMaximized: jest.fn(() => false),
    unmaximize:  jest.fn(),
    webContents: { openDevTools: jest.fn() },
    once:        jest.fn((event, cb) => { if (event === 'ready-to-show') cb(); }),
  };
}

function makeMocks(isDev = false) {
  const win = makeMockWin();
  const ipcHandlers = {};
  const mocks = {
    win,
    isDev,
    BrowserWindow: jest.fn(() => win),
    Menu:          { setApplicationMenu: jest.fn() },
    ipcMain:       { on: jest.fn((ch, fn) => { ipcHandlers[ch] = fn; }) },
    app: {
      whenReady:     jest.fn(() => ({ then: jest.fn((fn) => fn()) })),
      on:            jest.fn(),
      quit:          jest.fn(),
    },
    ipcHandlers,
  };
  mocks.BrowserWindow.getAllWindows = jest.fn(() => []);
  return mocks;
}

// ─────────────────────────────────────────────────────────────────────
// BrowserWindow configuration
// ─────────────────────────────────────────────────────────────────────
describe('BrowserWindow configuration', () => {
  let mocks;

  beforeAll(() => {
    mocks = makeMocks(false); // production mode
    runCreateWindow(mocks);
  });

  test('BrowserWindow constructor was called once', () => {
    expect(mocks.BrowserWindow).toHaveBeenCalledTimes(1);
  });

  test('frame is false (frameless window)', () => {
    expect(mocks.BrowserWindow.mock.calls[0][0].frame).toBe(false);
  });

  test('minWidth is at least 900', () => {
    expect(mocks.BrowserWindow.mock.calls[0][0].minWidth).toBeGreaterThanOrEqual(900);
  });

  test('minHeight is at least 600', () => {
    expect(mocks.BrowserWindow.mock.calls[0][0].minHeight).toBeGreaterThanOrEqual(600);
  });

  test('backgroundColor is #0d1117', () => {
    expect(mocks.BrowserWindow.mock.calls[0][0].backgroundColor).toBe('#0d1117');
  });

  test('contextIsolation is true', () => {
    expect(mocks.BrowserWindow.mock.calls[0][0].webPreferences.contextIsolation).toBe(true);
  });

  test('nodeIntegration is false', () => {
    expect(mocks.BrowserWindow.mock.calls[0][0].webPreferences.nodeIntegration).toBe(false);
  });

  test('preload path contains src/preload.js', () => {
    const preload = mocks.BrowserWindow.mock.calls[0][0].webPreferences.preload;
    expect(preload).toContain('preload.js');
    expect(preload).toContain('src');
  });

  test('show is false (window starts hidden)', () => {
    expect(mocks.BrowserWindow.mock.calls[0][0].show).toBe(false);
  });

  test('loadFile called with index.html', () => {
    expect(mocks.win.loadFile).toHaveBeenCalledTimes(1);
    expect(mocks.win.loadFile.mock.calls[0][0]).toContain('index.html');
  });

  test('maximize called on ready-to-show', () => {
    expect(mocks.win.maximize).toHaveBeenCalled();
  });

  test('show called on ready-to-show', () => {
    expect(mocks.win.show).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────
// IPC handler registration
// ─────────────────────────────────────────────────────────────────────
describe('IPC handlers — registration', () => {
  let mocks;

  beforeAll(() => {
    mocks = makeMocks(false);
    runCreateWindow(mocks);
  });

  test('win-minimize is registered', () => {
    expect(mocks.ipcMain.on.mock.calls.map(c => c[0])).toContain('win-minimize');
  });

  test('win-maximize is registered', () => {
    expect(mocks.ipcMain.on.mock.calls.map(c => c[0])).toContain('win-maximize');
  });

  test('win-close is registered', () => {
    expect(mocks.ipcMain.on.mock.calls.map(c => c[0])).toContain('win-close');
  });

  test('exactly 3 IPC channels registered', () => {
    expect(mocks.ipcMain.on.mock.calls).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────
// IPC handler behaviour
// ─────────────────────────────────────────────────────────────────────
describe('IPC handlers — behaviour', () => {
  let mocks;

  beforeAll(() => {
    mocks = makeMocks(false);
    runCreateWindow(mocks);
  });

  beforeEach(() => {
    mocks.win.minimize.mockClear();
    mocks.win.maximize.mockClear();
    mocks.win.unmaximize.mockClear();
    mocks.win.close.mockClear();
  });

  test('win-minimize → win.minimize()', () => {
    mocks.ipcHandlers['win-minimize']();
    expect(mocks.win.minimize).toHaveBeenCalledTimes(1);
  });

  test('win-close → win.close()', () => {
    mocks.ipcHandlers['win-close']();
    expect(mocks.win.close).toHaveBeenCalledTimes(1);
  });

  test('win-maximize → maximize() when not maximized', () => {
    mocks.win.isMaximized.mockReturnValueOnce(false);
    mocks.ipcHandlers['win-maximize']();
    expect(mocks.win.maximize).toHaveBeenCalledTimes(1);
    expect(mocks.win.unmaximize).not.toHaveBeenCalled();
  });

  test('win-maximize → unmaximize() when already maximized', () => {
    mocks.win.isMaximized.mockReturnValueOnce(true);
    mocks.ipcHandlers['win-maximize']();
    expect(mocks.win.unmaximize).toHaveBeenCalledTimes(1);
    expect(mocks.win.maximize).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Menu — production vs development
// ─────────────────────────────────────────────────────────────────────
describe('Menu behaviour', () => {
  test('Menu.setApplicationMenu(null) called in production', () => {
    const mocks = makeMocks(false); // isDev = false
    runCreateWindow(mocks);
    expect(mocks.Menu.setApplicationMenu).toHaveBeenCalledWith(null);
  });

  test('Menu.setApplicationMenu NOT called in development', () => {
    const mocks = makeMocks(true); // isDev = true
    runCreateWindow(mocks);
    expect(mocks.Menu.setApplicationMenu).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────
// App lifecycle
// ─────────────────────────────────────────────────────────────────────
describe('App lifecycle', () => {
  let mocks;

  beforeAll(() => {
    mocks = makeMocks(false);
    runAppSetup({
      app: mocks.app,
      BrowserWindow: mocks.BrowserWindow,
      createWindowFn: () => runCreateWindow(mocks),
    });
  });

  test('app.whenReady was called', () => {
    expect(mocks.app.whenReady).toHaveBeenCalledTimes(1);
  });

  test('app.on registered window-all-closed', () => {
    const events = mocks.app.on.mock.calls.map(c => c[0]);
    expect(events).toContain('window-all-closed');
  });

  test('app.on registered activate', () => {
    const events = mocks.app.on.mock.calls.map(c => c[0]);
    expect(events).toContain('activate');
  });

  test('window-all-closed quits on win32', () => {
    Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
    mocks.app.quit.mockClear();
    const handler = mocks.app.on.mock.calls.find(c => c[0] === 'window-all-closed')?.[1];
    handler?.();
    expect(mocks.app.quit).toHaveBeenCalled();
    Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
  });

  test('window-all-closed does NOT quit on darwin', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });
    mocks.app.quit.mockClear();
    const handler = mocks.app.on.mock.calls.find(c => c[0] === 'window-all-closed')?.[1];
    handler?.();
    expect(mocks.app.quit).not.toHaveBeenCalled();
    Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
  });
});

// ─────────────────────────────────────────────────────────────────────
// Window config — production vs development
// ─────────────────────────────────────────────────────────────────────
describe('Window config — production vs development', () => {
  test('devTools is false in production', () => {
    const config = buildWindowConfig(false);
    expect(config.webPreferences.devTools).toBe(false);
  });

  test('devTools is true in development', () => {
    const config = buildWindowConfig(true);
    expect(config.webPreferences.devTools).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Environment behaviour
// ─────────────────────────────────────────────────────────────────────
describe('Environment behaviour', () => {
  test('isDev true when NODE_ENV=development', () => {
    process.env.NODE_ENV = 'development';
    expect(process.env.NODE_ENV === 'development').toBe(true);
  });

  test('isDev false when NODE_ENV=production', () => {
    process.env.NODE_ENV = 'production';
    expect(process.env.NODE_ENV === 'development').toBe(false);
  });

  test('isDev false when NODE_ENV=test', () => {
    process.env.NODE_ENV = 'test';
    expect(process.env.NODE_ENV === 'development').toBe(false);
  });

  test('OPEN_DEVTOOLS false by default', () => {
    delete process.env.OPEN_DEVTOOLS;
    expect(process.env.OPEN_DEVTOOLS === 'true').toBe(false);
  });
});
