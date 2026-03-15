// Load .env variables into process.env (dev only — no-op if file missing)
require('dotenv').config();

const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

const isDev  = process.env.NODE_ENV === 'development';
const openDT = process.env.OPEN_DEVTOOLS === 'true';

function createWindow() {
  const win = new BrowserWindow({
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0d1117',
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src/preload.js'),
      devTools: isDev,
    },
    show: false,
  });

  win.loadFile(path.join(__dirname, 'src/index.html'));

  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
    if (isDev && openDT) win.webContents.openDevTools();
  });

  // Window control IPC — called from renderer via preload
  ipcMain.on('win-minimize', () => win.minimize());
  ipcMain.on('win-maximize', () => win.isMaximized() ? win.unmaximize() : win.maximize());
  ipcMain.on('win-close',    () => win.close());

  // In production, suppress the default menu entirely
  if (!isDev) Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
