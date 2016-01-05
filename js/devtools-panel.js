console.log("hello from devtools panel")

// setup communication between parts of the extension

var associatedTabId = chrome.devtools.inspectedWindow.tabId
chrome.runtime.connect({ name: `devtools-${associatedTabId}` })
.onMessage.addListener((msg) => {
	console.log(`message received by devtools-${associatedTabId}`, msg)
})
