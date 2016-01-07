var ipc = require('electron').ipcRenderer;

window.foo = function foo(n) {
  ipc.sendToHost('foo', n);
};

ipc.on('request-contextmenu-info', function onRequestContextMenuInfo(e, pos) {
  var info = {
    x: pos.x,
    y: pos.y,
    hasSelection: window.getSelection().type === 'Range',
    href: null,
    img: null,
    video: null
  };

  var el = document.elementFromPoint(pos.x, pos.y);
  while (el && el.tagName) {
    if (!info.img && el.tagName === 'IMG') {
      info.img = el.src;
    }
    if (!info.href && el.href) {
      info.href = el.href;
    }
    el = el.parentNode;
  }

  ipc.sendToHost('show-contextmenu', info);
});
