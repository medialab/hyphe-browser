import '../../../css/browser/side-bar-tags'
import '../../../css/auto-suggest'

import React, { PropTypes } from 'react'

import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { FormattedMessage as T } from 'react-intl'
import Autosuggest from 'react-autosuggest'
import { intlShape } from 'react-intl'
import Button from '../../Button'

import { addTagsCategory, addTag, removeTag, fetchTags } from '../../../actions/tags'


class SideBarTags extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      tagValue: {}, // [category]: string
      fullSuggestions: {}, // [category]: Array<string>
      currentSuggestions: [], // Array<string>
      newCategory: ''
    }

    this.addCategory = this.addCategory.bind(this)
    this.onChangeNewCategory = this.onChangeNewCategory.bind(this)
    this.renderTagsCategory = this.renderTagsCategory.bind(this)
    this.renderTag = this.renderTag.bind(this)
    this.renderTagInput = this.renderTagInput.bind(this)
    this.addTag = this.addTag.bind(this)
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
    categories.forEach((category) => {
      this.fetchFullSuggestions(category)
    })
  }

  onChangeNewCategory (e) {
    this.setState({ newCategory: e.target.value })
  }

  addCategory (e) {
    e.preventDefault()

    const { newCategory } = this.state
    if (newCategory) {
      const { serverUrl, corpusId, addTagsCategory } = this.props
      addTagsCategory(serverUrl, corpusId, this.state.newCategory)
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
        <h3>{ isFreeTags ? freeTagsTitle : category }</h3>
        <ul>
          { tags.map(this.renderTag(category)) }
        </ul>
        { canAddTag ? this.renderTagInput(category) : <noscript /> }
      </li>
    )
  }

  fetchFullSuggestions (category) {
    const { serverUrl, corpusId, fetchTags } = this.props
    fetchTags(serverUrl, corpusId, category).then((tags) => {
      this.setState({
        fullSuggestions: {
          ...this.state.fullSuggestions,
          [category]: tags
        }
      })
    })
  }

  addTag (category) {
    return (e) => {
      e.preventDefault()
      const { serverUrl, corpusId, webentity, addTag } = this.props
      const value = this.state.tagValue[category]
      this.onChangeTagValue(category, '')
      addTag(serverUrl, corpusId, category, webentity.id, value).then(() => {
        // Keep suggestions up to date
        this.setState({
          fullSuggestions: {
            ...this.state.fullSuggestions,
            [category]: (this.state.fullSuggestions[category] || []).concat(value)
          }
        })
      })
    }
  }

  onChangeTagValue (category, value) {
    this.setState({
      tagValue: {
        ...this.state.tagValue,
        [category]: value
      }
    })
  }

  renderTagInput (category) {
    const { formatMessage } = this.context.intl

    return (
      <form className="tags-new-tag btn-group" onSubmit={ this.addTag(category) }>
        <Autosuggest
          id={ 'tags-' + category }
          suggestions={ this.state.currentSuggestions }
          onSuggestionsUpdateRequested={ ({ value }) => this.setState({ currentSuggestions: getSuggestions(this.state.fullSuggestions[category], value) }) }
          getSuggestionValue={ getSuggestionValue }
          renderSuggestion={ renderSuggestion }
          shouldRenderSuggestions={ () => true }
          inputProps={ {
            className: 'form-control btn btn-large',
            placeholder: 'New tag',
            value: this.state.tagValue[category],
            onChange: (e, { newValue }) => this.onChangeTagValue(category, newValue)
          } }
        />
        <Button size="large" icon="plus" title={ formatMessage({ id: 'sidebar.add-tag' }) } />
      </form>
    )
  }

  removeTag (category, value) {
    const { serverUrl, corpusId, webentity, removeTag } = this.props
    removeTag(serverUrl, corpusId, category, webentity.id, value)
  }

  renderTag (category) {
    return (tag) => {
      const { formatMessage } = this.context.intl

      return (
        <li key={ category + '/' + tag }>
          <strong className="tag-title">{ tag }</strong>
          <span className="icon icon-erase remove-tag"
            title={ formatMessage({ id: 'sidebar.remove-tag' }) }
            onClick={ () => this.removeTag(category, tag) } />
        </li>
      )
    }
  }

  render () {
    const { formatMessage } = this.context.intl

    return (
      <div className="tags-container">
        <ul className="tags-sections">
          { this.props.categories.map(this.renderTagsCategory) }
        </ul>
        <hr />
        <h4><T id="sidebar.add-tags-category" /></h4>
        <form className="tags-new-category btn-group" onSubmit={ this.addCategory }>
          <input className="form-control btn btn-large" type="text" value={ this.state.newCategory } onInput={ this.onChangeNewCategory } />
          <Button size="large" icon="plus" title={ formatMessage({ id: 'sidebar.add-tags-category' }) } />
        </form>
      </div>
    )
  }
}


function getSuggestions (list, value) {
  const inputValue = value.trim().toLowerCase()
  return list.filter(tag => tag.toLowerCase().indexOf(inputValue) !== -1)
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
