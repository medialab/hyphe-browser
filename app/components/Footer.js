// bottom left with i18n switcher and corpus indicators if connected
import '../css/hyphe-footer'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { intlShape } from 'react-intl'

import { setLocale } from '../actions/intl'
import { LOCALES } from '../constants'
import CorpusLoadIndicators from './CorpusLoadIndicators'

const Footer = ( {
  locale, 
  locales, 
  status, 
  setLocale
} ) => {
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

Footer.contextTypes = {
  intl: intlShape
}

Footer.propTypes = {
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

export default connect(mapStateToProps, { setLocale })(Footer)

