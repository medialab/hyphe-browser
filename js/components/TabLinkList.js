import React from "react"

import TabLink from "./TabLink"

export default ({ actions, tabs }) => {
	return (
		<ul>
			{ tabs.map((tab) => <TabLink tab={tab} actions={actions} />) }
		</ul>
	)
}
