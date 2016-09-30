import '../../../css/browser/side-bar-tags'

import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import { Creatable } from 'react-select'
import partition from 'lodash.partition'
import difference from 'lodash.difference'

import { TAGS_NS } from '../../../constants'
import Button from '../../Button'

import { addTagsCategory, addTag, removeTag, fetchTags } from '../../../actions/tags'


class SideBarTags extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      newCategory: ''
    }

    // prepopulate inputs
    const userTags = props.webentity.tags[TAGS_NS]
    if (userTags) {
      Object.keys(userTags).forEach(k => {
        this.state[`values/${k}`] = userTags[k]
      })
    }

    // Force-bind methods used like `onEvent={ this.method }`
    this.addCategory = this.addCategory.bind(this)
    this.onChangeNewCategory = this.onChangeNewCategory.bind(this)
    this.renderTagsCategory = this.renderTagsCategory.bind(this)
  }

  componentWillMount () {
    this.updateFullSuggestions(this.props.categories)
  }

  componentWillReceiveProps ({ categories }) {
    if (JSON.stringify(categories) !== JSON.stringify(this.props.categories)) {
      this.updateFullSuggestions(categories)
    }
  }

  updateFullSuggestions (categories) {
    // Updated categories, fetch suggestions
    const { serverUrl, corpusId, fetchTags } = this.props
    fetchTags(serverUrl, corpusId).then((tags) => {
      categories.forEach((category) => {
        this.setState({ ['suggestions/' + category]: tags[category] })
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
      addTagsCategory(serverUrl, corpusId, webentity.id, newCategory)
      this.setState({ newCategory: '' })
    }
  }

  onChangeCreatable (options, category) {
    const { serverUrl, corpusId, webentity, addTag, removeTag } = this.props
    const key = `values/${category}`

    const previousTags = this.state[key] || []
    const nextTags = options.map(o => o.value)
    const addedTags = difference(nextTags, previousTags)
    const removedTags = difference(previousTags, nextTags)

    addedTags.map(tag => addTag(serverUrl, corpusId, category, webentity.id, tag, tag))
    removedTags.map(tag => removeTag(serverUrl, corpusId, category, webentity.id, tag))

    this.setState({ [key]: nextTags })
  }

  // big textarea-like with many tags
  renderFreeTagsCategory (category) {
    const suggestions = this.state[`suggestions/${category}`] || []
    const values = this.state[`values/${category}`] || []

    // TODO 118n
    return (
      <div className="browser-side-bar-tags-free-tags" key={ category }>
        <h3><span>{ this.context.intl.formatMessage({ id: 'sidebar.freetags' }) }</span></h3>
        <Creatable
          clearable={ false }
          multi={ true }
          newOptionCreator={ ({ label }) => toOption(label) }
          options={ suggestions.map(toOption) }
          onChange={ (options) => this.onChangeCreatable(options, category) }
          placeholder={ 'Select tags…' }
          promptTextCreator={ (tag) => `Create new tag: "${tag}"` }
          value={ values.map(toOption) } />
      </div>
    )
  }

  // simpler input with only one tag to fill
  renderTagsCategory (category) {
    const suggestions = this.state[`suggestions/${category}`] || []
    const values = this.state[`values/${category}`] || []

    return (
      <div className="browser-side-bar-tags-category" key={ category }>
        <h4 className="category-name">{ category }</h4>
        <div className="category-tag">
          <Creatable
            clearable={ false }
            multi={ false }
            newOptionCreator={ ({ label }) => toOption(label) }
            options={ suggestions.map(toOption) }
            onChange={ (option) => this.onChangeCreatable([option], category) }
            placeholder={ '' }
            promptTextCreator={ (tag) => `Create new tag: "${tag}"` }
            value={ values.map(toOption)[0] || '' } />
        </div>
      </div>
    )
  }

  // free tags should be first, then other categories, then add category field
  render () {
    const { formatMessage } = this.context.intl
    const [freeTags, cats] = partition(this.props.categories, isFreeTags)

    return (
      <div className="browser-side-bar-tags">
        { this.renderFreeTagsCategory(freeTags[0]) }

        <h3><T id="sidebar.categories" /></h3>
        { cats.map(this.renderTagsCategory) }

        <form className="browser-side-bar-tags-new-category" onSubmit={ this.addCategory }>
          <input placeholder={ formatMessage({ id: 'sidebar.add-tags-category' }) }
            value={ this.state.newCategory }
            onInput={ this.onChangeNewCategory } />
          <Button icon="plus" title={ formatMessage({ id: 'sidebar.add-tags-category' }) } />
        </form>
      </div>
    )
  }
}

function  isFreeTags (category) {
  return category === 'FREETAGS'
}

function toOption (tag) {
  return tag
    ? { label: tag.toLowerCase(), value: tag.toLowerCase() }
    : { label: '', value: '' }
}

SideBarTags.contextTypes = {
  intl: intlShape
}

SideBarTags.propTypes = {
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object.isRequired,

  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  locale: PropTypes.string.isRequired,

  // actions
  addTag: PropTypes.func.isRequired,
  removeTag: PropTypes.func.isRequired,
  addTagsCategory: PropTypes.func.isRequired,
  fetchTags: PropTypes.func.isRequired
}

const mapStateToProps = ({ corpora, intl: { locale } }, props) => ({
  ...props,
  categories: corpora.list[props.corpusId].tagsCategories || [],
  locale
})

export default connect(mapStateToProps, {
  addTag,
  removeTag,
  addTagsCategory,
  fetchTags
})(SideBarTags)
