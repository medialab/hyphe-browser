import React from 'react'
import { FormattedMessage as T } from 'react-intl'

import CreateServerFormStep from './CreateServerFormStep'

export const HYPHE_SETTINGS_KEY = 'hypheSettings'
export const HYPHE_SETTINGS_RAW_KEY = 'hypheSettingsRaw'
const HTTP_RE = /^https?:\/\//

const SETTINGS = [
  { customRender: (key) => <h4 key={ key }><T id="create-cloud-server.step2.crawl" /></h4> },
  { id: 'HYPHE_MAXDEPTH',
    important: true,
    inline: true,
    type: 'number',
    initialValue: '3',
    attributes: { min: '1', max: '20', className: 'narrow' } },
  { id: 'HYPHE_DOWNLOAD_DELAY',
    inline: true,
    type: 'number',
    initialValue: '1',
    attributes: { min: '0.1', max: '10', step: '0.1', className: 'narrow' } },
  { id: 'HYPHE_MAX_SIM_REQ',
    inline: true,
    type: 'number',
    initialValue: '12',
    attributes: { min: '1', max: '100', className: 'narrow' } },
  { id: 'HYPHE_HOST_MAX_SIM_REQ',
    inline: true,
    type: 'number',
    initialValue: '1',
    attributes: { min: '1', max: '10', className: 'narrow' } },
  { id: 'HYPHE_PROXY_HOST',
    type: 'url',
    initialValue: '',
    checkError: value => {
      let str = value
      if (!str) return null
      if (!str.match(HTTP_RE)) str = 'http://' + str
      try {
        new URL(str)
        return null
      } catch(e) {
        return 'Not a valid URL'
      }
    },
    clean: value => {
      return value ? value.replace(HTTP_RE, '') : undefined
    } },
  { id: 'HYPHE_PROXY_PORT',
    inline: true,
    type: 'number',
    initialValue: '0',
    attributes: { min: '0', max: '65535', className: 'narrow' } },

  { customRender: (key) => <h4 key={ key }><T id="create-cloud-server.step2.contents" /></h4> },
  { id: 'HYPHE_STORE_CRAWLED_HTML',
    important: true,
    inline: true,
    type: 'checkbox',
    initialValue: false },
  { id: 'HYPHE_TRAPH_KEEPALIVE',
    inline: true,
    type: 'number',
    initialValue: '1800',
    attributes: { min: '60', max: '86400', className: 'narrow' } },
  { id: 'HYPHE_TRAPH_MAX_SIM_PAGES',
    inline: true,
    type: 'number',
    initialValue: '250',
    attributes: { min: '50', max: '5000', className: 'narrow' } }
]

class HypheConfigurationStep extends CreateServerFormStep {
  constructor (props) {
    super(props)

    this.state = {
      showAllSettings: false
    }
  }

  getInitialData () {
    const initialRawSettings = {}
    const initialCleanedSettings = {}

    SETTINGS.forEach(({ id, initialValue, clean }) => {
      if (id) {
        initialRawSettings[id] = initialValue
        initialCleanedSettings[id] = clean ? clean(initialValue) : initialValue
      }
    })

    return {
      [HYPHE_SETTINGS_RAW_KEY]: initialRawSettings,
      [HYPHE_SETTINGS_KEY]: initialCleanedSettings,
    }
  }
  isDisabled (data) {
    return SETTINGS.some(({ id, checkError }) => checkError && checkError(data[HYPHE_SETTINGS_KEY][id]))
  }

  renderElement = (setting, i) => {
    if (setting.customRender) return setting.customRender(i)
    if (!setting.important && !this.state.showAllSettings) return null

    const onChange = setting.clean ? value => this.props.setData({
      ...this.props.data,
      // Store raw value in HYPHE_SETTINGS_RAW_KEY:
      [HYPHE_SETTINGS_RAW_KEY]: {
        ...this.props.data[HYPHE_SETTINGS_KEY],
        [setting.id]: value
      },
      // Store only cleaned value in HYPHE_SETTINGS_KEY:
      [HYPHE_SETTINGS_KEY]: {
        ...this.props.data[HYPHE_SETTINGS_KEY],
        [setting.id]: setting.clean(value)
      }
    }) : null
    return (setting.important || this.state.showAllSettings) ? this.renderInput(
      [HYPHE_SETTINGS_RAW_KEY, setting.id],
      'create-cloud-server.step2.' + setting.id,
      {
        type: setting.type,
        horizontal: setting.inline,
        onChange,
        important: setting.important && this.state.showAllSettings,
        error: setting.checkError && setting.checkError(
          this.props.data[HYPHE_SETTINGS_KEY][setting.id]
        ),
        attributes: {
          ...setting.attributes,
        }
      }
    ) : null
  }

  render () {
    return (
      <>
        <p>
          <T id="create-cloud-server.step2.p1" />
        </p>

        <div className="form-group horizontal">
          <input
            id="show-all-hyphe-settings"
            type="checkbox"
            onChange={ e => this.setState({ ...this.state, showAllSettings: e.target.checked }) }
            checked={ this.state.showAllSettings }
          />
          <label htmlFor="show-all-hyphe-settings">
            <T id="create-cloud-server.step2.show-all-settings" />
          </label>
        </div>

        <hr />

        { SETTINGS.map(this.renderElement) }
      </>
    )
  }
}

export default HypheConfigurationStep
