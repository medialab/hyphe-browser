// displayed when a server is selected

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import cx from 'classnames'

import { connect } from 'react-redux'
import { FormattedMessage as T, useIntl } from 'react-intl'

import { compare } from '../../utils/misc'
import { selectCorpus } from '../../actions/corpora'
import Spinner from '../../components/Spinner'
import CardsList from '../../components/CardsList'
import CorpusCard from './CorpusCard'
import {
  SERVER_STATUS_PROCESSING,
  SERVER_STATUS_SHUTOFF,
  SERVER_STATUS_UNKNOWN
} from '../../constants'

const NO_CORPORA_STATUSES = {
  [SERVER_STATUS_PROCESSING]: true,
  [SERVER_STATUS_SHUTOFF]: true,
  [SERVER_STATUS_UNKNOWN]: true,
}

const orderOptions = [
  { id: 'name', value: 'name' },
  { id: 'in-count', value: 'webentities_in' },
  { id: 'total-count',value: 'total_webentities' },
  { id: 'last-activity', value: 'last_activity' }
]

const CorpusList = props => {

  const [filter, setFilter] = useState('')
  const [isOrderOpen, setOrderOpen] = useState(false)
  const [order, setOrder] = useState(orderOptions[0])

  const { formatMessage } = useIntl()
  const { server, /*status,*/ ui, selectCorpus, history } = props
  const { push: routerPush } = history
  const { notification } = ui

  const hypheFull = false

  const handleSelectOrder = (order) => {
    setOrder(order)
    setOrderOpen(false)
  }
  if (!server) return null
  if (server.cloud) {
    if (!server.cloud.installed) return (
      <div className="installing-server-container">
        <h3 className="section-header"><T id="server-being-installed" /></h3>
      </div>
    )
    if (NO_CORPORA_STATUSES[server.cloud.status]) return null
  }
  if (!props.corpora) return null

  if (ui.loaders && (ui.loaders.corpora || ui.loaders.cloudserver_action))
    return <Spinner textId="loading-corpora" />

  let corpora = Object.keys(props.corpora)
    .map((k) => props.corpora[k])
    .sort((a, b) => {
      if (order.value === 'name') {
        const aValue = a[order.value].toLowerCase()
        const bValue = b[order.value].toLowerCase()
        return compare(aValue, bValue)
      }
      else {
        return compare(b[order.value], a[order.value])
      }
    })

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
      <div className="corpora-list-header">
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
        </div>
        <span className={ cx('order-container', { 'is-active': isOrderOpen }) }>
          <button
            aria-label={ formatMessage({ id: 'corpus-list-sort' }) }
            onClick={ () => setOrderOpen(!isOrderOpen) }
            className="order-button hint--bottom-left"
          >
            <i className="ti-list" />
          </button>
          {isOrderOpen &&
            <ul className="order-options">
              {
                orderOptions.map((option, index) => (
                  <li
                    key={ index }
                    className={ cx('order-option', { 'is-active': order.value === option.value }) }
                    onClick={ () => handleSelectOrder(option) }
                  >
                    <T id={ `corpus-list-order.${option.id}` } />
                  </li>
                ))
              }
            </ul>
          }
        </span>
      </div>}

      {!corpora.length && filter && <span>{ formatMessage({ id: 'no-corpus-matching-search' }) }</span>}
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
          <Link
            className="btn btn-primary btn-fullwidth"
            to={ {
              pathname: '/login/corpus-form',
              state: { filterName: filter }
            } }
          >
            <T id="create-corpus" />
          </Link>
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
