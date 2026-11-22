const { app, BrowserWindow } = require('electron')
const path = require('node:path')

let win

function createWindow() {
  win = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })
  win.webContents.on('render-process-gone', () => win.webContents.reload())
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.focus()
  })
  app.whenReady().then(createWindow)
}

app.on('window-all-closed', () => app.quit())
