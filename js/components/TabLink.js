var React = require("react")
var $ = React.DOM

TabLink = (props) => {
	return (
		$.li({},
			$.a({ href: props.url }, props.name))
	)
}

module.exports = TabLink
