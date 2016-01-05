import React from "react"

export default ({ tab }) => {
	return (
		<li key={tab.id}>
			<span>{tab.id}</span>
			<img alt="favicon" src={tab.favIconUrl} style={{width: "1em"}} />
			<a>{tab.title}</a>
		</li>
	)
}

