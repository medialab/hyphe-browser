import React from "react"

export default ({ actions, url }) => {
	return (
		<li key={url.url}>
			<span>{url.name}</span>
			<button onClick={() => actions.newTab(url)}>New tab</button>
			<button onClick={() => actions.replaceTab(url)}>Replace tab</button>
		</li>
	)
}

