// black stripe at the top of the app
import './../css/hyphe-header'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

class HypheHeader extends React.Component {
  render () {
    let title = 'Hyphe Browser'
    if (this.props.corpus) {
      title += ' – ' + this.props.corpus.name
    }

    return (
      <header className="hyphe-header">
        { title }
      </header>
    )
  }
}

HypheHeader.propTypes = {
  corpus: PropTypes.object.isRequired,
}

const mapStateToProps = ({ corpora }) => ({
  corpus: corpora.selected
})

export default connect(mapStateToProps)(HypheHeader)

