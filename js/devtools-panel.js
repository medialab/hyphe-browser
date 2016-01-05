console.log("hello from devtools panel")

import React from "react"
import ReactDOM from "react-dom"
import { bindActionCreators, createStore, applyMiddleware } from "redux"
import { Provider, connect } from "react-redux"

import App from "./components/App"

// redux: reducer, store, middleware, actions and connect

const initialState = {
	tabs: [],
	urls: [
		{ name: "Twitter", url: "https://twitter.com/medialab_ScPo/status/591539149779431424" },
		{ name: 'Youtube', url: "https://www.youtube.com/watch?v=rp838o6vnYE" },
		{ name: "Facebook", url: "https://www.facebook.com/sciencespo/" },
		{ name: "Linked", url: "https://www.linkedin.com/in/paul-girard-57822118" },
		{ name: "Lepoint", url :"http://www.lepoint.fr/" },
	]
}

var reducer = (state = initialState, action) => {
	switch (action.type) {
	case "refreshTabs":
		return { tabs: action.payload.tabs, urls: state.urls }
	default:
		return state
	}
}

// middleware that intercept certain action to trigger call to background.js via port
var toBackgroundMiddleware = () => (next) => (action) => {
	if (action.payload.toBg) emit(action)
	next(action)
}

const store = applyMiddleware(toBackgroundMiddleware)(createStore)(reducer)

const actions = {
	refreshTabs: (tabs) => ({type: "refreshTabs", payload: { tabs }}),
	createTab: (url) => ({ type: "createTab", payload: { url, toBg: true }}),
	updateTab: (url) => ({ type: "updateTab", payload: { url, toBg: true }}),
	mirror: (tabId) => ({ type: "mirror", payload: { tabId, toBg: true }})
}

const mapStateToProps = (state) => ({ tabs: state.tabs, urls: state.urls })
const mapDispatchToProps = (dispatch) => ({ actions: bindActionCreators(actions, dispatch) })

const ConnectedApp = connect(mapStateToProps, mapDispatchToProps)(App)

// rendering

ReactDOM.render(
	<Provider store={store}>
		<ConnectedApp />
	</Provider>,
	document.getElementById("root")
)

// refresh
const refresh = (tabs) => {
	store.dispatch(actions.refreshTabs(tabs))
}

// setup communication between parts of the extension

var associatedTabId = chrome.devtools.inspectedWindow.tabId
var port = chrome.runtime.connect({ name: `devtools-${associatedTabId}` })
port.onMessage.addListener((msg) => {
	console.log(`message received by devtools-${associatedTabId}`, msg)
	if (msg.type === "tabs") refresh(msg.payload)
})

function emit (action) {
	port.postMessage(action)
}
