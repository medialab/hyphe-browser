import './side-bar-tags'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage as T, intlShape } from 'react-intl'
import cx from 'classnames'
import { Creatable } from 'react-select'
import partition from 'lodash.partition'
import uniq from 'lodash.uniq'
import difference from 'lodash.difference'

import { TAGS_NS } from '../../constants'
import Button from '../../components/Button'

import { addTagsCategory, addTag, removeTag } from '../../actions/tags'
import { toggleCategories } from '../../actions/browser'


class SideBarCategories extends React.Component {

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
        // value of the tag is store in array of length 1
        if (userTags[k][0]) {
          this.state[`values/${k}`] = toOption(userTags[k][0])
        }
      })
    }
  }

  repopulate (webentity) {
    Object.keys(this.state).filter(k => ~k.indexOf('values/'))
      .forEach(k => {
        delete this.state[k]
      })
    const userTags = webentity.tags[TAGS_NS]
    if (userTags) {
      Object.keys(userTags).forEach(k => {
        // value of the tag is store in array of length 1
        if (userTags[k][0]) {
          this.state[`values/${k}`] = toOption(userTags[k][0])
        }
      })
    }
  }

  onKeyUp = (e) => {
    if (e.keyCode === 27) { // ESCAPE
      e.target.blur()
    }
  }

  componentWillReceiveProps ({ webentity }) {
    if (webentity && this.props.webentity && webentity.id !== this.props.webentity.id) {
      this.repopulate(webentity)
    }
  }

  onChangeNewCategory = ({ target }) => {
    this.setState({ newCategory: target.value })
  }

  addCategory = (e) => {
    e.preventDefault()

    const { newCategory, categories } = this.state
    if (newCategory && !~this.props.categories.concat(categories).indexOf(newCategory)) {
      const { serverUrl, corpusId, webentity, addTagsCategory } = this.props
      addTagsCategory(serverUrl, corpusId, webentity.id, newCategory)
      this.setState({ newCategory: '', categories: this.state.categories.concat(newCategory) })
    }
  }

  onChangeCreatable = (option, category) => {
    if (option && option.value && option.value.trim().length === 0)
      return    
    const { serverUrl, corpusId, webentity, addTag, removeTag } = this.props
    const key = `values/${category}`
    if (this.state[key] && this.state[key].value) {
      removeTag(serverUrl, corpusId, category, webentity.id, this.state[key].value)
    }
    if (option) {
      addTag(serverUrl, corpusId, category, webentity.id, option.value, option.value)
    }
    this.setState({ [key]: option })
  }

  renderTagsCategory = (category) => {
    const { formatMessage } = this.context.intl
    const { tagsSuggestions } = this.props
    const suggestions = (tagsSuggestions[category] && Object.keys(tagsSuggestions[category])) || []
    const value = this.state[`values/${category}`] || ''
    
    const handleChangeCreatable = (option) => this.onChangeCreatable(option, category)
    
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
            onChange={ handleChangeCreatable }
            placeholder=''
            promptTextCreator={ (tag) => tag+' '  }
            value={ value } />
        </div>
      </div>
    )
  }

  // Categories first, then add category field
  render () {
    const { formatMessage } = this.context.intl
    const { showCategories, toggleCategories } = this.props
    const cats = partition(this.props.categories, isFreeTags)[1]
    const categories = uniq((cats || []).concat(this.state.categories).filter(x => x))

    return (
      <div className="browser-side-bar-tags">
        <div>
          <h3 onClick={ toggleCategories }>
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
                onKeyUp={ this.onKeyUp }
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

SideBarCategories.contextTypes = {
  intl: intlShape
}

SideBarCategories.propTypes = {
  serverUrl: PropTypes.string.isRequired,
  corpusId: PropTypes.string.isRequired,
  webentity: PropTypes.object.isRequired,

  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  tagsSuggestions: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  showCategories: PropTypes.bool.isRequired,

  // actions
  addTag: PropTypes.func.isRequired,
  removeTag: PropTypes.func.isRequired,
  addTagsCategory: PropTypes.func.isRequired,
  toggleCategories: PropTypes.func.isRequired
}

const mapStateToProps = ({ corpora, intl: { locale }, ui }, props) => ({
  ...props,
  categories: corpora.list[props.corpusId].tagsCategories || [],
  tagsSuggestions: corpora.tagsSuggestions[props.corpusId] || {},
  showCategories: ui.showCategories,
  locale
})

export default connect(mapStateToProps, {
  addTag,
  removeTag,
  addTagsCategory,
  toggleCategories
})(SideBarCategories)
