import '../../css/browser/page-hyphe-home'
import React, { PropTypes } from 'react'

class PageHypheHome extends React.Component {

  constructor (props) {
    super(props)
    this.state = { q: '' }
  }

  onSubmit (evt) {
    evt.preventDefault()
    this.props.onSubmit(`https://google.fr/search?q=${this.state.q}`)
  }

  render () {
    return (
      <div className="page-hyphe-home">
        <form className="google-form" onSubmit={ (e) => { this.onSubmit(e) } }>
          <div><img className="google-logo" src="images/logos/google.svg" /></div>
          <div>
            <input type="search" value={ this.state.value }
              onChange={ (e) => { this.setState({ q: e.target.value }) } } />
            <button>
              <span className="icon icon-search"></span>
            </button>
          </div>
        </form>
      </div>
    )
  }
}

PageHypheHome.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default PageHypheHome
