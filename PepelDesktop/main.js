// Электрон-оболочка для игры. Запуск: npm start (игра) или npm run start:ctf (CTF-версия)
const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const path = require('path');
const arg = process.argv.find(a => a.startsWith('--game='));
const fs = require('fs');
const game = arg ? arg.slice(7) : (process.env.PEPEL_GAME || (fs.existsSync(path.join(__dirname, 'app', 'main')) ? 'main' : 'ctf'));
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
function create() {
  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({ width: 1280, height: 720, minWidth: 640, minHeight: 360, backgroundColor: '#05060a', title: 'Пепел войны', autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, backgroundThrottling: false } });
  win.loadFile(path.join(__dirname, 'app', game === 'ctf' ? 'ctf' : 'main', 'index.html'));
  win.webContents.on('before-input-event', (e, i) => {
    if (i.type !== 'keyDown') return;
    if (i.key === 'F11') win.setFullScreen(!win.isFullScreen());
    if (i.key === 'F12' && game === 'ctf') win.webContents.toggleDevTools();   // в CTF-режиме DevTools разрешены
  });
}
app.whenReady().then(create); app.on('window-all-closed', () => app.quit());
