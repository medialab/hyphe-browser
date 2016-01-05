import React from "react"

import TabLink from "./TabLink"

export default ({ tabs, actions }) => {
	console.log("TabLink", tabs)
	return (
		<ul>
			{ tabs.map((tab) => <TabLink tab={tab} />) }
		</ul>
	)
}
