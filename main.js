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
  const devtools = require('electron-devtools-installer')

  app.disableHardwareAcceleration()

  app.on('ready', () => {
    [ 'REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS' ].forEach(t => {
      devtools.default(devtools[t])
        .then(name => console.log(`Added Extension:  ${name}`)) // eslint-disable-line no-console
        .catch(err => console.error('An error occurred during redux devtools install: ', err)) // eslint-disable-line no-console
    })
  })
}

let window
const menuSetting = {
  enableLanguage: false,
  enableDownload: false
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  window = new BrowserWindow({ 
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
        const menu = getNewMenuBar(value.options['locale'], menuSetting)
        Menu.setApplicationMenu(menu)
      })
  })

  if (process.env.NODE_ENV === 'development') {
    require('./dev-server')
    window.loadURL('file://' + __dirname + '/app/index-dev.html')
  } else {
    window.loadURL('file://' + __dirname + '/app/index.html')
  }

  window.maximize()

  window.on('closed', () => {
    window = null
  })

  ipc.on('appMount', (e, locale) => {
    menuSetting.enableLanguage = true
    const menu = getNewMenuBar(locale, menuSetting)
    Menu.setApplicationMenu(menu)
  })

  ipc.on('appUnmount', (e, locale) => {
    menuSetting.enableLanguage = false
    const menu = getNewMenuBar(locale, menuSetting)
    Menu.setApplicationMenu(menu)
  })
  
  ipc.on('setLocaleMain', (e, locale) => {
    const menu = getNewMenuBar(locale, menuSetting)
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


function getNewMenuBar (locale, setting) {
  const isMac = process.platform === 'darwin'
  const { enableLanguage, enableDownload } = setting
  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // { role: 'languageMenu' }
    {
      label:  locale === 'en-US' ? 'Language': 'Langue',
      submenu: [
        { label: locale === 'en-US' ? 'English': 'Anglais',
          enabled: enableLanguage,
          click () { window.webContents.send('setLocale', 'en-US') }
        },
        { label: locale === 'en-US' ? 'French': 'Francais',
          enabled: enableLanguage,
          click () { window.webContents.send('setLocale', 'fr-FR') }
        }
      ]
    },
    // { role: 'downloadMenu' }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ,
    {
      label: locale === 'en-US' ? 'Download': 'Télécharger',
      submenu: [                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
        { label: 'IN WebEntities as CSV',
          enabled: enableDownload,
          click () { window.webContents.send('exportFile', 'IN', 'csv') }
        },
        { label: 'IN WebEntities as JSON',
          enabled: enableDownload,
          click () { window.webContents.send('exportFile', 'IN', 'json') }
        },
        // { label: 'IN WebEntities as Sitography',
        //   enabled: enableDownload,
        //   click () { window.webContents.send('exportFile', 'IN', 'sito') }
        // },
        { label: 'IN + UNDECIDED WebEntities as CSV',
          enabled: enableDownload,
          click () { window.webContents.send('exportFile', 'IN_UNDECIDED', 'csv') }
        },
        { label: 'IN + UNDECIDED WebEntities as JSON',
          enabled: enableDownload,
          click () { window.webContents.send('exportFile', 'IN_UNDECIDED', 'json') }
        },
        // { label: 'IN + UNDECIDED WebEntities as Sitography',
        //   enabled: enableDownload,
        //   click () { window.webContents.send('exportFile', 'IN_UNDECIDED', 'sito') } 
        // },
        { type: 'separator' },
        { label: 'Tags as CSV',
          enabled: enableDownload,
          click () { window.webContents.send('exportFile', 'tags', 'csv') }
        },
        { label: 'Tags as JSON',
          enabled: enableDownload,
          click () { window.webContents.send('exportFile', 'tags', 'json') }
        },
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  ipc.on('corpusReady', () => {
    menu.items[1].submenu.items.forEach((item) => {
      item.enabled = true
    })
  })
  
  ipc.on('corpusClosed', () => {
    menu.items[1].submenu.items.forEach((item) => {
      item.enabled = false
    })
  })
  
  return menu
}
