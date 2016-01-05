import React from "react"

import UrlLink from "./UrlLink"

export default ({ actions, urls }) => {
	return (
		<ul>
			{ urls.map((url) => <UrlLink url={url} actions={actions} />) }
		</ul>
	)
}
