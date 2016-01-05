// to debug the following lines, use inspect views on chrome://extensions/ page

console.log("hello from background")

// setup communication between parts of the extension
// background.js acts as a central relay hub for ports messages

var ports = new Map()

function broadcast (msg) {
	console.log("broadcast", ports.size, [...ports.keys()], msg)
	ports.forEach(p => p.postMessage(msg))
}

// append tabId if still unknown
function getPortFullName (port) {
	var fullName = port.name
	if (fullName === "content") {
		fullName += "-" + port.sender.tab.id
	}
	return fullName
}

// populate ports Map
chrome.runtime.onConnect.addListener((port) => {
	var fullName = getPortFullName(port)
	console.log("connect", fullName, port)
	ports.set(fullName, port)

	// clean ports Map
	port.onDisconnect.addListener(() => ports.delete(fullName))
})

// onBeforeNavigate -> onCommitted -> onDOMContentLoaded -> onCompleted
// beware of ads iframes!
chrome.webNavigation.onCommitted.addListener((evt) => {
	broadcast({
		type: "webNavigation.onCommitted",
		payload: evt
	})
})
