import React, { PropTypes } from 'react'
import { IntlProvider } from 'react-intl'
import { connect } from 'react-redux'

class App extends React.Component {
  render () {
    const { children, locale, messages } = this.props
    // key={ locale } let us refresh i18n strings from the footer
    return (
      <IntlProvider key={ locale } locale={ locale } messages={ messages }>
        { children }
      </IntlProvider>
    )
  }
}

App.propTypes = {
  children: PropTypes.node,
  locale: PropTypes.string,
  messages: PropTypes.object
}

const mapStateToProps = ({ intl }, { children }) => ({
  locale: intl.locale,
  messages: intl.messages,
  children
})

export default connect(mapStateToProps)(App)
