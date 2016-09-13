// bottom left with i18n switcher and corpus indicators if connected
import './../css/hyphe-footer'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { intlShape } from 'react-intl'

import { setLocale } from '../actions/intl'
import { LOCALES } from '../constants'
import CorpusLoadIndicators from './CorpusLoadIndicators'

class HypheFooter extends React.Component {
  render () {
    const { locale, locales, setLocale, status } = this.props
    const ready = status && status.corpus && status.corpus.ready

    return (
      <footer className="hyphe-footer">
        <span className="locales">
        { locales.map((l, i) =>
          <span key={ l }>
            <button className={ l === locale ? 'selected' : '' }
              onClick={ () => setLocale(l) }>{ l.substr(0, 2) }</button>
            { i < locales.length - 1 ? '|' : '' }
          </span>
        ) }
        </span>
        { ready && <CorpusLoadIndicators status={ status } /> }
      </footer>
    )
  }
}

HypheFooter.contextTypes = {
  intl: intlShape
}

HypheFooter.propTypes = {
  locale: PropTypes.string,
  locales: PropTypes.array,
  setLocale: PropTypes.func,
  status: PropTypes.object
}

const mapStateToProps = ({ corpora, intl }) => ({
  status: corpora.status,
  locale: intl.locale,
  locales: LOCALES
})

export default connect(mapStateToProps, { setLocale })(HypheFooter)

