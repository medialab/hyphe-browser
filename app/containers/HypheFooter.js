// bottom left with i18n switcher and corpus indicators if connected
import './../css/hyphe-footer'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { intlShape } from 'react-intl'

import { setLocale } from '../actions/intl'
import { LOCALES } from '../constants'
import CorpusLoadIndicators from '../components/CorpusLoadIndicators'

class HypheFooter extends React.Component {
  render () {
    const { locale, locales, status, setLocale } = this.props
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
  locale: PropTypes.string.isRequired,
  locales: PropTypes.array,
  status: PropTypes.object,

  // actions
  setLocale: PropTypes.func,
}

const mapStateToProps = ({ corpora, intl: { locale } }) => ({
  locale,
  locales: LOCALES,
  status: corpora.status,
})

export default connect(mapStateToProps, { setLocale })(HypheFooter)

