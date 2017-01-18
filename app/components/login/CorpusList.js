// displayed when a server is selected
import '../../css/login/corpus-list'

import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { routerActions } from 'react-router-redux'
import { FormattedMessage as T, FormattedRelative as D, intlShape } from 'react-intl'

import { selectCorpus } from '../../actions/corpora'
import Spinner from '../Spinner'

class CorpusListItem extends React.Component {

  selectCorpus () {
    const { server, corpus, selectCorpus, routerPush } = this.props
    const path = corpus.password ? '/login/corpus-login-form' : 'browser'
    selectCorpus(server, corpus)
    routerPush(path)
  }

  render () {
    const { password, name, status, webentities_in, created_at, last_activity } = this.props.corpus

    return (
      <div onClick={ () => this.selectCorpus() }>
        <h5 className="corpus-list-item-name">
          { password && <span className="icon icon-lock"></span> }
          { name }
          { status === 'ready' && <span className="icon icon-play"></span> }
        </h5>
        <div className="corpus-list-item-webentities"><T id="webentities" values={ { count: webentities_in } } /></div>
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
  corpus: PropTypes.object.isRequired,
  server: PropTypes.object.isRequired,

  // actions
  routerPush: PropTypes.func,
  selectCorpus: PropTypes.func,
}


class CorpusList extends React.Component {
  constructor (props) {
    super(props)
    this.state = { filter: '' }
  }

  render () {
    const { formatMessage } = this.context.intl
    const { server, status, ui, selectCorpus, routerPush } = this.props
    const hypheFull = status && (!status.ports_left || !status.ram_left)

    if (ui.loaders.corpora) return <Spinner textId="loading-corpora" />
    if (!server) return null

    let corpora = Object.keys(this.props.corpora)
      .sort()
      .map((k) => this.props.corpora[k])

    corpora = corpora.filter(it => it.name.toLowerCase().includes(this.state.filter.toLowerCase()))

    // only display corpora already started
    if (hypheFull) corpora = corpora.filter(it => it.status === 'ready')

    const hypheStatus = status && Boolean(status.corpus_running) &&
      (
        <span>
          <span>, </span>
          <T id="running-corpora" values={ { count: status.corpus_running } } />
        </span>
      )

    return (
      <div className="corpus-list">
        <h3>
          <T id="available-corpora" values={ { count: corpora.length } } />
          { hypheStatus }
        </h3>
        { ui.error === true && <div className="form-error"><T id="error.loading-corpora" /></div> }
        { !!Object.keys(this.props.corpora).length && <div className="form-group corpus-list-filter">
          <input  value={ this.state.filter } placeholder={ formatMessage({ id: 'corpus-list-placeholder' }) }
            onChange={ ({ target }) => this.setState({ filter: target.value }) } />
          <span className="ti-search"></span>
        </div> }
        <div className="corpus-list-slider">
          <ul className="list-group corpus-list">
            { corpora.map((corpus) =>
              <li className="list-group-item corpus-list-item" key={ corpus.corpus_id }>
                <CorpusListItem corpus={ corpus } server={ server }
                  selectCorpus={ selectCorpus } routerPush={ routerPush } />
              </li>
            ) }
          </ul>
        </div>
        { !hypheFull && <div className="form-actions">
          <Link className="btn btn-primary" to="/login/corpus-form"><T id="create-corpus" /></Link>
        </div> }
      </div>
    )
  }
}

CorpusList.contextTypes = {
  intl: intlShape
}

CorpusList.propTypes = {
  corpora: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  server: PropTypes.object,
  status: PropTypes.object,
  ui: PropTypes.object.isRequired,

  // actions
  routerPush: PropTypes.func,
  selectCorpus: PropTypes.func,
}

const mapStateToProps = ({ corpora, servers, intl: { locale }, ui }) => ({
  corpora: corpora.list,
  locale,
  server: servers.selected,
  status: corpora.status && corpora.status.hyphe,
  ui
})

export default connect(mapStateToProps, {
  routerPush: routerActions.push,
  selectCorpus
})(CorpusList)
