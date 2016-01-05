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

function broadcastTabs () {
	// all tabs if query params are empty
	chrome.tabs.query({}, (tabs) => {
		broadcastToDevtools({
			type: "tabs",
			payload: tabs
		})
	})
}

// append tabId if still unknown
function getPortFullName (port) {
	var fullName = port.name
	if (fullName === "content") {
		fullName += "-" + port.sender.tab.id
	}
	return fullName
}

// triggered by port
function onMessage (msg, port) {
	console.log("onMessage", msg, port)
	if (port.name.includes("devtools-")) {
		devtoolsToContent(msg, port)
	} else {
		contentToDevtools(msg, port)
	}
}

function devtoolsToContent (msg, port) {
	var tabId = Number(port.name.split("-")[1])
	// white list
	switch (msg.type) {
	case "createTab":
		chrome.tabs.create({ url: msg.payload.url.url })
	break
	case "updateTab":
		chrome.tabs.update(tabId, { url: msg.payload.url.url })
	break
	}
}

function contentToDevtools (msg, port) {

}

// populate ports Map
chrome.runtime.onConnect.addListener((port) => {
	var fullName = getPortFullName(port)
	console.log("connect", fullName, port)
	ports.set(fullName, port)
	broadcastTabs()

	port.onMessage.addListener(onMessage)

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
		broadcastTabs()
	})
})

chrome.tabs.onRemoved.addListener(broadcastTabs)
