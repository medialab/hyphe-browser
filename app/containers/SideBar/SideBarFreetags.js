import './side-bar-tags'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { intlShape } from 'react-intl'
import { Creatable } from 'react-select'
import difference from 'lodash.difference'

import { TAGS_NS } from '../../constants'

import { addTag, removeTag } from '../../actions/tags'

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

  repopulate (webentity) {
    const userTags = webentity.tags[TAGS_NS]
    if (userTags && userTags['FREETAGS']) {
      this.state['values/FREETAGS'] = userTags['FREETAGS'].map(toOption)
    }
  }

  handleKeyUp = (e) => {
    if (e.keyCode === 27) { // ESCAPE
      e.target.blur()
    }
  }

  componentWillReceiveProps ({ webentity }) {
    if (webentity && this.props.webentity && webentity.id !== this.props.webentity.id) {
      this.repopulate(webentity)
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
    const { tagsSuggestions } = this.props
    const suggestions = (tagsSuggestions['FREETAGS'] && Object.keys(tagsSuggestions['FREETAGS'])) || []
    const values = this.state['values/FREETAGS'] || []

    const handleChangeCreatable = (options) => this.onChangeCreatable(options, 'FREETAGS')
    const handleToOption = ({ label }) => toOption(label)
    const handlePromptText = (tag) => `${formatMessage({ id: 'sidebar.create-tag' })}"${tag}"`

    return (
      <div className="browser-side-bar-tags">
        <div className="browser-side-bar-tags-free-tags" key={ 'FREETAGS' } onKeyUp={ this.handleKeyUp } >
          <h3><span>{ formatMessage({ id: 'sidebar.freetags' }) }</span></h3>
          <Creatable
            autoBlur ignoreCase multi
            clearable={ false }
            newOptionCreator={ handleToOption  }
            noResultsText=''
            options={ suggestions.map(toOption) }
            onChange={ handleChangeCreatable }
            placeholder={ formatMessage({ id: 'sidebar.select-tags' }) }
            promptTextCreator={ handlePromptText }
            value={ values } />
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

  tagsSuggestions: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,

  // actions
  addTag: PropTypes.func.isRequired,
  removeTag: PropTypes.func.isRequired,
}

const mapStateToProps = ({ corpora, intl: { locale } }, props) => ({
  ...props,
  tagsSuggestions: corpora.tagsSuggestions[props.corpusId] || {},
  locale
})

export default connect(mapStateToProps, {
  addTag,
  removeTag,
})(SideBarFreetags)
