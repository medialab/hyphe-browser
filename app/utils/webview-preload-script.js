// Utilities to be injected into EVERY guest page
// Beware: no Babel here, this code is executed in the webview's guest context
// Note: this is a module and local variables defined here won't pollute guest's global environment
'use strict'

// Host ←→ Guest communication
// ipc.sendToHost('channel', data…)
// ipc.on('eventName', handler(e, data…))
var ipc = require('electron').ipcRenderer


/**
 * Handle right-click context menu
 */

// Right-click was intercepted by host, which has no more information than click's position
// Host needs some DOM information to generate a correct context menu
ipc.on('request-contextmenu-info', function onRequestContextMenuInfo (e, pos) {
  var info = {
    x: pos.x,
    y: pos.y,
    hasSelection: window.getSelection().type === 'Range',
    href: null, // string: href
    img: null // string: href
  }

  if (info.hasSelection) {
    info.selectionText = window.getSelection().toString()
  }

  var el = document.elementFromPoint(pos.x, pos.y)

  while (el && el.tagName) {
    // Image
    if (!info.img && el.tagName === 'IMG') {
      info.img = el.src
    }

    // TODO right-click on video to download file
    // can be <video src="url" />
    // or with sub-tags <video><source src="url" type="type"> …</video>
    // can even have subtitles with sub-tag <track>, not sure we should use that anyday anyway
    if (!info.img && el.tagName === 'VIDEO') {
      // Not implemented yet
    }

    // Link
    if (!info.href && el.href) {
      info.href = el.href
    }

    // Go up in the DOM tree
    // Note we should check if parent node is actually under the cursor, but this
    // is not critical so let's consider it's a safe edge case
    el = el.parentNode
  }

  ipc.sendToHost('show-contextmenu', info)
})

window.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style')
  style.appendChild(document.createTextNode(''))
  document.head.appendChild(style)
  style.sheet.insertRule(`
    a::before {
      display: block;
      opacity: 0;
    }
  `)
  style.sheet.insertRule(`
    a:hover::before {
      background: #eee;
      border-left: 1px solid #ddd;
      border-top-left-radius: 5px;
      border-top: 1px solid #ddd;
      bottom: 0;
      color: #333;
      content: attr(href);
      font-family: sans-serif;
      font-size: 12px;
      font-style: normal;
      font-weight: normal;
      line-height: 1;
      margin: 0;
      opacity: 1;
      padding: 5px;
      position: fixed;
      right: 0;
      text-shadow: none;
      text-transform: lowercase;
      z-index: 100000;
    }
  `)
})
