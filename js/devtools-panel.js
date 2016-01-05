console.log("hello from devtools panel")

import React from "react"
import ReactDOM from "react-dom"
import { bindActionCreators, createStore } from "redux"
import { Provider, connect } from "react-redux"

import TabLinkList from "./components/TabLinkList"

// redux: reducer, store, actions and connect

const initialState = { tabs: [] }

var reducer = (state = initialState, action) => {
	switch (action.type) {
	case "refreshTabs":
		return { tabs: action.payload.tabs }
	default:
		return state
	}
}

const store = createStore(reducer)

const actions = {
	refreshTabs: (tabs) => ({type: "refreshTabs", payload: { tabs }})
}

const mapStateToProps = (state) => ({ tabs: state.tabs })
const mapDispatchToProps = (dispatch) => ({ actions: bindActionCreators(actions, dispatch) })

const ConnectedTabLinkList = connect(mapStateToProps, mapDispatchToProps)(TabLinkList)

// rendering

ReactDOM.render(
	<Provider store={store}>
		<ConnectedTabLinkList />
	</Provider>,
	document.getElementById("tab-link-list")
)

// refresh
const refresh = (tabs) => {
	store.dispatch(actions.refreshTabs(tabs))
}

// setup communication between parts of the extension

var associatedTabId = chrome.devtools.inspectedWindow.tabId
chrome.runtime.connect({ name: `devtools-${associatedTabId}` })
.onMessage.addListener((msg) => {
	console.log(`message received by devtools-${associatedTabId}`, msg)
	if (msg.type === "tabs") refresh(msg.payload)
})

