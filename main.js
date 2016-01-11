/* eslint no-path-concat: 0, func-names:0 */
var app = require('app')
var BrowserWindow = require('browser-window')
var Menu = require('menu')

require('electron-debug')()
require('crash-reporter').start()

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  const window = new BrowserWindow({ center: true, width: 1024, height: 728, resizable: true })

  if (process.env.NODE_ENV === 'development') {
    window.loadURL('file://' + __dirname + '/app/index-dev.html')
  } else {
    window.loadURL('file://' + __dirname + '/app/index.html')
  }

  window.maximize()

  window.on('closed', () => {
    window = null
  })

  if (process.env.NODE_ENV === 'development') {
    window.openDevTools()
  }

  window.setMenu(Menu.buildFromTemplate([
    {
      label: '&Hyphe',
      submenu: [
        {
          label: '&Quit',
          accelerator: 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        },
        {
          label: '&Full Screen',
          accelerator: 'F11',
          click: () => {
            window.setFullScreen(!window.isFullScreen())
          }
        },
        {
          label: 'Toggle &Developer Tools',
          accelerator: 'Alt+Shift+C',
          click: () => {
            window.toggleDevTools()
          }
        }
      ]
    }
  ]))
})
