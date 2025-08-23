import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
let server: any = null;
const isDev = process.env.NODE_ENV === 'development';
const PORT = isDev ? 5000 : 5001;

// Start Express server for production
const startServer = async () => {
  if (isDev) return; // In development, use external server
  
  // Simple static server for now
  const app = express();
  
  // Path to resources in packaged app
  const webPath = path.join(process.resourcesPath, 'web');
  
  // Serve static files from the web directory
  app.use(express.static(webPath));
  
  // Catch all handler: send back index.html
  app.get('*', (req, res) => {
    const indexPath = path.join(webPath, 'index.html');
    res.sendFile(indexPath);
  });
  
  server = app.listen(PORT, () => {
    console.log('✅ Static server started on port', PORT);
    console.log('📁 Serving files from:', webPath);
  });
};

const createWindow = async (): Promise<void> => {
  // Start server first in production
  if (!isDev) {
    await startServer();
    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow local connections
    },
    show: false,
    titleBarStyle: 'default',
    title: 'YGestion - Gestion Commerciale et Comptable'
  });

  // Load the app
  const appUrl = `http://localhost:${PORT}`;
  mainWindow.loadURL(appUrl);
  
  if (isDev) {
    mainWindow.webContents.openDevTools();
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
  // Close server if running
  if (server) {
    server.close();
  }
  
  // On OS X, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Before quit, clean up
app.on('before-quit', () => {
  if (server) {
    server.close();
  }
});