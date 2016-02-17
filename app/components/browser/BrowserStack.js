import '../../css/browser/stack'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import { fetchStack } from '../../actions/stacks'

class BrowserStack extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedStackName: this.props.selectedStack && this.props.selectedStack.name
    }
  }

  fill () {
    const stack = this.props.stacks.find(s => s.name === this.state.selectedStackName)
    this.props.fetchStack(this.props.server.url, this.props.corpus, stack)
  }

  renderFiller () {
    if (!this.props.selectedStack) {
      return (
        <div className="browser-stack-filler toolbar-actions">
          <div className="browser-stack-selector">
            <select className="form-control"
              defaultValue={ this.state.selectedStackName }
              onChange={ (evt) => { if (evt.target.value) this.setState({ selectedStackName: evt.target.value }) } }>
              <option value="">Select a stack</option>
              { this.props.stacks.map(s => (
                <option key={ s.name } value={ s.name }>{ s.description }</option>
              )) }
            </select>
            <button className="btn btn-default"
              onClick={ () => this.fill() }>
              <span className="icon icon-download"></span>
              Fill
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="browser-stack-filler toolbar-actions">
        <div className="browser-stack-name">
          Stack description / name
        </div>
        <div className="browser-statck-age">
          42min old
          <button className="btn btn-default">
            <span className="icon icon-arrows-ccw"></span>
            Refresh
          </button>
        </div>
        <div>
          <button className="btn btn-default">
            <span className="icon icon-trash"></span>
            Empty
          </button>
        </div>
      </div>
    )
  }

  renderWesSelector () {
    return (
      <div className="browser-stack-wes toolbar-actions">
        <div>
          <button className="btn btn-default browser-stack-wes-prev">
            <span className="icon icon-left"></span>
            Previous
          </button>
        </div>
        <div className="browser-stack-wes-selector">
          <span className="browser-stack-wes-counter">11 in stack</span>
          <select><option>we -----------------------------</option></select>
        </div>
        <div>
          <button className="btn btn-default browser-stack-wes-next">
            Next
            <span className="icon icon-right"></span>
          </button>
        </div>
      </div>
    )
  }

  render () {
    return (
      <div className="browser-stack toolbar">
        { this.renderFiller() }
        { this.props.selectedStack ? this.renderWesSelector() : null }
      </div>
    )
  }
}

BrowserStack.propTypes = {
  corpus: PropTypes.object.isRequired,
  server: PropTypes.object.isRequired,
  selectedStack: PropTypes.any,
  stacks: PropTypes.array.isRequired,

  fetchStack: PropTypes.func.isRequired
}

const mapStateToProps = ({ corpora, servers, stacks }) => ({
  corpus: corpora.selected,
  server: servers.selected,
  selectedStack: stacks.selected,
  stacks: stacks.list
})

const mapDispatchToProps = {
  fetchStack
}

export default connect(mapStateToProps, mapDispatchToProps)(BrowserStack)
