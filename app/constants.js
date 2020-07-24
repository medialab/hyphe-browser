export const WEBVIEW_UA = 'Mozilla/5.0 (X11; Linux ax86_64) AppleWebKit/537.36 (KHTML, like Gecko) hyphe-browser/1.0.0 Chrome/52.0.2743.82 Safari/537.36'
export const CORPUS_STATUS_WATCHER_INTERVAL = (process.env.NODE_ENV === 'development') ? 30000 : 2000

export const LOCALES = ['en-US', 'fr-FR']
export const DEFAULT_LOCALE = 'fr-FR'

export const CRAWL_DEPTH = 1

// flag to add/remove verbosity in console
export const DEBUG_JSONRPC = (process.env.NODE_ENV === 'development')
export const DEBUG_WEBVIEW = (process.env.NODE_ENV === 'development')

// Notification ids
export const ERROR_JSONRPC_FETCH = 'ERROR_JSONRPC_FETCH'
export const ERROR_JSONRPC_PARSE = 'ERROR_JSONRPC_PARSE'
export const ERROR_CORPUS_NOT_STARTED = 'ERROR_CORPUS_NOT_STARTED'
export const ERROR_SERVER_NO_RESOURCE = 'ERROR_SERVER_NO_RESOURCE'
export const ERROR_SET_WEBENTITY_STATUS = 'ERROR_SET_WEBENTITY_STATUS'
export const NOTICE_WEBENTITY_CREATED = 'NOTICE_WEBENTITY_CREATED'
export const NOTICE_WEBENTITY_CRAWL_STARTED = 'NOTICE_WEBENTITY_CRAWL_STARTED'
export const NOTICE_WEBENTITY_CRAWL_CANCELED = 'NOTICE_WEBENTITY_CRAWL_CANCELED'
export const NOTICE_WEBENTITY_MERGE_SUCCESSFUL = 'NOTICE_WEBENTITY_MERGE_SUCCESSFUL'
export const NOTICE_WEBENTITY_MERGE_FAILURE = 'NOTICE_WEBENTITY_MERGE_FAILURE'
export const NOTICE_WEBENTITY_ADJUST_FAILURE = 'NOTICE_WEBENTITY_ADJUST_FAILURE'
export const NOTICE_WEBENTITY_INFO_TIMEOUT = 3500

// Server statuses
export const SERVER_STATUS_PROCESSING = 'PROCESSING'
export const SERVER_STATUS_UNKNOWN = 'UNKNOWN'
export const SERVER_STATUS_SHUTOFF = 'SHUTOFF'
export const SERVER_STATUS_ACTIVE = 'ACTIVE'

// Keyboard shortcuts
export const SHORTCUT_OPEN_TAB = ['CmdOrCtrl+N', 'CmdOrCtrl+T']
export const SHORTCUT_CLOSE_TAB = ['CmdOrCtrl+W']
export const SHORTCUT_NEXT_TAB = ['Ctrl+Tab', 'Ctrl+PageDown', 'Cmd+PageDown']
export const SHORTCUT_PREV_TAB = ['Ctrl+Shift+Tab', 'CmdOrCtrl+PageUp']
export const SHORTCUT_RELOAD_TAB = ['CmdOrCtrl+R', 'F5']
export const SHORTCUT_FULL_RELOAD_TAB = ['Ctrl+Shift+R', 'Ctrl+F5', 'Shift+F5', 'Cmd+Shift+R', 'Cmd+F5']

export const PAGE_HYPHE_HOME = 'hyphe://home'
export const HYPHE_TAB_ID = '$$_HYPHE_SPECIAL_TAB_$$'

export const STACKS_LIST = [
  {
    name: 'DISCOVERED',
    method: 'store.wordsearch_webentities',
    args: [[], [['status', 'DISCOVERED']], ['-indegree', 'name'], 200, 0, false, false],
    condition: 'DISCOVERED'
  },
  {
    name: 'IN',
    method: 'store.get_webentities_by_status',
    args: ['IN', 'name', -1, 0, false, false],
    condition: 'IN'
  },
  {
    name: 'IN_UNTAGGED',
    method: 'store.get_webentities_mistagged',
    args: ['IN', true, false, 'name', -1, 0, false, false],
    condition: 'IN'
  },
  {
    name: 'IN_UNCRAWLED',
    method: 'store.get_webentities_uncrawled',
    args: ['name', -1, 0, false, false],
    condition: 'IN'
  },
  {
    name: 'UNDECIDED',
    method: 'store.get_webentities_by_status',
    args: ['UNDECIDED', 'name', -1, 0, false, false],
    condition: 'UNDECIDED'
  },
  {
    name: 'OUT',
    method: 'store.get_webentities_by_status',
    args: ['OUT', 'name', -1, 0, false, false],
    condition: 'OUT'
  }
]
export const USED_STACKS = [
  {
    id: 'IN',
    label: 'IN',
    value: 'in'
  },
  {
    id: 'DISCOVERED',
    label: 'PROSPECTS.',
    value: 'prospection'
  },
  {
    id: 'UNDECIDED',
    label: 'UND.',
    value: 'undecided'
  },
  {
    id: 'OUT',
    label: 'OUT',
    value: 'out'
  }
]
// search engines
export const SEARCH_ENGINES = [
  {
    value: 'google',
    label: 'Google'
  },
  {
    value: 'duckduckgo',
    label: 'DuckDuckGo'
  },
  {
    value: 'qwant',
    label: 'Qwant'
  },
  {
    value: 'lilo',
    label: 'lilo'
  },
]


// tags categories are contained in namespaces, this is the default one
export const TAGS_NS = 'USER'
