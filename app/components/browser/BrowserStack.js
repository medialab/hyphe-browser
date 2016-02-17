import '../../css/browser/stack'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

class BrowserStack extends React.Component {
  renderFiller () {
    if (!this.props.selectedStack) {
      return (
        <div className="browser-stack-filler toolbar-actions">
          <div className="browser-stack-selector">
            <label>Choose a stack:</label>
            <select className="form-control">
              { this.props.stacks.map(s => (
                <option value={ s.name }>{ s.description }</option>
              ))}
            </select>
            <button className="btn btn-default">
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
  selectedStack: PropTypes.any,
  stacks: PropTypes.array.isRequired
}

const mapStateToProps = ({ stacks }) => ({
  selectedStack: stacks.selected,
  stacks: stacks.list
})

export default connect(mapStateToProps)(BrowserStack)
