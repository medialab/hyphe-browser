import React from 'react'

export default () => (
  <div className="tab-group">
    <div className="tab-item">
      <span className="icon icon-cancel icon-close-tab"></span>
      Tab
    </div>
    <div className="tab-item active">
      <span className="icon icon-cancel icon-close-tab"></span>
      Tab active
    </div>
    <div className="tab-item">
      <span className="icon icon-cancel icon-close-tab"></span>
      Tab
    </div>
    <div className="tab-item tab-item-fixed">
      <span className="icon icon-plus"></span>
    </div>
  </div>
)
