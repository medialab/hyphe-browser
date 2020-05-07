/**
 * This component implements the Hyphe configuration form. The workflow is the
 * following:
 *
 * 1. The `SETTINGS` array represents the list of all inputs. Check the
 *    `#renderElement` method to understand how those inputs are described
 *
 * 2. The inputs are bound to `props.data[HYPHE_SETTINGS_RAW_KEY]` state
 *
 * 3. Anytime the raw data are modified, the `props.data[HYPHE_SETTINGS_KEY]`
 *    (cleaned data) are regenerated, using the `rawToCleanedSettings` function
 */
import React from 'react'
import { Creatable } from 'react-select'
import { clamp, identity, values, mapValues, omitBy } from 'lodash'
import { FormattedMessage as T } from 'react-intl'

import CreateServerFormStep from './CreateServerFormStep'

import './hypheConfigurationStep.styl'

export const HYPHE_SETTINGS_KEY = 'hypheSettings'
export const HYPHE_SETTINGS_RAW_KEY = 'hypheSettingsRaw'
const HTTP_RE = /^https?:\/\//
const CREATION_RULE_RE = /^(page|domain|subdomain(-[12]?\d)?|path-[12]?\d)$/

/**
 * This array represents each inputs required for Hyphe configuration. To
 * understand more precisely the specs, check
 */
const SETTINGS = [
  { customRender: (key) => <h3 key={ key }><T id="create-cloud-server.step2.crawl" /></h3> },
  { id: 'HYPHE_MAXDEPTH',
    important: true,
    inline: true,
    type: 'number',
    attributes: { min: '1', max: '20', className: 'narrow' } },
  { id: 'HYPHE_DOWNLOAD_DELAY',
    inline: true,
    type: 'number',
    attributes: { min: '0.1', max: '10', step: '0.1', className: 'narrow' } },
  { id: 'HYPHE_MAX_SIM_REQ',
    inline: true,
    type: 'number',
    attributes: { min: '1', max: '100', className: 'narrow' } },
  { id: 'HYPHE_HOST_MAX_SIM_REQ',
    inline: true,
    type: 'number',
    attributes: { min: '1', max: '10', className: 'narrow' } },
  { id: 'HYPHE_PROXY_HOST',
    type: 'url',
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
    attributes: { min: '0', max: '65535', className: 'narrow' } },

  { customRender: (key) => <h3 key={ key }><T id="create-cloud-server.step2.contents" /></h3> },
  { id: 'HYPHE_STORE_CRAWLED_HTML',
    important: true,
    inline: true,
    type: 'checkbox' },
  { id: 'HYPHE_TRAPH_KEEPALIVE',
    inline: true,
    type: 'number',
    attributes: { min: '60', max: '86400', className: 'narrow' } },
  { id: 'HYPHE_TRAPH_MAX_SIM_PAGES',
    inline: true,
    type: 'number',
    attributes: { min: '50', max: '5000', className: 'narrow' } },

  { customRender: (key) => <h3 key={ key }><T id="create-cloud-server.step2.web-entites" /></h3> },
  { customRender: (key) => <h4 key={ key }><T id="create-cloud-server.step2.start-pages" /></h4> },
  { id: 'START_HOMEPAGE',
    customClean: true,
    inline: true,
    type: 'checkbox' },
  { id: 'START_PREFIXES',
    customClean: true,
    inline: true,
    type: 'checkbox' },
  { customRender: (key, { data, setRawData }) => {
    const checked = data[HYPHE_SETTINGS_RAW_KEY]['START_MOST_CITED']
    const count = data[HYPHE_SETTINGS_RAW_KEY]['START_MOST_CITED_COUNT']

    const MIN_COUNT = 1
    const MAX_COUNT = 1000

    const change = (key, value) => setRawData(key, value)

    return (
      <div key={ key } className="form-group horizontal">
        <input
          id="hyphe_start_pages_most_cited"
          type="checkbox"
          checked={ checked }
          onChange={ e => change('START_MOST_CITED', e.target.checked) }
        />
        <label htmlFor="hyphe_start_pages_most_cited">
          <T id="create-cloud-server.step2.START_MOST_CITED-1" />
          <input
            type="number"
            value={ count }
            onChange={ e => change('START_MOST_CITED_COUNT', clamp(e.target.value, MIN_COUNT, MAX_COUNT)) }
            disabled={ !checked }
            min={ MIN_COUNT + '' }
            max={ MAX_COUNT + '' }
            style={ { margin: '0 10px', width: 65, height: 22 } }
          />
          <T id="create-cloud-server.step2.START_MOST_CITED-2" />
        </label>
      </div>
    )
  } },
  { id: 'HYPHE_DEFAULT_CREATION_RULE',
    customClean: true,
    type: 'select',
    labelTag: 'h4',
    options: [
      { key: 'subdomain', labelKey: 'create-cloud-server.step2.HYPHE_DEFAULT_CREATION_RULE.subdomain' },
      { key: 'domain', labelKey: 'create-cloud-server.step2.HYPHE_DEFAULT_CREATION_RULE.domain' },
      { key: 'page', labelKey: 'create-cloud-server.step2.HYPHE_DEFAULT_CREATION_RULE.page' }
    ] },
  { id: 'HYPHE_CREATION_RULES',
    customClean: true,
    type: 'textarea',
    labelTag: 'h4',
    attributes: {
      style: { height: 280, resize: 'vertical' }
    },
    checkError: value => {
      const str = value
      let data
      if (!str) return null
      try {
        data = JSON.parse(str)
      } catch(e) {
        return 'Not a valid JSON string'
      }
      try {
        const wrongValue = values(data).find(s => !s.match(CREATION_RULE_RE))
        if (wrongValue)
          return `Value "${wrongValue}" does not match ${CREATION_RULE_RE}`
      } catch(e) {
        return 'Invalid data format'
      }
    } },
  { customRender: (key, { data, setRawData, intl: { formatMessage } }) => {
    const values = data[HYPHE_SETTINGS_RAW_KEY].HYPHE_FOLLOW_REDIRECTS || []

    return (
      <div key={ key } className="form-group">
        <h4><T id="create-cloud-server.step2.automatic-redirection" /></h4>
        <Creatable
          multi
          clearable
          placeholder=""
          name="hyphe-follow-redirects"
          value={ values.map(value => ({ value, label: value })) }
          onChange={ values => setRawData(
            'HYPHE_FOLLOW_REDIRECTS',
            values.map(({ value }) => value)
          ) }
          promptTextCreator={ label => formatMessage({ id: 'create-cloud-server.step2.add-redirection' }, { label }) }
        />
      </div>
    )
  } },

  { customRender: (key) => <h3 key={ key }><T id="create-cloud-server.step2.web-settings" /></h3> },
  { id: 'HYPHE_OPEN_CORS_API',
    inline: true,
    type: 'checkbox' },
  { id: 'HYPHE_ADMIN_PASSWORD',
    important: true,
    type: 'password' },
  { id: 'HYPHE_GOOGLE_ANALYTICS_ID'  }
]

