console.log("hello from hyphe")

// setup communication between parts of the extension

chrome.runtime.connect({ name: "content" })
.onMessage.addListener((msg) => {
	console.log(msg)
})

