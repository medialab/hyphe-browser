import React from "react"

import TabLink from "./TabLink"

export default ({ tabs }) => {
	return (
		<ul>
			{ tabs.map((tab) => <TabLink tab={tab} />) }
		</ul>
	)
}
