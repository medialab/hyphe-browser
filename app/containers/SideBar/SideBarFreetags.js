import './side-bar-tags'

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { intlShape } from 'react-intl'
import { Creatable } from 'react-select'
import difference from 'lodash.difference'
import cx from 'classnames'

import { TAGS_NS } from '../../constants'


import { addTag, removeTag } from '../../actions/tags'
import { toggleFreetags } from '../../actions/browser'

class SideBarFreetags extends React.Component {

  constructor (props) {
    super(props)
    this.state = {} 
    // prepopulate inputs
    const userTags = props.webentity.tags[TAGS_NS]
    if (userTags && userTags['FREETAGS']) {
      this.state['values/FREETAGS'] = userTags['FREETAGS'].map(toOption)
    }
  }

  componentWillReceiveProps ({ webentity }) {
    if (webentity && this.props.webentity && webentity.id !== this.props.webentity.id) {
      this.repopulate(webentity)
    }
  }

  repopulate (webentity) {
    const userTags = webentity.tags[TAGS_NS]
    if (userTags && userTags['FREETAGS']) {
      this.setState({ ['values/FREETAGS']: userTags['FREETAGS'].map(toOption) })
    }
  }

  handleKeyUp = (e) => {
    if (e.keyCode === 27) { // ESCAPE
      e.target.blur()
    }
  }

  onChangeCreatable = (options, category) => {
    const { serverUrl, corpusId, webentity, addTag, removeTag } = this.props
    const key = `values/${category}`

    const previousTags = (this.state[key] || []).map(o => o.value)
    const nextTags = options.filter(o => o).map(o => o.value)
    const addedTags = difference(nextTags, previousTags)
    const removedTags = difference(previousTags, nextTags)

    addedTags.map(tag => addTag(serverUrl, corpusId, category, webentity.id, tag, tag))
    removedTags.map(tag => removeTag(serverUrl, corpusId, category, webentity.id, tag))

    this.setState({ [key]: options })
  }

  render () {
    const { formatMessage } = this.context.intl
    const { webentity, showFreetags, toggleFreetags } = this.props
    const values = this.state['values/FREETAGS'] || []
    const disabled = webentity.status === 'DISCOVERED'

    const handleChangeCreatable = (options) => this.onChangeCreatable(options, 'FREETAGS')
    const handleToOption = ({ label }) => toOption(label)
    const handlePromptText = (tag) => `${formatMessage({ id: 'sidebar.create-tag' })}"${tag}"`

    return (
      <div className="browser-side-bar-tags">
        <div className="browser-side-bar-tags-free-tags" key={ 'FREETAGS' } onKeyUp={ this.handleKeyUp } >
          <h3 onClick={ toggleFreetags }>
            <span>{ formatMessage({ id: 'sidebar.freetags' }) }</span>
            <span className={ cx({
              'ti-angle-up': showFreetags,
              'ti-angle-down': !showFreetags
            }) }
            />
          </h3>
          
          { showFreetags && <Creatable
            autoBlur ignoreCase multi
            clearable={ false }
            disabled={ disabled }
            newOptionCreator={ handleToOption  }
            noResultsText=''
            onChange={ handleChangeCreatable }
            placeholder={ formatMessage({ id: 'sidebar.select-tags' }) }
            promptTextCreator={ handlePromptText }
            value={ values }
                            /> }
        </div>
      </div>
    )
  }
}

function toOption (tag) {
  return tag
    ? { label: tag, value: tag }
    : { label: '', value: '' }
}

SideBarFreetags.contextTypes = {
  intl: intlShape
}

SideBarFreetags.propTypes = {
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object.isRequired,

  locale: PropTypes.string.isRequired,
  showFreetags: PropTypes.bool.isRequired,

  // actions
  addTag: PropTypes.func.isRequired,
  removeTag: PropTypes.func.isRequired,
  toggleFreetags: PropTypes.func.isRequired
}

const mapStateToProps = ({ corpora, intl: { locale }, ui }, props) => ({
  ...props,
  locale,
  showFreetags: ui.showFreetags
})

export default connect(mapStateToProps, {
  addTag,
  removeTag,
  toggleFreetags
})(SideBarFreetags)
