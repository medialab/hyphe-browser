// options page to change the language, reinit servers…
// from Iteration 3, this page is not unreachable anymore,
// i18n change is triggered in HypheFooter

import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { FormattedMessage as T } from 'react-intl'

import actions from '../../actions'
import { LOCALES } from '../../constants'

class Options extends React.Component {
  render () {
    const { actions, locale, locales } = this.props

    return (
      <div className="options">
        <h2 className="pane-centered-title"><T id="options" /></h2>

        <h4><T id="languages" /></h4>
        <div className="form-actions">
          <select
            className="form-control languages-list"
            defaultValue={ locale }
            onChange={ (evt) => { actions.setLocale(evt.target.value) } }
          >
            { locales.map((l) =>
              <option key={ l } value={ l }>{ l }</option>
            ) }
          </select>
        </div>

        <h4><T id="servers" /></h4>
        <div className="form-actions">
          <button className="btn btn-default" onClick={ () => actions.resetServers() }>
            <T id="reset-servers" />
          </button>
        </div>

        <hr />

        <div className="form-actions">
          <Link className="btn btn-default" to="/login"><T id="back" /></Link>
        </div>
      </div>
    )
  }
}

Options.propTypes = {
  actions: PropTypes.object,
  locale: PropTypes.string,
  locales: PropTypes.array
}

const mapStateToProps = (state) => ({
  locale: state.intl.locale,
  locales: LOCALES
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
})

const connectedOptions = connect(mapStateToProps, mapDispatchToProps)(Options)

export default connectedOptions

