import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { spawn, ChildProcess } from 'child_process';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
let server: any = null;
let backendProcess: ChildProcess | null = null;
const isDev = process.env.NODE_ENV === 'development';
const PORT = isDev ? 5000 : 5001;

// Start Express server for production
const startServer = async () => {
  if (isDev) return; // In development, use external server
  
  try {
    // Check if backend server exists
    const serverPath = path.join(process.resourcesPath, 'backend', 'index.js');
    
    if (require('fs').existsSync(serverPath)) {
      // Start the full backend server as a separate process
      console.log('🚀 Starting full backend server...');
      
      const serverEnv = {
        ...process.env,
        NODE_ENV: 'production',
        PORT: PORT.toString()
      };
      
      backendProcess = spawn('node', [serverPath], {
        env: serverEnv,
        stdio: ['inherit', 'pipe', 'pipe']
      });
      
      backendProcess.stdout?.on('data', (data) => {
        console.log('📡 Backend:', data.toString().trim());
      });
      
      backendProcess.stderr?.on('data', (data) => {
        console.error('🚨 Backend Error:', data.toString().trim());
      });
      
      backendProcess.on('error', (error) => {
        console.error('❌ Failed to start backend process:', error);
        startFallbackServer();
      });
      
      backendProcess.on('exit', (code) => {
        console.log(`Backend process exited with code ${code}`);
        if (code !== 0) {
          startFallbackServer();
        }
      });
      
      console.log('✅ Backend server process started on port', PORT);
      
      // Wait a moment for the server to start up
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } else {
      console.log('⚠️ Backend server not found');
      startFallbackServer();
      return; // Don't try to load the app if no backend
    }
  } catch (error) {
    console.error('❌ Error starting server:', error);
    startFallbackServer();
  }
};

const startFallbackServer = () => {
  console.log('🔄 Starting fallback mode...');
  console.log('⚠️ Backend server could not be started. The app will work in limited mode.');
  // In fallback mode, we'll just show an error page or basic functionality
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
  console.log(`📱 Loading application from: ${appUrl}`);
  
  try {
    await mainWindow.loadURL(appUrl);
    console.log('✅ Application loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load application:', error);
    // Show error dialog or fallback page
  }
  
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
  
  // Kill backend process if running
  if (backendProcess) {
    backendProcess.kill();
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
  
  if (backendProcess) {
    backendProcess.kill();
  }
});