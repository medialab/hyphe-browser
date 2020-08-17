import React from 'react'
import PropTypes from 'prop-types'
import { IntlProvider } from 'react-intl'
import { connect } from 'react-redux'

import { ipcRenderer as ipc } from 'electron'

import '@formatjs/intl-pluralrules/polyfill'
import '@formatjs/intl-pluralrules/dist/locale-data/en' // Add locale data for en
import '@formatjs/intl-pluralrules/dist/locale-data/fr' // Add locale data for fr

import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/dist/locale-data/en'
import '@formatjs/intl-relativetimeformat/dist/locale-data/fr'

// import en from 'react-intl/locale-data/en'
// import fr from 'react-intl/locale-data/fr'

// addLocaleData([...fr, ...en])

import { setLocale } from '../actions/intl'

class App extends React.Component {
  componentDidMount () {
    this.ipcSetLocale = (e, l) => {
      this.props.setLocale(l)
      ipc.send('setLocaleMain', l)
    }
    ipc.on('setLocale', this.ipcSetLocale)
    ipc.send('appMount', this.props.locale)
  }

  render () {
    const { locale, messages, children } = this.props
    // key={ locale } could let us refresh i18n strings from the footer but it's too destructive
    return (
      <IntlProvider locale={ locale } messages={ messages }>
        {children}
      </IntlProvider>
    )
  }
}

App.propTypes = {
  locale: PropTypes.string,
  messages: PropTypes.object,

  // ownProps
  children: PropTypes.node,

  // actions
  setLocale: PropTypes.func
}

const mapStateToProps = ({ intl: { locale, messages } }, { children }) => ({
  locale,
  messages,
  children
})

export default connect(mapStateToProps, { setLocale })(App)
