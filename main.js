const {
  app,
  autoUpdater,
  dialog,
  BrowserWindow,
  Menu
} = require('electron')

const server = 'https://your-deployment-url.com'
const url = `${server}/update/${process.platform}/${app.getVersion()}`

autoUpdater.setFeedURL({ url })

setInterval(() => {
  autoUpdater.checkForUpdates()
 }, 320000)

 autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
   }
 
   dialog.showMessageBox(dialogOpts).then((returnValue) => {
     if (returnValue.response === 0) autoUpdater.quitAndInstall()
   })
 })

 autoUpdater.on('error', message => {
  console.error('There was a problem updating the application')
  console.error(message)
 })

function createWindow() {
  // Erstelle das Browser-Fenster.
  var menu = Menu.buildFromTemplate([{
    label: 'Menu',
    submenu: [{
        label: 'Poop'
      },
      {
        type: 'separator'
      },
      {
        label: 'Exit',
        click() {
          app.quit()
        }
      }
    ]
  }])
  Menu.setApplicationMenu(menu);

  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Öffnen der DevTools.
  win.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Einige APIs können nur nach dem Auftreten dieses Events genutzt werden.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // Unter macOS ist es üblich, für Apps und ihre Menu Bar
  // aktiv zu bleiben, bis der Nutzer explizit mit Cmd + Q die App beendet.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // Unter macOS ist es üblich ein neues Fenster der App zu erstellen, wenn
  // das Dock Icon angeklickt wird und keine anderen Fenster offen sind.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})