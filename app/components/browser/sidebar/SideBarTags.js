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
    const isFreeTags = (category === 'FREETAGS')
    const freeTagsTitle = this.context.intl.formatMessage({ id: 'sidebar.freetags' })
    const canAddTag = isFreeTags || tags.length === 0

    return (
      <li key={ category }>
        <h3><span>{ isFreeTags ? freeTagsTitle : category }</span></h3>
        <ul>
          { tags.map(this.renderTag(category)) }
        </ul>
        { canAddTag ? this.renderTagInput(category) : null }
      </li>
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
        className={ cx('btn-group', { 'tags-new-tag': !tag, 'tags-edit-tag': !!tag }) }
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
            className: 'form-control btn tag-input-' + uniqSuffix,
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
        <li key={ 'tag/view/' + category + '/' + tag } className="btn-group">
          <strong
            className="form-control btn tag-title"
            onClick={ () => this.editTag(category, tag, true) }
          >{ tag }</strong>
          <span
            className="btn btn-default icon icon-erase remove-tag"
            title={ formatMessage({ id: 'sidebar.remove-tag' }) }
            onClick={ () => this.removeTag(category, tag) }
          />
        </li>
      )
    }
  }

  render () {
    const { formatMessage } = this.context.intl

    return (
      <div className="tags-container">
        <h3><T id="sidebar.categories" /></h3>
        <form className="tags-new-category btn-group" onSubmit={ this.addCategory }>
          <input className="form-control btn" type="text" value={ this.state.newCategory } onInput={ this.onChangeNewCategory } />
          <Button icon="plus" title={ formatMessage({ id: 'sidebar.add-tags-category' }) } />
        </form>
        <ul className="tags-sections">
          { this.props.categories.map(this.renderTagsCategory) }
        </ul>
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


SideBarTags.propTypes = {
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object.isRequired,

  categories: PropTypes.arrayOf(PropTypes.string).isRequired,

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

SideBarTags.contextTypes = {
  intl: intlShape
}

export default connect(mapStateToProps, {
  addTagsCategory,
  addTag,
  removeTag,
  fetchTags
})(SideBarTags)
