import React, { PropTypes } from 'react'

class BrowserTab extends React.Component {
  render () {
    const { active, id, title, icon, loading, selectTab, closeTab } = this.props

    return (
      <div key={ id } className={ 'browser-tab tab-item ' + (active ? ' active' : '') } onClick={ () => selectTab(id) }>
        <span className="icon icon-cancel-circled icon-close-tab" onClick={ (e) => { e.stopPropagation(); closeTab(id) } }></span>
        { loading
          ? <span className="icon icon-dot-3" /> // TODO loading icon in tab
          : (icon ? <img src={ icon } width="16" height="16" className="tab-favicon" /> : null)
        }
        { ' ' + title }
      </div>
    )
  }
}

BrowserTab.propTypes = {
  id: PropTypes.string.isRequired,
  active: PropTypes.bool,
  title: PropTypes.string,
  icon: PropTypes.string,
  loading: PropTypes.bool,
  selectTab: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired
}

export default BrowserTab
