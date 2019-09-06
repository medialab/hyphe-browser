// displayed when a server is selected

import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { FormattedMessage as T, FormattedRelative as D, intlShape } from 'react-intl'

import { selectCorpus } from '../../actions/corpora'
import Spinner from '../../components/Spinner'
import CardsList from '../../components/CardsList'
import CorpusCard from './CorpusCard'

class CorpusList extends React.Component {
  constructor(props) {
    super(props)
    this.state = { filter: '' }
  }

  render() {
    const { formatMessage } = this.context.intl
    const { server, /*status,*/ ui, selectCorpus, history } = this.props
    const { push: routerPush } = history
    const { notification } = ui

    const hypheFull = false

    if (ui.loaders && ui.loaders.corpora) return <Spinner textId="loading-corpora" />
    if (!server) return null

    let corpora = Object.keys(this.props.corpora)
      .sort()
      .map((k) => this.props.corpora[k])

    corpora = corpora.filter(it => it.name.toLowerCase().includes(this.state.filter.toLowerCase()))

    // only display corpora already started
    if (hypheFull) corpora = corpora.filter(it => it.status === 'ready')

    return (
      <div className="corpora-list-container">
        {!(notification && notification.messageId) && <h3 className="section-header"><T id="choose-a-corpus" /></h3>}
        {notification &&
          (notification.messageId === 'error.loading-server' || notification.messageId === 'error.loading-corpora') &&
          notification.messageValues.error &&
          <div className="form-error"><T id={notification.messageId} values={notification.messageValues.error} /></div>
        }
        {!(notification && notification.messageId)
        && Object.keys(this.props.corpora).length > 1
        &&
        <div className="search-container">
          <input
            value={this.state.filter}
            placeholder={
              formatMessage({
                id: 'corpus-list-search',
              }, {
                  nbCorpora: Object.keys(this.props.corpora).length
                })
            }
            onChange={({ target }) => this.setState({ filter: target.value })}
          />
          <span className="icon ti-search" />
        </div>}

        <CardsList>
          {corpora.map((corpus) =>
            (
              <CorpusCard
                key={corpus.corpus_id}
                corpus={corpus}
                server={server}
                selectCorpus={selectCorpus} routerPush={routerPush}
              />
            )
          )}
        </CardsList>
        {!hypheFull &&
          !(notification && notification.messageValues && notification.messageValues.error) &&
          <div className="buttons-row">
            <Link className="btn btn-primary btn-fullwidth" to="/login/corpus-form"><T id="create-corpus" /></Link>
          </div>
        }
      </div>
    )
  }
}

CorpusList.contextTypes = {
  intl: intlShape
}

CorpusList.propTypes = {
  corpora: PropTypes.object,
  locale: PropTypes.string.isRequired,
  server: PropTypes.object,
  status: PropTypes.object,
  ui: PropTypes.object.isRequired,

  // actions
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
  selectCorpus
})(CorpusList)
