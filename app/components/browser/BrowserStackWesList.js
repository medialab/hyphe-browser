// infinite webentities list
import '../../css/browser/browser-stack-wes-list'

import 'react-select/dist/react-select.css'
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'

import React, { PropTypes } from 'react'
import Select from 'react-virtualized-select'
import { intlShape } from 'react-intl'

class BrowserStackWesList extends React.Component {

  renderWebListItem (w) {
    return (
      <div className={ cx('browser-stack-wes-list-item', { selected: this.props.selectedWebentityId === w.id }) }
        onClick={ () => this.props.selectWebentity(w) }>
        { w.viewed && <span className="we-viewed ti-check"></span> }
        <span className="we-name">{ w.name }</span>
        <span className="we-indegree">{ w.indegree }</span>
      </div>
    )
  }

  render () {
    const { formatMessage } = this.context.intl
    const { webentities, selectWebentity } = this.props
    const options = webentities.map(w => ({ label: w.name, value: w.id }))

    return (
        <Select className="browser-state-wes-list"
          clearable={ false }
          disabled={ !options.length }
          onChange={ ({ value }) => selectWebentity(webentities.find(w => w.id === value)) }
          options={ options }
          placeholder={ formatMessage({id : 'select-stack' }) }
          searchable={ false }
          value={ this.props.selectedWebentityId }
          />
    )
  }
}

BrowserStackWesList.contextTypes = {
  intl: intlShape
}

BrowserStackWesList.propTypes = {
  selectedStack: PropTypes.any,
  selectedWebentityId: PropTypes.any,
  webentities: PropTypes.array,

  selectWebentity: PropTypes.func
}

export default BrowserStackWesList
