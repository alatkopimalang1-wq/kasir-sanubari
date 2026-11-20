const { app, BrowserWindow, ipcMain, Menu, Tray, session } = require('electron');
const path = require('path');

// 1. Single Instance Lock — Prevent multiple processes and focus existing window instantly
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
    process.exit(0);
}

// 2. Direct POS URL (skips login redirect if session cookie is already saved)
const POS_URL = process.env.POS_URL || 'https://sanubariroastery.co.id/pos';

let mainWindow = null;
let tray = null;
let isQuitting = false;

// 3. Command line switches for disk caching and speed
app.commandLine.appendSwitch('disk-cache-size', '1073741824'); // 1 GB cache for scripts, styles, images
app.commandLine.appendSwitch('disable-http-cache', 'false');
app.commandLine.appendSwitch('enable-features', 'NetworkService,NetworkServiceInProcess');

function createWindow() {
    const ses = session.fromPartition('persist:sanubari_pos');
    ses.setSpellCheckerEnabled(false);

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 600,
        title: 'Sanubari POS — Terminal Kasir',
        icon: path.join(__dirname, 'icon.png'),
        backgroundColor: '#141210',
        autoHideMenuBar: true,
        webPreferences: {
            partition: 'persist:sanubari_pos', // Permanent partition for cookies, LocalStorage, IndexedDB & HTTP cache
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true,
            spellcheck: false,
        },
    });

    // Remove top window menu bar completely for clean modern POS UI
    mainWindow.setMenu(null);
    mainWindow.setMenuBarVisibility(false);
    Menu.setApplicationMenu(null);

    // Keyboard shortcuts (F11 Fullscreen, Ctrl+R Reload) without top menu bar
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown') {
            if (input.key === 'F11') {
                mainWindow.setFullScreen(!mainWindow.isFullScreen());
                event.preventDefault();
            } else if ((input.control || input.meta) && input.key.toLowerCase() === 'r') {
                mainWindow.reload();
                event.preventDefault();
            }
        }
    });

    // Custom User Agent for PC Desktop App
    const defaultUA = mainWindow.webContents.getUserAgent();
    mainWindow.webContents.setUserAgent(`${defaultUA} SanubariPOS-Desktop/1.0`);

    // Load the POS live application
    mainWindow.loadURL(POS_URL);

    // Handle offline / connection failures gracefully
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.warn('POS page failed to load:', errorCode, errorDescription);
        setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.loadURL(POS_URL);
            }
        }, 5000);
    });

    // Minimize to System Tray on close instead of destroying process
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createTray() {
    if (tray) return;

    try {
        const trayIconPath = path.join(__dirname, 'icon.png');
        tray = new Tray(trayIconPath);
        tray.setToolTip('Sanubari POS — Terminal Kasir');

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Buka Sanubari POS',
                click: () => {
                    if (mainWindow) {
                        mainWindow.show();
                        mainWindow.focus();
                    }
                },
            },
            {
                label: 'Muat Ulang Halaman',
                click: () => {
                    if (mainWindow) {
                        mainWindow.reload();
                    }
                },
            },
            { type: 'separator' },
            {
                label: 'Keluar Aplikasi',
                click: () => {
                    isQuitting = true;
                    app.quit();
                },
            },
        ]);

        tray.setContextMenu(contextMenu);

        tray.on('click', () => {
            if (mainWindow) {
                if (mainWindow.isVisible()) {
                    mainWindow.focus();
                } else {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        });

        tray.on('double-click', () => {
            if (mainWindow) {
                mainWindow.show();
                mainWindow.focus();
            }
        });
    } catch (e) {
        console.warn('Could not create system tray:', e);
    }
}

// Second instance triggered: focus the existing instance immediately without reloading
app.on('second-instance', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        if (!mainWindow.isVisible()) mainWindow.show();
        mainWindow.focus();
    }
});

// Window controls from renderer IPC
ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on('window-close', () => {
    if (mainWindow) {
        mainWindow.hide(); // Hide to tray instead of quitting
    }
});

ipcMain.on('toggle-fullscreen', () => {
    if (mainWindow) {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
});

// IPC Handlers for Printing
ipcMain.handle('get-printers', async () => {
    if (!mainWindow) return [];
    return await mainWindow.webContents.getPrintersAsync();
});

ipcMain.handle('print-receipt', async (event, options = {}) => {
    if (!mainWindow) return { success: false, error: 'Window not found' };

    let deviceName = options.printerName || '';
    if (!deviceName) {
        try {
            const printers = await mainWindow.webContents.getPrintersAsync();
            if (Array.isArray(printers) && printers.length > 0) {
                const defaultPrinter = printers.find((p) => p && p.isDefault);
                const posPrinter = printers.find(
                    (p) =>
                        p &&
                        typeof p.name === 'string' &&
                        /(pos|thermal|58|80|receipt|xprinter|eppos|vsc|iware|blueprint|panda|epson|star|bixolon|zjiang|gprinter)/i.test(
                            p.name
                        )
                );
                if (defaultPrinter && defaultPrinter.name) {
                    deviceName = defaultPrinter.name;
                } else if (posPrinter && posPrinter.name) {
                    deviceName = posPrinter.name;
                } else if (printers[0] && printers[0].name) {
                    deviceName = printers[0].name;
                }
            }
        } catch {
            // Ignore printer lookup errors and fall back to default OS printer
        }
    }

    const doPrint = (printOpts) =>
        new Promise((resolve) => {
            mainWindow.webContents.print(printOpts, (success, failureReason) => {
                resolve({ success, error: failureReason });
            });
        });

    const baseOpts = {
        silent: options.silent ?? true,
        printBackground: true,
        deviceName,
        margins: { marginType: 'none' },
    };

    if (options.pageSize) {
        const res = await doPrint({ ...baseOpts, pageSize: options.pageSize });
        if (res.success) return res;
    }

    return await doPrint(baseOpts);
});

app.on('before-quit', () => {
    isQuitting = true;
});

// App Lifecycle
app.whenReady().then(() => {
    createWindow();
    createTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin' && isQuitting) {
        app.quit();
    }
});
