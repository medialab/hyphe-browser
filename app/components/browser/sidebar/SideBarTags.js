import '../../../css/browser/side-bar-tags'
import '../../../css/auto-suggest'

import React, { PropTypes } from 'react'

import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { FormattedMessage as T } from 'react-intl'
import cx from 'classnames'
import Autosuggest from 'react-autosuggest'
import { intlShape } from 'react-intl'
import Button from '../../Button'

import { addTagsCategory, addTag } from '../../../actions/tags'


const tags = [
  'Hello',
  'Bob',
  'Alice',
  'John',
  'How',
  'Are',
  'You'
] // TODO get from API


class SideBarTags extends React.Component {

  constructor (props) {
    super(props)

    this.state = { value: '', category: 'test', suggestions: tags, newCategory: '' }

    this.addCategory = this.addCategory.bind(this)
    this.onChangeNewCategory = this.onChangeNewCategory.bind(this)
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

  render () {
    const { formatMessage } = this.context.intl

    return (
      <div className="tags-container">
        { 'CAT: ' + JSON.stringify(this.props.categories) }

        <ul className="tags-sections">
          <li>
            <h3>Free tags</h3>
            <ul>
              <li><strong className="tag-title">Test 1</strong><a className="remove-tag">×</a></li>
              <li><strong className="tag-title">Test 2</strong><a className="remove-tag">×</a></li>
              <li><strong className="tag-title">Test 3</strong><a className="remove-tag">×</a></li>
            </ul>
          </li>
          <li>
            <h3>Test</h3>
            <ul>
              <li><strong className="tag-title">Test 1</strong><a className="remove-tag">×</a></li>
            </ul>
          </li>
          <li>
            <h3>Webentity</h3>
            <ul>
              <li><strong className="tag-title">Test 1</strong><a className="remove-tag">×</a></li>
            </ul>
          </li>
        </ul>

        New tag

        <form onSubmit={ (e) => {
          e.preventDefault()
          this.props.addTag(this.props.serverUrl, this.props.corpusId, this.state.category, this.props.webentity.id, this.state.value)
          this.setState({ value: '' })
        } }>
          <Autosuggest
            suggestions={ this.state.suggestions }
            onSuggestionsUpdateRequested={ ({ value, reason }) => {
              console.log('onSuggestionsUpdateRequested', value, reason)
              this.setState({ suggestions: getSuggestions(value) })
            } }
            getSuggestionValue={ getSuggestionValue }
            renderSuggestion={ renderSuggestion }
            shouldRenderSuggestions={ () => true }
            inputProps={ {
              placeholder: 'New tag',
              value: this.state.value,
              onChange: (e, { newValue, method }) => {
                console.log('onChange', newValue, method)
                this.setState({ value: newValue })
              }
            } } />
        </form>

        <form className="tags-new-category btn-group" onSubmit={ this.addCategory }>
          <input className="form-control btn btn-large" type="text" value={ this.state.newCategory } onInput={ this.onChangeNewCategory } />
          <Button size="large" icon="plus" title={ formatMessage({ id: 'sidebar.add-tags-category' }) } />
        </form>
      </div>
    )
  }
}


function getSuggestions (value) {
  const inputValue = value.trim().toLowerCase()
  return tags.filter(tag => tag.toLowerCase().indexOf(inputValue) !== -1)
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
  addTagsCategory: PropTypes.func.isRequired
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
  addTag
})(SideBarTags)