const INITIAL_RAW_SETTINGS = {
  HYPHE_MAXDEPTH: '3',
  HYPHE_DOWNLOAD_DELAY: '1',
  HYPHE_MAX_SIM_REQ: '12',
  HYPHE_HOST_MAX_SIM_REQ: '1',
  HYPHE_PROXY_HOST: '',
  HYPHE_PROXY_PORT: '0',
  HYPHE_STORE_CRAWLED_HTML: false,
  HYPHE_TRAPH_KEEPALIVE: '1800',
  HYPHE_TRAPH_MAX_SIM_PAGES: '250',
  START_HOMEPAGE: true,
  START_PREFIXES: false,
  START_MOST_CITED: false,
  START_MOST_CITED_COUNT: '5',
  HYPHE_DEFAULT_CREATION_RULE: 'subdomain',
  HYPHE_CREATION_RULES: JSON.stringify({
    'twitter.com': 'path-1',
    'facebook.com': 'path-1',
    'facebook.com/pages': 'path-2',
    'facebook.com/groups': 'path-2',
    'facebook.com/people': 'path-2',
    'plus.google.com': 'path-1',
    'linkedin.com': 'path-2',
    'viadeo.com/user': 'path-2',
    'ello.co': 'path-1',
    'pinterest.com': 'path-1',
    'over-blog.com': 'subdomain',
    'tumblr.com': 'subdomain',
    'wordpress.com': 'subdomain',
    'vimeo.com/user': 'path-2',
    'dailymotion.com/user': 'path-2',
    'youtube.com/user': 'path-2'
  }, null, '  '),
  HYPHE_FOLLOW_REDIRECTS: [
    'fb.me',
    'l.facebook.com',
    'facebook.com/l.php',
    'www.facebook.com/l.php',
    'goo.gl',
    'feedproxy.google.com',
    't.co',
    'lnkd.in',
    'youtu.be',
    'bit.ly',
    'bitly.com',
    'tinyurl.com',
    'buff.ly',
    'dlvr.it',
    'is.gd',
    'j.mp',
    'owl.li',
    'ow.ly',
    'po.st',
    'wp.me',
    'shar.es',
    'tmblr.co',
    'adec.co',
    'amn.st',
    'bddy.me',
    'crwd.fr',
    'disq.us',
    'ebx.sh',
    'ed.gr',
    'fal.cn',
    'flip.it',
    'frama.link',
    'fw.to',
    'gerd.fm',
    'go.shr.lc',
    'ht.ly',
    'hubs.ly',
    'ift.tt',
    'io.webhelp.com',
    'lc.cx',
    'loom.ly',
    'mon.actu.io',
    'msft.social',
    'mtr.cool',
    'non.li',
    'sco.lt',
    'soc.fm',
    'spr.ly',
    'swll.to',
    'trib.al',
    'twib.in',
    'u.afp.com',
    'urlz.fr',
    'wrld.bg',
    'xfru.it',
    'zpr.io'
  ],
  HYPHE_OPEN_CORS_API: false,
  HYPHE_ADMIN_PASSWORD: '',
  HYPHE_GOOGLE_ANALYTICS_ID: ''
}

