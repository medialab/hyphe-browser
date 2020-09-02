'use strict'

/* eslint no-path-concat: 0, func-names:0 */

const { app, BrowserWindow, ipcMain: ipc, Menu } = require('electron')
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

  // this was introduced by @mydu for some reason at one point
  // but it breaks sigma.js integration, so commenting it for now
  // app.disableHardwareAcceleration()
}

let window

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  window = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    },
    center: true,
    width: 1024,
    height: 728,
    resizable: true
  })

  window.webContents.on('did-finish-load', () => {
    window.webContents.executeJavaScript('localStorage.getItem("hyphe")')
      .then((value) => {
        if (!value) return
        value = JSON.parse(value)
        if (!value.options) return
        if (!value.options['locale']) return
        const menu = getNewMenuBar(value.options['locale'])
        Menu.setApplicationMenu(menu)
      })
  })

  if (process.env.NODE_ENV === 'development') {
    require('./dev-server')
    window.loadURL('file://' + __dirname + '/app/index-dev.html')

    // electron-devtools-installer is not compatible electron 9
    const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer')
    installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err))
  } else {
    window.loadURL('file://' + __dirname + '/app/index.html')
  }

  window.maximize()

  window.on('closed', () => {
    window = null
  })

  ipc.on('appMount', (e, locale) => {
    const menu = getNewMenuBar(locale)
    Menu.setApplicationMenu(menu)
  })

  ipc.on('setLocaleMain', (e, locale) => {
    const menu = getNewMenuBar(locale)
    Menu.setApplicationMenu(menu)
  })

  // Debug menu, whatever environment
  shortcuts.register('Shift+Ctrl+C', () => window.toggleDevTools())
  shortcuts.register('Shift+Cmd+C', () => window.toggleDevTools())
  shortcuts.register('F12', () => window.toggleDevTools())

  // Force reload
  shortcuts.register('Shift+Ctrl+R', () => window.reload())

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


function getNewMenuBar (locale) {
  const isMac = process.platform === 'darwin'
  const langEn = locale === 'en-US'
  const appName = app.getName()
  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: appName,
      submenu: [
        { role: 'about',
          label: langEn ? 'About' : `À propos de ${appName}`
        },
        { type: 'separator' },
        { role: 'hide',
          label: langEn ? `Hide ${appName}` : `Masquer ${appName}`,
        },
        { role: 'hideothers',
          label: langEn ? 'Hide Others' : 'Masquer les autres'
        },
        { role: 'unhide',
          label: langEn ? 'Show all' : 'Tout afficher'
        },
        { type: 'separator' },
        { role: 'quit',
          label: langEn ? 'Quit' : 'Quitter'
        }
      ]
    }] : []),
    {
      label: langEn ? '&Edit' : 'Édition',
      id: 'edit',
      submenu: [
        {
          label: langEn ? 'Select all' : 'Tout sélectionner',
          role: 'selectall',
          accelerator: 'CmdOrCtrl+A'
        },
        {
          type: 'separator'
        },
        {
          label: langEn ? 'Cut' : 'Couper',
          role: 'cut',
          accelerator: 'CmdOrCtrl+X'
        },
        {
          label: langEn ? 'Copy' : 'Copier',
          role: 'copy',
          accelerator: 'CmdOrCtrl+C'
        },
        {
          label: langEn ? 'Paste' : 'Coller',
          role: 'paste',
          accelerator: 'CmdOrCtrl+V'
        }
      ]
    },
    // { role: 'languageMenu' }
    {
      label:  langEn ? 'Language': 'Langue',
      id: 'lang',
      submenu: [
        { label: langEn ? 'English': 'Anglais',
          type: 'checkbox',
          checked: langEn ? true : false,
          click () { window.webContents.send('setLocale', 'en-US') }
        },
        { label: langEn ? 'French': 'Francais',
          type: 'checkbox',
          checked: langEn ? false: true,
          click () { window.webContents.send('setLocale', 'fr-FR') }
        }
      ]
    },
    // { role: 'downloadMenu' }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ,
    {
      label: langEn ? 'Download': 'Télécharger',
      id: 'download',
      submenu: [
        { label: 'IN WebEntities as CSV',
          enabled: false,
          click () { window.webContents.send('exportFile', 'IN', 'csv') }
        },
        { label: 'IN WebEntities as JSON',
          enabled: false,
          click () { window.webContents.send('exportFile', 'IN', 'json') }
        },
        // { label: 'IN WebEntities as Sitography',
        //   enabled: false,
        //   click () { window.webContents.send('exportFile', 'IN', 'sito') }
        // },
        { label: 'IN + UNDECIDED WebEntities as CSV',
          enabled: false,
          click () { window.webContents.send('exportFile', 'IN_UNDECIDED', 'csv') }
        },
        { label: 'IN + UNDECIDED WebEntities as JSON',
          enabled: false,
          click () { window.webContents.send('exportFile', 'IN_UNDECIDED', 'json') }
        },
        // { label: 'IN + UNDECIDED WebEntities as Sitography',
        //   enabled: false,
        //   click () { window.webContents.send('exportFile', 'IN_UNDECIDED', 'sito') }
        // },
        { type: 'separator' },
        { label: 'Tags as CSV',
          enabled: false,
          click () { window.webContents.send('exportFile', 'tags', 'csv') }
        },
        { label: 'Tags as JSON',
          enabled: false,
          click () { window.webContents.send('exportFile', 'tags', 'json') }
        },
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  ipc.on('corpusReady', () => {
    const downloadMenu = menu.getMenuItemById('download')
    downloadMenu.submenu.items.forEach((item) => {
      item.enabled = true
    })
  })

  ipc.on('corpusClosed', () => {
    const downloadMenu = menu.getMenuItemById('download')
    downloadMenu.submenu.items.forEach((item) => {
      item.enabled = false
    })
  })

  return menu
}
