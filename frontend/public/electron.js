const { 
    BrowserWindow, 
    Tray, 
    Menu, 
    nativeImage, 
    app, 
    ipcMain, 
    globalShortcut,
    powerMonitor
} = require('electron');
const windowStateKeeper = require('electron-window-state');
const isDev = require('electron-is-dev'); 
const path = require('path'); 


require('./store');
require('./timerSystem');
require('./breakSystem');
require('./notificationSystem');
require('./appSnapshotSystem');
require('./dataUsageSystem');
require('./blockerSystem');
require('./popupWindows');

const DEFAULT_WINDOW_SIZE = {
    defaultWidth: 860,
    defaultHeight: 550,
}

const MAX_WINDOW_SIZE = {
    width: 1280,
    height: 800,
}


global.mainWindow;

let mainWindowState;

/**
 * Configure event listeners and connect the various systems
 */
// Start break when timer ends
timerSystem.on('timer-end', () => breakSystem.start()); 

// Create notification windows when timer ends
timerSystem.on('timer-end', () => notificationSystem.createWindows());  

// Minimize notification when the break time is set/reset
breakSystem.on('break-times-set', () => notificationSystem.minimize()); 

// Expand notification when the break time is past the intermediate point
breakSystem.on('break-intermediate', () => notificationSystem.maximize());

// Start timer when break ends
breakSystem.on('break-end', () => timerSystem.start());

// Close notification windows when break ends
breakSystem.on('break-end', () => notificationSystem.closeWindows());

// Process the list of open apps through the data usage system when a snapshot is taken
appSnapshotSystem.on('app-snapshot-taken', (snapshot) => dataUsageSystem.processAppSnapshot(snapshot));

// Process the list of open apps through the blocker system when a snapshot is taken
appSnapshotSystem.on('app-snapshot-taken', (snapshot) => blockerSystem.processAppSnapshot(snapshot));

// Block the timer when a blocker is detected
blockerSystem.on('blocker-detected', () => timerSystem.block());

// Unblock the timer when all blockers are cleared
blockerSystem.on('blockers-cleared', () => timerSystem.unblock());


/**
 * Function to create the main window
 */
function createWindow() {

    mainWindowState = windowStateKeeper(DEFAULT_WINDOW_SIZE);

    // Instantiate the window
    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        minWidth: DEFAULT_WINDOW_SIZE.defaultWidth,
        minHeight: DEFAULT_WINDOW_SIZE.defaultHeight,
        maxWidth: MAX_WINDOW_SIZE.width,
        maxHeight: MAX_WINDOW_SIZE.height,
        maximizable: false,
        title: 'iCare',
        backgroundColor: '#222222',
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: false,

            // Allow dev tools (for dev) and remote module (for testing) if isDev
            nodeIntegration: isDev,
            devTools: isDev,
            enableRemoteModule: isDev
        },
    });

    // Manage the size of the main window
    mainWindowState.manage(mainWindow);

    // Remove the menu and load the page
    mainWindow.removeMenu()
    mainWindow.loadURL(
        isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`
    );

    // Prevent opening new windows
    mainWindow.webContents.on('new-window', (e, url) => e.preventDefault())

    // Handle the close button action
    mainWindow.on('close', (e) => {
        if (isDev)
            app.exit(); // Just exit the app if isDev
        else {
            e.preventDefault(); // Otherwise, just hide to tray
            mainWindow.hide();
        }
    })

    // Open the window when it is ready to be shown
    mainWindow.on('ready-to-show', () => mainWindow.show());

}


/**
 * Mechanism to allow only one instance of the app at once
 */
const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) app.exit()

/* Show first instance if a second instance is requested */
 app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
})


/**
 * App settings for when user logs in
 */
app.setLoginItemSettings({
    openAtLogin: global.store.get('preferences.startup.startAppOnLogin'),
    enabled: global.store.get('preferences.startup.startAppOnLogin'),
    path: app.getPath('exe')
})

/**
 * Application event handlers
 */
let appTray = null;
app.whenReady().then(() => {

    createWindow()
    
    /* When app is activated and no windows are open, create a window */
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    /* Create tray button */
    const trayIcon = nativeImage.createFromPath(path.join(__dirname, '../trayAssets/icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'iCare', enabled: false },
        { type: 'separator' },
        { label: 'Quit', click: app.exit }
    ]);

    appTray = new Tray(trayIcon);
    appTray.setToolTip('iCare');
    appTray.setContextMenu(contextMenu);
    appTray.on('click', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    /* Allow keyboard shortcut to open DevTools if isDev */
    if (isDev) {
        globalShortcut.register('CommandOrControl+Shift+I', () => {
            mainWindow.webContents.openDevTools()
        });
    }

    /* Block timer if on battery power */
    if (powerMonitor.isOnBatteryPower() && global.store.get('preferences.blockers.blockOnBattery'))
    blockerSystem.addBlocker({
        type: 'Other',
        message: 'Your computer is running on battery power.'
    })

})

/* Handle closing all windows behavior for macOS */
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.exit()
})

/* Prevent loading of new websites */
app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        event.preventDefault()
    })
})


/**
 * IPC event handlers
 * These event handlers are executed when another process invokes the event.
 */

// Log to main process's console
ipcMain.handle('log-to-main', (event, content) => {
    console.log(content.toString());
})

// Restart the app
ipcMain.handle('restart-app', () => {
    app.relaunch();
    app.exit();
})

// Get info about the app
ipcMain.on('get-about-info', (event) => {
    let aboutInfo = {
        appInfo: {
            name: app.getName(),
            version: app.getVersion()
        },
        versions: process.versions,
        contributors: [
            'Elise Hoang',
            'Jalen Ng',
            'Julie Loi',
            'Shiyun Lian',
            'Zuby Javed'
        ],
        openSourceLibraries: [
            '@fluentui/react',
            'axios',
            'chart.js',
            'electron',
            'electron-is-dev',
            'electron-store',
            'electron-window-state',
            'hazardous',
            'react',
            'react-chart',
            'react-charts',
            'react-circle',
            'sound-play'
        ]
    }
    event.returnValue = aboutInfo;
})