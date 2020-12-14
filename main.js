'use strict'

/* eslint no-path-concat: 0, func-names:0 */

const { app, BrowserWindow, ipcMain: ipc, Menu, MenuItem, globalShortcut } = require('electron')
const isPackaged = !process.argv[0].match(/(?:node|io)(?:\.exe)?/i)
const open = require('open')
const { shortcuts } = require('./app/shortcuts')

const {
  SHORTCUT_OPEN_TAB, SHORTCUT_CLOSE_TAB,
  SHORTCUT_NEXT_TAB, SHORTCUT_PREV_TAB,
  SHORTCUT_RELOAD_TAB, SHORTCUT_FULL_RELOAD_TAB,
  SHORTCUT_FIND_IN_PAGE, SHORTCUT_RELOAD_WINDOW, SHORTCUT_TOGGLE_DEVTOOLS
} = shortcuts

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
let corpusReady = false

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

  // // Force reload
  // shortcuts.register('Shift+Ctrl+R', () => window.reload())

  // allows more listeners for "browser-window-focus" and "browswer-window-blur" events
  // which are used by electron-shortcut
  app.setMaxListeners(25)

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

app.on('browser-window-focus', function () {
  // disable default reload window
  globalShortcut.register('CmdOrCtrl+R', () => {
    window.webContents.send(SHORTCUT_RELOAD_TAB)
  })
  globalShortcut.register('F5', () => {
    window.webContents.send(SHORTCUT_RELOAD_TAB)
  })
  globalShortcut.register('CmdOrCtrl+SHIFT+R', () => {
    window.webContents.send(SHORTCUT_FULL_RELOAD_TAB)
  })
  globalShortcut.register('Shift+F5', () => {
    window.webContents.send(SHORTCUT_FULL_RELOAD_TAB)
  })
  globalShortcut.register('CmdOrCtrl+F5', () => {
    window.webContents.send(SHORTCUT_FULL_RELOAD_TAB)
  })
})

app.on('browser-window-blur', function () {
  globalShortcut.unregister('CmdOrCtrl+R')
  globalShortcut.unregister('F5')
  globalShortcut.unregister('CmdOrCtrl+Shift+R')
  globalShortcut.unregister('Shift+F5')
  globalShortcut.unregister('CmdOrCtrl+F5')
})

const shortcutEvents = [
  {
    key: 'CmdOrCtrl+C',
    event: SHORTCUT_TOGGLE_DEVTOOLS
  },
  {
    key: 'F12',
    event: SHORTCUT_TOGGLE_DEVTOOLS
  },
  {
    key: 'CmdOrCtrl+Shift+L',
    event: SHORTCUT_RELOAD_WINDOW
  },
  {
    key: 'CmdOrCtrl+N',
    event: SHORTCUT_OPEN_TAB
  },
  {
    key: 'CmdOrCtrl+T',
    event: SHORTCUT_OPEN_TAB
  },
  {
    key: 'CmdOrCtrl+W',
    event: SHORTCUT_CLOSE_TAB
  },
  {
    key: 'Ctrl+Tab',
    event: SHORTCUT_NEXT_TAB
  },
  {
    key: 'CmdOrCtrl+PageDown',
    event: SHORTCUT_NEXT_TAB
  },
  {
    key: 'Ctrl+Shift+Tab',
    event: SHORTCUT_PREV_TAB
  },
  {
    key: 'CmdOrCtrl+PageUp',
    event: SHORTCUT_PREV_TAB
  },
  {
    key: 'CmdOrCtrl+R',
    event: SHORTCUT_RELOAD_TAB
  },
  {
    key: 'F5',
    event: SHORTCUT_RELOAD_TAB
  },
  {
    key: 'CmdOrCtrl + F5',
    event: SHORTCUT_FULL_RELOAD_TAB
  },
  {
    key: 'Shift + F5',
    event: SHORTCUT_FULL_RELOAD_TAB
  },
  {
    key: 'CmdOrCtrl+Shift+R',
    event: SHORTCUT_FULL_RELOAD_TAB
  },
  {
    key: 'CmdOrCtrl+F',
    event: SHORTCUT_FIND_IN_PAGE
  }
]

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
      label: langEn ? '&Edit' : '&Edition',
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
      label:  langEn ? '&Language': '&Langue',
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
    // { role: 'downloadMenu' },
    {
      label: langEn ? '&Download': '&Télécharger',
      id: 'download',
      submenu: [
        { label: 'IN WebEntities as CSV',
          enabled: corpusReady,
          click () { window.webContents.send('exportFile', 'IN', 'csv') }
        },
        { label: 'IN WebEntities as JSON',
          enabled: corpusReady,
          click () { window.webContents.send('exportFile', 'IN', 'json') }
        },
        // { label: 'IN WebEntities as Sitography',
        //   enabled: corpusReady,
        //   click () { window.webContents.send('exportFile', 'IN', 'sito') }
        // },
        { label: 'IN + UNDECIDED WebEntities as CSV',
          enabled: corpusReady,
          click () { window.webContents.send('exportFile', 'IN_UNDECIDED', 'csv') }
        },
        { label: 'IN + UNDECIDED WebEntities as JSON',
          enabled: corpusReady,
          click () { window.webContents.send('exportFile', 'IN_UNDECIDED', 'json') }
        },
        // { label: 'IN + UNDECIDED WebEntities as Sitography',
        //   enabled: corpusReady,
        //   click () { window.webContents.send('exportFile', 'IN_UNDECIDED', 'sito') }
        // },
        { type: 'separator' },
        { label: 'Tags as CSV',
          enabled: corpusReady,
          click () { window.webContents.send('exportFile', 'tags', 'csv') }
        },
        { label: 'Tags as JSON',
          enabled: corpusReady,
          click () { window.webContents.send('exportFile', 'tags', 'json') }
        },
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  // local shortcuts registered in invisible submenu
  shortcutEvents.forEach((shortcut) => {
    const editMenu = menu.getMenuItemById('edit')
    editMenu.submenu.append(new MenuItem({
      label: 'shortcut',
      accelerator: shortcut.key,
      visible: false,
      click () {
        if (shortcut.event === SHORTCUT_RELOAD_WINDOW) {
          window.webContents.reload()
        } else if (shortcut.event === SHORTCUT_TOGGLE_DEVTOOLS) {
          window.webContents.toggleDevTools()
        } else {
          window.webContents.send(shortcut.event)
        }
      }
    }))
  })

  ipc.on('corpusReady', () => {
    corpusReady = true
    const downloadMenu = menu.getMenuItemById('download')
    downloadMenu.submenu.items.forEach((item) => {
      item.visible = true
    })
  })

  ipc.on('corpusClosed', () => {
    corpusReady = false
    const downloadMenu = menu.getMenuItemById('download')
    downloadMenu.submenu.items.forEach((item) => {
      item.visible = false
    })
  })

  return menu
}
