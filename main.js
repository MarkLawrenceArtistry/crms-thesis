const { app, BrowserWindow } = require('electron')
const path = require('node:path')

// START THE SERVER
require('./app')

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    })

    mainWindow.loadURL('http://localhost:3000')
    console.log("ELECTRON USER DATA PATH:", app.getPath('userData')); 
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function() {
        if(BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function() {
    if(process.platform !== 'darwin') app.quit()
})