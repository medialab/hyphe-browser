import React from "react"

export default ({ actions, url }) => {
	return (
		<li key={url.url}>
			<span>{url.name}</span>
			<button onClick={() => actions.createTab(url)}>New tab</button>
			<button onClick={() => actions.updateTab(url)}>Replace tab</button>
		</li>
	)
}

