// bottom left with i18n switcher and corpus indicators if connected
import './footer.styl'

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { intlShape } from 'react-intl'

import { setLocale } from '../../actions/intl'
import { LOCALES } from '../../constants'

const Footer = ( {
  locale, 
  locales, 
  setLocale
} ) => {

  return (
    <footer className="hyphe-footer">
      <span className="locales">
        { locales.map((l, i) => {
          const handleSetLocale = () => setLocale(l)
          return (
            <span key={ l }>
              <button className={ l === locale ? 'selected' : '' }
                onClick={ handleSetLocale }
              >{ l.substr(0, 2) }</button>
              { i < locales.length - 1 ? '|' : '' }
            </span> )
        }) }
      </span>
    </footer>
  )
}

Footer.contextTypes = {
  intl: intlShape
}

Footer.propTypes = {
  locale: PropTypes.string.isRequired,
  locales: PropTypes.array,

  // actions
  setLocale: PropTypes.func,
}

const mapStateToProps = ({ intl: { locale } }) => ({
  locale,
  locales: LOCALES,
})

export default connect(mapStateToProps, { setLocale })(Footer)

