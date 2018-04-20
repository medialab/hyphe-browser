import '../../../css/browser/side-bar-tags'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'
import { Creatable } from 'react-select'
import partition from 'lodash.partition'
import uniq from 'lodash.uniq'
import difference from 'lodash.difference'

import { TAGS_NS } from '../../../constants'
import Button from '../../Button'

import { addTagsCategory, addTag, removeTag, fetchTags } from '../../../actions/tags'
import { toggleCategories } from '../../../actions/browser'


class SideBarTags extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      newCategory: '',
      // to avoid disappearing categories if new categories come from corpus-watcher just after creation
      categories: [],
    }

    // prepopulate inputs
    const userTags = props.webentity.tags[TAGS_NS]
    if (userTags) {
      Object.keys(userTags).forEach(k => {
        this.state[`values/${k}`] = userTags[k].map(toOption)
      })
    }

    // Force-bind methods used like `onEvent={ this.method }`
    this.addCategory = this.addCategory.bind(this)
    this.onChangeNewCategory = this.onChangeNewCategory.bind(this)
    this.renderTagsCategory = this.renderTagsCategory.bind(this)
    this._onKeyUp = this.onKeyUp.bind(this)
  }

  repopulate (webentity) {
    Object.keys(this.state).filter(k => ~k.indexOf('values/'))
      .forEach(k => {
        delete this.state[k]
      })
    const userTags = webentity.tags[TAGS_NS]
    if (userTags) {
      Object.keys(userTags).forEach(k => {
        this.state[`values/${k}`] = userTags[k].map(toOption)
      })
    }
  }

  onKeyUp (e) {
    if (e.keyCode === 27) { // ESCAPE
      e.target.blur()
    }
  }

  componentWillMount () {
    this.updateFullSuggestions(this.props.categories)
  }

  componentWillReceiveProps ({ categories, webentity }) {
    if (webentity && this.props.webentity && webentity.id !== this.props.webentity.id) {
      this.repopulate(webentity)
    }
    if (JSON.stringify(categories) !== JSON.stringify(this.props.categories)) {
      this.updateFullSuggestions(categories)
    }
  }

  updateFullSuggestions (categories) {
    // Updated categories, fetch suggestions
    const { serverUrl, corpusId, fetchTags } = this.props
    fetchTags(serverUrl, corpusId).then((tags) => {
      categories.forEach((category) => {
        this.setState({ ['suggestions/' + category]: Object.keys(tags[category] || {}) })
      })
    })
  }

  onChangeNewCategory ({ target }) {
    this.setState({ newCategory: target.value })
  }

  addCategory (e) {
    e.preventDefault()

    const { newCategory, categories } = this.state
    if (newCategory && !~this.props.categories.concat(categories).indexOf(newCategory)) {
      const { serverUrl, corpusId, webentity, addTagsCategory } = this.props
      addTagsCategory(serverUrl, corpusId, webentity.id, newCategory)
      this.setState({ newCategory: '', categories: this.state.categories.concat(newCategory) })
    }
  }

  onChangeCreatable (options, category) {
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

  // big textarea-like with many tags
  renderFreeTagsCategory (category) {
    const { formatMessage } = this.context.intl
    const suggestions = this.state[`suggestions/${category}`] || []
    const values = this.state[`values/${category}`] || []

    return (
      <div className="browser-side-bar-tags-free-tags" key={ category } onKeyUp={ this._onKeyUp } >
        <h3><span>{ formatMessage({ id: 'sidebar.freetags' }) }</span></h3>
        <Creatable
          autoBlur ignoreCase multi
          clearable={ false }
          newOptionCreator={ ({ label }) => toOption(label) }
          noResultsText=''
          options={ suggestions.map(toOption) }
          onChange={ (options) => this.onChangeCreatable(options, category) }
          placeholder={ formatMessage({ id: 'sidebar.select-tags' }) }
          promptTextCreator={ (tag) => `${formatMessage({ id: 'sidebar.create-tag' })}"${tag}"` }
          value={ values } />
      </div>
    )
  }

  // simpler input with only one tag to fill
  renderTagsCategory (category) {
    const { formatMessage } = this.context.intl
    const suggestions = this.state[`suggestions/${category}`] || []
    const values = this.state[`values/${category}`] || []

    return (
      <div className="browser-side-bar-tags-category" key={ category }>
        <h4 className="category-name">{ category }</h4>
        <div className="category-tag" onKeyUp={ this._onKeyUp } >
          <Creatable
            autoBlur ignoreCase
            multi={ false }
            clearValueText={ formatMessage({ id: 'tags-clear-category-value' }) }
            newOptionCreator={ ({ label }) => toOption(label) }
            noResultsText=''
            options={ suggestions.map(toOption) }
            onChange={ (option) => this.onChangeCreatable([option], category) }
            placeholder=''
            promptTextCreator={ (tag) => tag+' '  }
            value={ values[0] || '' } />
        </div>
      </div>
    )
  }

  // free tags should be first, then other categories, then add category field
  render () {
    const { formatMessage } = this.context.intl
    const { showCategories, toggleCategories } = this.props
    const [freeTags, cats] = partition(this.props.categories, isFreeTags)
    const categories = uniq((cats || []).concat(this.state.categories).filter(x => x))

    return (
      <div className="browser-side-bar-tags">
        { this.renderFreeTagsCategory(freeTags[0]) }

        <div>
          <h3 onClick={ () => toggleCategories() }>
            <T id="sidebar.categories" />
            <span className={ cx({
              'ti-angle-up': showCategories,
              'ti-angle-down': !showCategories
            }) }></span>
          </h3>

          { showCategories && <div>
            { categories.sort().map(this.renderTagsCategory) }

            <form className="browser-side-bar-tags-new-category" onSubmit={ this.addCategory }>
              <input placeholder={ formatMessage({ id: 'sidebar.add-tags-category' }) }
                value={ this.state.newCategory }
                onKeyUp={ this._onKeyUp }
                onInput={ this.onChangeNewCategory } />
              <Button icon="plus" title={ formatMessage({ id: 'sidebar.add-tags-category' }) } />
            </form>
          </div> }
        </div>
      </div>
    )
  }
}

function  isFreeTags (category) {
  return category === 'FREETAGS'
}

function toOption (tag) {
  return tag
    ? { label: tag, value: tag }
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
  showCategories: PropTypes.bool.isRequired,

  // actions
  addTag: PropTypes.func.isRequired,
  removeTag: PropTypes.func.isRequired,
  addTagsCategory: PropTypes.func.isRequired,
  fetchTags: PropTypes.func.isRequired,
  toggleCategories: PropTypes.func.isRequired
}

const mapStateToProps = ({ corpora, intl: { locale }, ui }, props) => ({
  ...props,
  categories: corpora.list[props.corpusId].tagsCategories || [],
  showCategories: ui.showCategories,
  locale
})

export default connect(mapStateToProps, {
  addTag,
  removeTag,
  addTagsCategory,
  fetchTags,
  toggleCategories
})(SideBarTags)
