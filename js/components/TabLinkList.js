var React = require("react")
var $ = React.DOM

var TabLink = require("./TabLink")

TabLinkList = (props) => {
	return (
		$.ul({}, props.tabs.map(TabLink))
	)
}

module.exports = TabLinkList
