import React from "react"

import TabLinkList from "./TabLinkList"
import UrlLinkList from "./UrlLinkList"

export default ({ actions, tabs, urls }) => {
	return (
		<div>
			<h2>Current tabs</h2>
			<TabLinkList tabs={tabs} actions={actions} />
			<h2>Crash test</h2>
			<UrlLinkList urls={urls} actions={actions} />
		</div>
	)
}

