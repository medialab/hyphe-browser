import React, { PropTypes } from 'react'
import { IntlProvider } from 'react-intl'
import { connect } from 'react-redux'

const App = ({ children, locale, messages }) => (
  <IntlProvider locale={ locale } messages={ messages }>
    <div className="window">
      <div className="window-content">
        { children }
      </div>
    </div>
  </IntlProvider>
)

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
