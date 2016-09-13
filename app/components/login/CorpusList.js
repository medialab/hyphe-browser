
import '../../css/login/corpus-list'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { routerActions } from 'react-router-redux'
import { FormattedMessage as T, FormattedRelative as D } from 'react-intl'

// abstract component
class CorpusListItem extends React.Component {
  constructor (props) {
    super(props)
    this.selectCorpus = this.selectCorpus.bind(this)
  }

  selectCorpus () {
    const { actions, server, corpus, dispatch } = this.props
    const path = corpus.password ? '/login/corpus-login-form' : 'browser'
    actions.selectCorpus(server, corpus)
    dispatch(routerActions.push(path))
  }

  render () {
    const { password, name, status, webentities_in, created_at,
      last_activity } = this.props.corpus

    return (
      <div onClick={ this.selectCorpus }>
        <h5 className="corpus-list-item-name">
          { password && <span className="icon icon-lock"></span> }
          { name }
          { status === 'ready' && <span className="icon icon-play"></span> }
        </h5>
        <div><T id="webentities" values={ { count: webentities_in } } /></div>
        <div className="corpus-list-item-dates">
          <span><T id="created-ago" values={ { relative: <D value={ created_at } /> } } /></span>
          <span> - </span>
          <span><T id="used-ago" values={ { relative: <D value={ last_activity } /> } } /></span>
        </div>
      </div>
    )
  }
}

CorpusListItem.propTypes = {
  actions: PropTypes.object.isRequired,
  corpus: PropTypes.object.isRequired,
  server: PropTypes.object.isRequired,
  dispatch: PropTypes.func
}

const CorpusList = (props) => {

  const { actions, dispatch, server, status } = props
  const corpora = Object.keys(props.corpora)
    .sort()
    .map((k) => props.corpora[k])

  if (!corpora.length) return null

  const hypheStatus = status && Boolean(status.corpus_running) &&
    (
      <span>
        <span>, </span>
        <T id="running-corpora" values={ { count: status.corpus_running } } />
      </span>
    )

  return (
    <div>
      <h3>
        <T id="available-corpora" values={ { count: corpora.length } } />
        { hypheStatus }
      </h3>
      <div className="form-group corpus-list-slider">
        <ul className="list-group corpus-list">
          { corpora.map((corpus) =>
            <li className="list-group-item corpus-list-item" key={ corpus.corpus_id }>
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
  corpora: PropTypes.object.isRequired,
  server: PropTypes.object.isRequired,
  status: PropTypes.object
}

export default CorpusList
