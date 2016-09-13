// bottom left with i18n switcher and corpus indicators if connected
import './../css/hyphe-footer'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { intlShape } from 'react-intl'

import { setLocale } from '../actions/intl'
import { LOCALES } from '../constants'

class HypheFooter extends React.Component {
  render () {
    const formatMessage = this.context.intl.formatMessage
    const { corpus, locale, locales, setLocale } = this.props

    return (
      <footer className="hyphe-footer">
        { locales.map((l, i) =>
          <span>
            <button className={ l === locale ? 'selected' : '' }
              key={ l } onClick={ () => setLocale(l) }>{ l.substr(0, 2) }</button>
            { i < locales.length - 1 ? '|' : '' }
          </span>
        ) }
      </footer>
    )
  }
}

HypheFooter.contextTypes = {
  intl: intlShape
}

HypheFooter.propTypes = {
  corpus: PropTypes.object,
  locale: PropTypes.string,
  locales: PropTypes.array
}

const mapStateToProps = ({ corpora, intl }) => ({
  corpus: corpora.selected,
  locale: intl.locale,
  locales: LOCALES
})

export default connect(mapStateToProps, { setLocale })(HypheFooter)

