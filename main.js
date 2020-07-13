const {
  app,
  ipcMain,
  autoUpdater,
  dialog,
  BrowserWindow,
  Menu
} = require('electron')

ipcMain.on('getapppath', (event) => {
  const result = app.getAppPath()
  event.reply('getapppath', result)
})

ipcMain.on('getdownloadpath', (event) => {
  const result = app.getPath("downloads")
  event.reply('getdownloadpath', result)
})

function createdownloadWindow() {
  let win2 = new BrowserWindow({
    width: 400, //400
    height: 130, //100
    webPreferences: {
      nodeIntegration: true
    }
  })
  win2.removeMenu()
  win2.loadFile('download.html')
  win2.setResizable(false)
  win2.center()
  //win2.webContents.openDevTools()
}

ipcMain.on('checkids', (event) => {
  let result = BrowserWindow.getAllWindows().length
  if (result < 2) {
    createdownloadWindow()
  }
})

ipcMain.on('statusupd', (event, args) => {
  let winarray = BrowserWindow.getAllWindows()
  let last_winarray = winarray[winarray.length -2];
  last_winarray.webContents.executeJavaScript(`
  document.getElementsByClassName("manganame")[0].innerHTML = "${args[0]}" + " ${args[3]}"
  document.getElementsByClassName("chapternumber")[0].innerHTML = ${args[1]} + "/" + ${args[2]}
  document.getElementsByClassName("myBar")[0].style.width = 100/${args[2]} * ${args[1]} + "%";
  `)
})

ipcMain.on('statuspacked', (event, args) => {
  let winarray = BrowserWindow.getAllWindows()
  let last_winarray = winarray[winarray.length -2];
  last_winarray.webContents.executeJavaScript(`
  document.getElementsByClassName("packed")[0].innerHTML = "Completed: " + "${args[0]}"
  `)
})

ipcMain.on('statusdel', (event, args) => {
  let winarray = BrowserWindow.getAllWindows()
  let last_winarray = winarray[winarray.length -2];
  last_winarray.webContents.executeJavaScript(`
  document.getElementsByClassName("deleted")[0].innerHTML = "Deleted: " + "${args[0]}" + " folder."
  `)
})

ipcMain.on('changecss', () => {
  let winarray = BrowserWindow.getAllWindows()
  let last_winarray = winarray[winarray.length -2];
  last_winarray.webContents.on('dom-ready', () => {
  last_winarray.webContents.executeJavaScript(`
    c1 = document.createElement('div')
    c1.className = "manganame"
    document.getElementsByClassName("container2")[0].appendChild(c1)
    c2 = document.createElement('div')
    c2.className = "chapternumber"
    document.getElementsByClassName("container2")[0].appendChild(c2)
    c3 = document.createElement('div')
    c3.className = "myProgress"
    c3.innerHTML = '<div class="myBar"></div>'
    document.getElementsByClassName("container2")[0].appendChild(c3)
    c4 = document.createElement('div')
    c4.className = "packed"
    document.getElementsByClassName("container2")[0].appendChild(c4)
    c5 = document.createElement('div')
    c5.className = "deleted"
    document.getElementsByClassName("container2")[0].appendChild(c5)
    `)
  })
})

/*const server = 'https://manga-scraper-update.herokuapp.com'
const url = `${server}/update/${process.platform}/${app.getVersion()}`
console.log(url)

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
 })*/

function createWindow() {
  // Erstelle das Browser-Fenster.
  var menu = Menu.buildFromTemplate([{
    label: 'Menu',
    submenu: [{
        label: 'Open DevTools',
        click() {
          win.webContents.openDevTools()
        }
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