// to debug the following lines, use devtools inception :
// 1 - open the first devtools window undocked
// 2 - press Ctrl+Shift+i to open a second devtools window

console.log("hello from devtools")

// setup communication between parts of the extension

var associatedTabId = chrome.devtools.inspectedWindow.tabId
chrome.runtime.connect({ name: `devtools-${associatedTabId}` })
.onMessage.addListener((msg) => {
	console.log(msg)
})

function onPanelCreated (panel) {}

chrome.devtools.panels.create(
	"Hyphe",
	"images/icons/icon-128.png",
	"html/devtools-panel.html",
	onPanelCreated
)