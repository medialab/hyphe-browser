/* eslint no-path-concat: 0, func-names:0 */

var app = require('app')
var BrowserWindow = require('browser-window')
var Menu = require('menu')
var isPackaged = !process.argv[0].match(/(?:node|io)(?:\.exe)?/i)

// Force production environment in final binary
if (isPackaged) {
  process.env.NODE_ENV = 'production'
}

require('electron-debug')()
require('crash-reporter').start()

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  var window = new BrowserWindow({ center: true, width: 1024, height: 728, resizable: true })

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
          label: 'Reset',
          accelerator: 'Ctrl+R',
          click: () => {
            window.reload()
          }
        },
        {
          label: '&Quit',
          accelerator: 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    }
  ]

  if (process.env.NODE_ENV === 'development') {
    window.openDevTools()
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
})
