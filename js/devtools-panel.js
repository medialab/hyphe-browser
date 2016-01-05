console.log("hello from devtools panel")

var React = require("react")
var ReactDOM = require("react-dom")

var TabLinkList = require("./components/TabLinkList")

// setup communication between parts of the extension

var associatedTabId = chrome.devtools.inspectedWindow.tabId
chrome.runtime.connect({ name: `devtools-${associatedTabId}` })
.onMessage.addListener((msg) => {
	console.log(`message received by devtools-${associatedTabId}`, msg)
})

// rendering

var tabs = [
	{name: "Foo", url: "http://foo.bar"}
]

ReactDOM.render(
	TabLinkList({ tabs }),
	document.getElementById("tab-link-list")
)
