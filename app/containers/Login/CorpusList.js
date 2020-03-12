// displayed when a server is selected

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { FormattedMessage as T, useIntl } from 'react-intl'

import { selectCorpus } from '../../actions/corpora'
import Spinner from '../../components/Spinner'
import CardsList from '../../components/CardsList'
import CorpusCard from './CorpusCard'

const CorpusList = props => {
  
  const [filter, setFilter] = useState('')
    
  const { formatMessage } = useIntl()
  const { server, /*status,*/ ui, selectCorpus, history } = props
  const { push: routerPush } = history
  const { notification } = ui

  const hypheFull = false

  if (ui.loaders && ui.loaders.corpora) return <Spinner textId="loading-corpora" />
  if (!server) return null

  let corpora = Object.keys(props.corpora)
    .sort()
    .map((k) => props.corpora[k])

  corpora = corpora.filter(it => it.name.toLowerCase().includes(filter.toLowerCase()))

  // only display corpora already started
  if (hypheFull) corpora = corpora.filter(it => it.status === 'ready')

  return (
    <div className="corpora-list-container">
      {!(notification && notification.messageId) && <h3 className="section-header"><T id="choose-a-corpus" /></h3>}
      {notification &&
        (notification.messageId === 'error.loading-server' || notification.messageId === 'error.loading-corpora') &&
        notification.messageValues.error &&
        <div className="form-error"><T id={ notification.messageId } values={ notification.messageValues.error } /></div>
      }
      {!(notification && notification.messageId)
      && Object.keys(props.corpora).length > 1
      &&
      <div className="search-container">
        <input
          value={ filter }
          placeholder={
            formatMessage({
              id: 'corpus-list-search',
            }, {
              nbCorpora: Object.keys(props.corpora).length
            })
          }
          onChange={ ({ target }) => setFilter(target.value) }
        />
        <span className="icon ti-search" />
      </div>}

      <CardsList>
        {corpora.map((corpus) =>
          (
            <CorpusCard
              key={ corpus.corpus_id }
              corpus={ corpus }
              server={ server }
              selectCorpus={ selectCorpus }
              routerPush={ routerPush }
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
