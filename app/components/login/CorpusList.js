
import '../../css/login/corpus-list'

import React, { PropTypes } from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { corpusShape, hypheSubStatusShape } from '../../types'

import { Link } from 'react-router'
import { routeActions } from 'react-router-redux'
import { FormattedMessage as T, FormattedRelative as D } from 'react-intl'

// abstract component
class CorpusListItem extends React.Component {
  constructor (props) {
    super(props)
    this.selectCorpus = this.selectCorpus.bind(this)
  }

  selectCorpus () {
    const { actions, server, corpus, dispatch } = this.props
    const path = corpus.get('password') ? '/login/corpus-login-form' : 'browser'
    actions.selectCorpus(server, corpus)
    dispatch(routeActions.push(path))
  }

  render () {
    const { corpus } = this.props

    return (
      <div onClick={ this.selectCorpus }>
        <h5 className="corpus-list-item-name">
          { corpus.get('password') ? <span className="icon icon-lock"></span> : null }
          { corpus.get('name') }
          { corpus.get('status') === 'ready' ? <span className="icon icon-play"></span> : null }
        </h5>
        <div><T id="webentities" values={ { count: corpus.get('webentities_in') } } /></div>
        <div className="corpus-list-item-dates">
          <span><T id="created-ago" values={ { relative: <D value={ corpus.get('created_at') } /> } } /></span>
          <span> - </span>
          <span><T id="used-ago" values={ { relative: <D value={ corpus.get('last_activity') } /> } } /></span>
        </div>
      </div>
    )
  }
}

CorpusListItem.propTypes = {
  actions: PropTypes.object.isRequired,
  corpus: corpusShape.isRequired,
  server: PropTypes.object.isRequired,
  dispatch: PropTypes.func
}

const CorpusList = (props) => {
  const { actions, dispatch, server } = props
  const corpora = props.corpora.sortBy((_, key) => key)

  if (corpora.isEmpty()) {
    return <noscript />
  }

  return (
    <div>
      <h3>
        <T id="available-corpora" values={ { count: corpora.count() } } />
        <span>, </span>
        <T id="running-corpora" values={ { count: status.get('corpus_running') } } />
        <span> / { status.get('corpus_running') + status.get('ports_left') } ports</span>
      </h3>
      <div className="form-group corpus-list-slider">
        <ul className="list-group corpus-list">
          { corpora.valueSeq().map((corpus) =>
            <li className="list-group-item corpus-list-item" key={ corpus.get('corpus_id') }>
              <CorpusListItem actions={ actions } server={ server } corpus={ corpus } dispatch={ dispatch } />
            </li>
          ) }
        </ul>
      </div>
      <div className="form-actions">
        <Link className="btn btn-primary" to="/login/corpus-form"><T id="create-corpus" /></Link>
      </div>
    </div>
  )
}

CorpusList.propTypes = {
  actions: PropTypes.object.isRequired,
  dispatch: PropTypes.func,
  server: PropTypes.object.isRequired,
  corpora: ImmutablePropTypes.mapOf(corpusShape).isRequired,
  status: hypheSubStatusShape
}

export default CorpusList
