// to debug the following lines, use inspect views on chrome://extensions/ page

console.log("hello from background")

// setup communication between parts of the extension
// background.js acts as a central relay hub for ports messages

var ports = new Map()

// helpers to get subsets of ports

function getSpecificPorts (type) {
	var specificPorts = new Map()
	// poor filter :(
	ports.forEach((v, k) => {
		if (k.includes(type))
			specificPorts.set(k, v)
	})
	return specificPorts
}

var getContentPorts = () => getSpecificPorts("content")
var getDevtoolsPorts = () => getSpecificPorts("devtools")

function broadcast (msg) {
	console.log("broadcast", ports.size, [...ports.keys()], msg)
	ports.forEach(p => p.postMessage(msg))
}

function broadcastToDevtools (msg) {
	var devtoolsPorts = getDevtoolsPorts()
	console.log("broadcast to devtools", devtoolsPorts.size, [...devtoolsPorts.keys()], msg)
	devtoolsPorts.forEach(p => p.postMessage(msg))
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

// https://developer.chrome.com/extensions/webNavigation
// onBeforeNavigate -> onCommitted -> onDOMContentLoaded -> onCompleted
// beware of ads iframes!
var webNavigationEvents = [
	"onBeforeNavigate",
	"onCommitted",
	"onDOMContentLoaded",
	"onCompleted"
]

webNavigationEvents.forEach((name) => {
	chrome.webNavigation[name].addListener((evt) => {
		broadcastToDevtools({
			type: `webNavigation.${name}`,
			payload: evt
		})
	})
})