function rawToCleanedSettings (rawSettings) {
  let cleanedSettings = {}

  // 1. Deal with "normal" settings (raw === cleaned):
  // 2. Deal with settings with a `clean` method:
  SETTINGS.filter(({ id, custom }) => id && !custom).forEach(({ id, type, clean, customClean }) => {
    if (!id || customClean) return

    if (clean) {
      cleanedSettings[id] = clean(rawSettings[id])
    } else if (type === 'checkbox') {
      cleanedSettings[id] = (!!rawSettings[id] + '')
    } else {
      cleanedSettings[id] = rawSettings[id] + ''
    }
  })

  // 3. Deal with complex settings:
  // - Start pages:
  cleanedSettings.HYPHE_DEFAULT_STARTPAGES_MODE = [
    rawSettings.START_HOMEPAGE && 'homepage',
    rawSettings.START_PREFIXES && 'prefixes',
    rawSettings.START_MOST_CITED && ('pages-' + rawSettings.START_MOST_CITED_COUNT)
  ].filter(identity)

  // - Creation rules:
  try {
    if (rawSettings.HYPHE_CREATION_RULES) {
      cleanedSettings.HYPHE_CREATION_RULES = JSON.parse(rawSettings.HYPHE_CREATION_RULES)
    }
  } catch (e) {
    // Nothing to do here...
  }

  // 4. Serialize every non-scalar data:
  cleanedSettings = mapValues(cleanedSettings, val => {
    return typeof val === 'object' ? JSON.stringify(val) : val
  })

  // 5. Echap double quotes with a backslash
  // TODO: Move that part into the client when possible
  cleanedSettings = mapValues(cleanedSettings, val => {
    return typeof val === 'string' ? val.replace(/"/g, '\\"') : val
  })

  // 6. Remove empty, null and undefined values
  cleanedSettings = omitBy(cleanedSettings, value => value === null || value === undefined || value === '')

  return cleanedSettings
}

class HypheConfigurationStep extends CreateServerFormStep {
  constructor (props) {
    super(props)

    this.state = {
      showAllSettings: false
    }
  }

  getInitialData () {
    return {
      [HYPHE_SETTINGS_RAW_KEY]: { ...INITIAL_RAW_SETTINGS },
      [HYPHE_SETTINGS_KEY]: rawToCleanedSettings({ ...INITIAL_RAW_SETTINGS }),
    }
  }
  isDisabled (data) {
    return SETTINGS.some(({ id, checkError }) => checkError && checkError(data[HYPHE_SETTINGS_RAW_KEY][id]))
  }
  setRawData = (...args) => {
    const rawSettings = args.length === 2 ?
      { ...this.props.data[HYPHE_SETTINGS_RAW_KEY], [args[0]]: args[1] } :
      args[0]

    this.props.setData({
      ...this.props.data,
      [HYPHE_SETTINGS_RAW_KEY]: rawSettings,
      [HYPHE_SETTINGS_KEY]: rawToCleanedSettings(rawSettings)
    })
  }

  renderElement = (setting, i) => {
    // Wait for data to be properly initialized before rendering anything:
    if (!(this.props.data || {})[HYPHE_SETTINGS_RAW_KEY]) return null
    // Hide advanced elements in simplified view:
    if (!setting.important && !this.state.showAllSettings) return null
    // Check for custom renderer:
    if (setting.customRender) return setting.customRender(i, { ...this.props, setRawData: this.setRawData })

    const onChange = value => {
      this.setRawData(setting.id, value)
    }

    return (setting.important || this.state.showAllSettings) ? this.renderInput(
      [HYPHE_SETTINGS_RAW_KEY, setting.id],
      'create-cloud-server.step2.' + setting.id,
      {
        onChange,
        type: setting.type,
        horizontal: setting.inline,
        options: setting.options,
        labelTag: setting.labelTag,
        important: setting.important && this.state.showAllSettings,
        error: setting.checkError && setting.checkError(
          (this.props.data[HYPHE_SETTINGS_RAW_KEY] || {})[setting.id]
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
