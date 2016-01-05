console.log("hello from hyphe")

// setup communication between parts of the extension

var __scaleY___ = -1

chrome.runtime.connect({ name: "content" })
.onMessage.addListener((msg) => {
	console.log(msg)
	switch(msg.type) {
	case "mirror":
		__scaleY___ = __scaleY___ === -1 ? 1 : -1
		document.body.style.transitionDuration = "1s"
		document.body.style.transform = `scaleY(${__scaleY___})`
	break
	}
})

