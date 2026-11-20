const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    isDesktop: true,
    platform: process.platform,
    version: '1.0.0',
    printReceipt: (options) => ipcRenderer.invoke('print-receipt', options),
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close')
});
