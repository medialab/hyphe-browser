export const WEBVIEW_UA = 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko'
export const CORPUS_STATUS_WATCHER_INTERVAL = (process.env.NODE_ENV === 'development') ? 30000 : 1000

export const LOCALES = ['en-US', 'fr-FR']
export const DEFAULT_LOCALE = 'fr-FR'

export const CRAWL_DEPTH = 1

// flag to add/remove verbosity in console
export const DEBUG_JSONRPC = true
export const DEBUG_WEBVIEW = false

export const ERROR_JSONRPC_FETCH = 'ERROR_JSONRPC_FETCH'
export const ERROR_JSONRPC_PARSE = 'ERROR_JSONRPC_PARSE'

export const ERROR_CORPUS_NOT_STARTED = 'ERROR_CORPUS_NOT_STARTED'
export const ERROR_SERVER_NO_RESOURCE = 'ERROR_SERVER_NO_RESOURCE'
export const ERROR_SET_WEBENTITY_STATUS = 'ERROR_SET_WEBENTITY_STATUS'

export const SHORTCUT_OPEN_TAB = ['ctrl+n', 'ctrl+t']
export const SHORTCUT_CLOSE_TAB = 'ctrl+w'

export const PAGE_HYPHE_HOME = 'hyphe://home'
