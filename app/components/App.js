import React, { PropTypes } from 'react'
import { IntlProvider } from 'react-intl'
import { connect } from 'react-redux'

class App extends React.Component {
  render () {
    const { locale, messages, children } = this.props
    // key={ locale } could let us refresh i18n strings from the footer but it's too destructive
    return (
      <IntlProvider locale={ locale } messages={ messages }>
        { children }
      </IntlProvider>
    )
  }
}

App.propTypes = {
  locale: PropTypes.string,
  messages: PropTypes.object,

  // ownProps
  children: PropTypes.node,
}

const mapStateToProps = ({ intl: { locale, messages } }, { children }) => ({
  locale,
  messages,
  children
})

export default connect(mapStateToProps)(App)
