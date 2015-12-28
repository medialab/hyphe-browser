// to debug the following lines, use inspect views on chrome://extensions/ page

console.log("hello from background")

// setup communication between parts of the extension
// background.js acts as a central relay hub for ports messages

var ports = new Map()

function broadcast (msg) {
	ports.forEach(p => p.postMessage(msg))
}

function getPortFullName (port) {
	var fullName = port.name
	if (fullName === "content") {
		fullName += port.sender.tab.id
	} else {
		// TODO improve differenciation various devtools windows
		fullName += port.sender.tab.title
	}
	return fullName
}

// populate / clean ports Map
chrome.runtime.onConnect.addListener((port) => {
	var fullName = getPortFullName(port)
	ports.set(fullName, port)

	port.onDisconnect.addListener(() => ports.delete(fullName))
})

// onBeforeNavigate -> onCommitted -> onDOMContentLoaded -> onCompleted
chrome.webNavigation.onCommitted.addListener((evt) => {
	broadcast({
		type: "webNavigation.onCommitted",
		payload: evt
	})
})
