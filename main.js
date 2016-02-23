'use strict'

/* eslint no-path-concat: 0, func-names:0 */

const app = require('app')
const BrowserWindow = require('browser-window')
const Menu = require('menu')
const ipc = require('electron').ipcMain
const Shortcut = require('electron-shortcut')
const isPackaged = !process.argv[0].match(/(?:node|io)(?:\.exe)?/i)
const open = require('open')

// Force production environment in final binary
if (isPackaged) {
  process.env.NODE_ENV = 'production'
}

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')({
    showDevTools: true
  })
}

require('crash-reporter').start()

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

  const menus = [
    {
      label: '&Hyphe',
      submenu: [
        {
          label: '&Full Screen',
          accelerator: 'F11',
          click: () => {
            window.setFullScreen(!window.isFullScreen())
          }
        },
        {
          label: '&Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    }
  ]

  if (process.env.NODE_ENV === 'development') {
    menus.push({
      label: 'Debug',
      submenu: [
        {
          label: 'Toggle &Developer Tools',
          accelerator: 'Alt+Shift+C',
          click: () => {
            window.toggleDevTools()
          }
        }
      ]
    })
  }

  window.setMenu(Menu.buildFromTemplate(menus))

  // shortcuts can only be handled here, in the main process
  let shortcuts = new Map()

  // allows more listeners for "browser-window-focus" and "browswer-window-blur" events
  // which are used by electron-shortcut
  app.setMaxListeners(25)

  // Fix a bug in electron-shortcut that would make in never call removeListener and pile up "browser-window-focus" events
  function newShortcut (accel, handler) {
    let shortcut = new Shortcut(accel, handler)
    shortcut.unregister = function () { // no arrow-function here, we *want* the reference to this
      for (const event of Object.keys(this._shortcuts)) {
        this._shortcuts[event].autoRegister = false // that does the trick of removing listener
        this._shortcuts[event].unregister()
      }
    }
    return shortcut
  }

  // ipcMain should be used, window.webContent.on is never triggered for ipc
  ipc.on('registerShortcut', (_, accel) => {
    const key = JSON.stringify(accel)
    const eventName = `shortcut-${accel}`
    const shortcut = newShortcut(accel, () => window.webContents.send(eventName))
    shortcut.register() // Force register, or we'll have to wait for an alt-tab to trigger blur/focus
    shortcuts.set(key, shortcut)
  })

  ipc.on('unregisterShortcut', (_, accel) => {
    const key = JSON.stringify(accel)
    const shortcut = shortcuts.get(key)
    if (shortcut) {
      // a bug in 'electron-shortcut' forces us to set this prop to false in order to force
      // removeListener, so that we don't pile up "browser-window-focus" events
      shortcut.autoRegister = false
      shortcuts.get(key).unregister()
      shortcuts.delete(key)
    }
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
