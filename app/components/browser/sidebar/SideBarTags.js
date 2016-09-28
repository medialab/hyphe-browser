import '../../../css/browser/side-bar-tags'
import '../../../css/auto-suggest'

import uniq from 'lodash.uniq'
import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { FormattedMessage as T } from 'react-intl'
import cx from 'classnames'
import Autosuggest from 'react-autosuggest'
import { intlShape } from 'react-intl'
import partition from 'lodash.partition'


import Button from '../../Button'

import { addTagsCategory, addTag, removeTag, fetchTags } from '../../../actions/tags'


class SideBarTags extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      tagValue: {}, // [category or (category + '/' + value)]: string
      // ['full-suggestions/' + category] : Array<string>
      // ['suggestions/' + category + '/' + value] : Array<string>
      newCategory: ''
      // ['edit/' + category + '/' + value] : true
    }

    // Force-bind methods used like `onEvent={ this.method }`
    this.addCategory = this.addCategory.bind(this)
    this.onChangeNewCategory = this.onChangeNewCategory.bind(this)
    this.renderTagsCategory = this.renderTagsCategory.bind(this)
  }

  componentWillMount () {
    this.updateFullSuggestions(this.props.categories)
  }

  // TODO missing will
  componentReceiveProps ({ categories }) {
    if (JSON.stringify(categories) !== JSON.stringify(this.props.categories)) {
      this.updateFullSuggestions(categories)
    }
  }

  updateFullSuggestions (categories) {
    // Updated categories, fetch suggestions
    const { serverUrl, corpusId, fetchTags } = this.props
    fetchTags(serverUrl, corpusId).then((tags) => {
      categories.forEach((category) => {
        this.setState({ ['full-suggestions/' + category]: tags[category] })
      })
    })
  }

  onChangeNewCategory (e) {
    this.setState({ newCategory: e.target.value })
  }

  addCategory (e) {
    e.preventDefault()

    const { newCategory } = this.state
    if (newCategory) {
      const { serverUrl, corpusId, webentity, addTagsCategory } = this.props
      addTagsCategory(serverUrl, corpusId, webentity.id, this.state.newCategory)
      this.setState({ newCategory: '' })
    } else {
      findDOMNode(this).querySelector('form.tags-new-category input').focus()
    }
  }

  renderTagsCategory (category) {
    const tags = (this.props.webentity.tags.USER || {})[category] || []
    const freeTagsTitle = this.context.intl.formatMessage({ id: 'sidebar.freetags' })
    const canAddTag = isFreeTags(category) || tags.length === 0

    return (
      <div className="browser-side-bar-category" key={ category }>
        <h3><span>{ isFreeTags(category) ? freeTagsTitle : category }</span></h3>
        <ul>
          { tags.map(this.renderTag(category)) }
        </ul>
        { canAddTag ? this.renderTagInput(category) : null }
      </div>
    )
  }

  addTagHandler (category, tag = null) {
    return (e) => {
      e.preventDefault()
      return this.addTag(category, tag)
    }
  }

  addTag (category, tag = null) {
    const { serverUrl, corpusId, webentity, addTag } = this.props
    const value = this.getEditedTagValue(category, tag)
    if (!value) {
      return Promise.resolve()
    }

    this.changeEditedTagValue(category, '', tag)
    return addTag(serverUrl, corpusId, category, webentity.id, value, tag).then(() => {
      // Keep suggestions up to date
      const prop = 'full-suggestions/' + category
      const tags = uniq((this.state[prop] || []).concat(value))
      this.setState({ [prop]: tags })
    })
  }

  updateTagHandler (category, tag) {
    return (e) => {
      e.preventDefault()
      this.updateTag(category, tag)
    }
  }

  updateTag (category, tag) {
    const value = this.getEditedTagValue(category, tag)
    if (value === tag || !value) {
      this.editTag(category, tag, false)
      this.changeEditedTagValue(category, '', tag)
      return Promise.resolve()
    }

    return this.addTag(category, tag).then(() => this.removeTag(category, tag))
  }

  removeTag (category, value) {
    const { serverUrl, corpusId, webentity, removeTag } = this.props
    return removeTag(serverUrl, corpusId, category, webentity.id, value)
  }

  changeEditedTagValue (category, value, tag = null) {
    const prop = getPropName(category, tag)
    this.setState({
      tagValue: {
        ...this.state.tagValue,
        [prop]: value
      }
    })
  }

  getEditedTagValue (category, tag = null) {
    const prop = getPropName(category, tag)
    return (typeof this.state.tagValue[prop] === 'string')
      ? this.state.tagValue[prop]
      : tag
  }

  setCurrentSuggestions (suggestions, category, tag = null) {
    const prop = 'suggestions/' + getPropName(category, tag)
    this.setState({ [prop]: suggestions })
  }

  getCurrentSuggestions (category, tag = null) {
    const prop = 'suggestions/' + getPropName(category, tag)
    return this.state[prop] || this.getSuggestions(category, '')
  }

  getSuggestions (category, value) {
    return getSuggestions(this.state['full-suggestions/' + category] || [], value)
  }

  renderTagInput (category, tag = null) {
    const { formatMessage } = this.context.intl
    const uniqSuffix = category + ((tag !== null) ? ('-' + tag) : '')

    return (
      <form
        key={ 'tag/edit/' + category + '/' + tag }
        className={ cx({ 'tags-new-tag': !tag, 'tags-edit-tag': !!tag }) }
        onSubmit={ tag ? this.updateTagHandler(category, tag) : this.addTagHandler(category) }
        >
        <Autosuggest
          id={ 'tags-' + uniqSuffix }
          suggestions={ this.getCurrentSuggestions(category, tag) }
          onSuggestionsFetchRequested={ ({ value }) => this.setCurrentSuggestions(this.getSuggestions(category, value), category, tag) }
          onSuggestionsClearRequested={ () => this.setCurrentSuggestions([], category, tag) }
          getSuggestionValue={ getSuggestionValue }
          renderSuggestion={ renderSuggestion }
          shouldRenderSuggestions={ () => true }
          inputProps={ {
            className: 'tag-input-' + uniqSuffix,
            placeholder: tag || 'New tag',
            value: this.getEditedTagValue(category, tag) || '',
            autoFocus: !!tag,
            onFocus: (e) => e.target.select(),
            onChange: (e, { newValue }) => this.changeEditedTagValue(category, newValue, tag)
          } }
        />
        <Button icon={ tag ? 'pencil' : 'plus' } title={ formatMessage({ id: 'sidebar.add-tag' }) } />
      </form>
    )
  }

  editTag (category, tag, edited) {
    this.setState({ ['edit/' + category + '/' + tag]: edited })
  }

  isEditedTag (category, tag) {
    return !!this.state['edit/' + category + '/' + tag]
  }

  renderTag (category) {
    return (tag) => {
      const { formatMessage } = this.context.intl
      if (this.isEditedTag(category, tag)) {
        return this.renderTagInput(category, tag)
      }

      return (
        <li key={ 'tag/view/' + category + '/' + tag }>
          <span
            className="tag-title"
            onClick={ () => this.editTag(category, tag, true) }>
            { tag }</span>
          <Button icon="eraser"
            onClick={ () => this.removeTag(category, tag) }
            title={ formatMessage({ id: 'sidebar.remove-tag' }) } />
        </li>
      )
    }
  }

  // free tags should be first, then other categories, then add category field
  render () {
    const { formatMessage } = this.context.intl
    const [freeTags, cats] = partition(this.props.categories, isFreeTags)

    return (
      <div className="browser-side-bar-tags">
        { this.renderTagsCategory(freeTags[0]) }
        <h3><T id="sidebar.categories" /></h3>
        { cats.map(this.renderTagsCategory) }
        <form className="tags-new-category" onSubmit={ this.addCategory }>
          <input className="form-control" value={ this.state.newCategory } onInput={ this.onChangeNewCategory } />
          <Button icon="plus" title={ formatMessage({ id: 'sidebar.add-tags-category' }) } />
        </form>
      </div>
    )
  }
}


function getPropName (category, tag = null) {
  return category + ((tag !== null) ? ('/' + tag) : '')
}

function getSuggestions (list, value) {
  const inputValue = value.trim().toLowerCase()
  return list.filter(tag => tag.toLowerCase().includes(inputValue))
}

function getSuggestionValue (suggestion) {
  return suggestion
}

function renderSuggestion (suggestion) {
  return (
    <span>{ suggestion }</span>
  )
}

function  isFreeTags (category) {
  return category === 'FREETAGS'
}

SideBarTags.contextTypes = {
  intl: intlShape
}

SideBarTags.propTypes = {
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object.isRequired,

  categories: PropTypes.arrayOf(PropTypes.string).isRequired,

  // actions
  addTag: PropTypes.func.isRequired,
  removeTag: PropTypes.func.isRequired,
  addTagsCategory: PropTypes.func.isRequired,
  fetchTags: PropTypes.func.isRequired
}

const mapStateToProps = ({ corpora }, props) => {
  return {
    ...props,
    categories: corpora.list[props.corpusId].tagsCategories || []
  }
}

export default connect(mapStateToProps, {
  addTag,
  removeTag,
  addTagsCategory,
  fetchTags
})(SideBarTags)
