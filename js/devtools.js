// to debug the following lines, use devtools inception :
// 1 - open the first devtools window undocked
// 2 - press Ctrl+Shift+i to open a second devtools window

// this file is only used to create the panel
// see devtools-panel.js for the real logic

console.log("hello from devtools")

function onPanelCreated (panel) {}

chrome.devtools.panels.create(
	"Hyphe",
	"images/icons/icon-128.png",
	"html/devtools-panel.html",
	onPanelCreated
)
