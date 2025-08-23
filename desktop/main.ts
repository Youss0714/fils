import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === 'development';

const createWindow = (): void => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    show: false, // Don't show until ready-to-show
    titleBarStyle: 'default',
    title: 'YGestion - Gestion Commerciale et Comptable'
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, serve the built files
    const indexPath = path.join(__dirname, '..', '..', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Security: prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
};

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // On OS X, re-create a window when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On OS X, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event: any, contents: any) => {
  contents.on('new-window', (event: any, navigationUrl: any) => {
    event.preventDefault();
  });
});