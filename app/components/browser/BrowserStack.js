import '../../css/browser/stack'

import React from 'react'

class BrowserStack extends React.Component {
  render () {
    return (
      <div className="browser-stack toolbar">
        <div className="browser-stack-filler toolbar-actions">
          <div className="browser-stack-name">
            Stack description / name
          </div>
          <div className="browser-statck-age">
            42min old
            <button className="btn btn-default">
              Refresh
              <span className="icon icon-arrows-ccw"></span>
            </button>
          </div>
          <div className="browser-stack-selector">
            <button className="btn btn-default">Fill</button>
          </div>
        </div>
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
      </div>
    )
  }
}

export default BrowserStack
