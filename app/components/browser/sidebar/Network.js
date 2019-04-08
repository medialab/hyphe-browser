import React, { PropTypes } from 'react'
import uniq from 'lodash.uniq'

import {Sigma, RandomizeNodePositions, RelativeSize} from 'react-sigma';


const Network = ({ data }) => {
  let nodes = uniq(data.reduce((init, link) => init.concat(link.source).concat(link.target), []))
  nodes = nodes.map((node) => {
    return {
      ...node,
      label: node.homepage
    }
  })
  const networkData = {
    nodes,
    edges: data.map((link, id) => ({id, source: link.source.id, target: link.target.id, weight: link.weight}))
  }

  return (
    networkData ? 
      <div className="network-container">
        <Sigma graph={ networkData } settings={ {drawEdges: true, clone: false} }>
          <RelativeSize initialSize={ 15 }/>
          <RandomizeNodePositions/>
        </Sigma>
      </div> : null
  )
}

Network.propTypes = {
  data: PropTypes.array
}

export default Network
