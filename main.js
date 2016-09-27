'use strict'

/* eslint no-path-concat: 0, func-names:0 */

const { app, BrowserWindow, ipcMain: ipc } = require('electron')
const isPackaged = !process.argv[0].match(/(?:node|io)(?:\.exe)?/i)
const open = require('open')
const shortcuts = require('electron-localshortcut')

// Force production environment in final binary
if (isPackaged) {
  process.env.NODE_ENV = 'production'
}

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')({
    showDevTools: true
  })
  const devtools = require('electron-devtools-installer')
  app.on('ready', () => {
    [ 'REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS' ].forEach(t => {
      devtools.default(devtools[t])
        .then(name => console.log(`Added Extension:  ${name}`)) // eslint-disable-line no-console
        .catch(err => console.error('An error occurred during redux devtools install: ', err)) // eslint-disable-line no-console
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  let window = new BrowserWindow({ center: true, width: 1024, height: 728, resizable: true })

  if (process.env.NODE_ENV === 'development') {
    window.loadURL('file://' + __dirname + '/app/index-dev.html')
  } else {
    window.loadURL('file://' + __dirname + '/app/index.html')
  }

  window.maximize()

  window.on('closed', () => {
    window = null
  })

  // Disable menubar
  window.setMenu(null)

  // Debug menu, whatever environment
  shortcuts.register('Shift+Ctrl+C', () => window.toggleDevTools())
  shortcuts.register('Shift+Cmd+C', () => window.toggleDevTools())
  shortcuts.register('F12', () => window.toggleDevTools())

  // allows more listeners for "browser-window-focus" and "browswer-window-blur" events
  // which are used by electron-shortcut
  app.setMaxListeners(25)

  // Register shortcuts from here
  // Rendered app cannot register shortcuts directly, we have to use IPC,
  // on the other hand the rendered app must execute the callback
  // So this event is just used to notify rendered app that an expected key combination has been pressed
  ipc.on('registerShortcut', (event, accels) => {
    const eventName = `shortcut-${accels}`
    if (!Array.isArray(accels)) {
      accels = [accels]
    }
    accels.forEach(accel => shortcuts.register(accel, () => event.sender.send(eventName)))
  })
  ipc.on('unregisterShortcut', (_, accels) => {
    if (!Array.isArray(accels)) {
      accels = [accels]
    }
    accels.forEach(accel => shortcuts.unregister(accel))
  })

  // Open files in external app
  ipc.on('openExternal', (_, what, opener, cb) => {
    open(what, opener, cb)
  })

  // Handle certificate errors
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // TODO ask user to accept rendering?
    // TODO warn user that this page is insecure
    // TODO store URLs marked as insecure, because this even is triggered only once, so we won't be able to warn user more than once without this
    event.preventDefault()
    callback(true)
  })

})
