import '../../css/browser/page-hyphe-home'
import React from 'react'

class PageHypheHome extends React.Component {

  render () {
    return (
      <div className="page-hyphe-home">
        <form className="google-form" onSubmit={ (e) => { e.preventDefault() } } action="https://google.fr/search">
          <div><img className="google-logo" src="images/logos/google.svg" /></div>
          <div>
            <input type="search" name="q"/>
            <button>
              <span className="icon icon-search"></span>
            </button>
          </div>
        </form>
      </div>
    )
  }
}

export default PageHypheHome
