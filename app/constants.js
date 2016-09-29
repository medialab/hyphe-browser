export const WEBVIEW_UA = 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko'
export const CORPUS_STATUS_WATCHER_INTERVAL = (process.env.NODE_ENV === 'development') ? 120000 : 2000

export const LOCALES = ['en-US', 'fr-FR']
export const DEFAULT_LOCALE = 'fr-FR'

export const CRAWL_DEPTH = 1

// flag to add/remove verbosity in console
export const DEBUG_JSONRPC = !!process.env.DEBUG_JSONRPC
export const DEBUG_WEBVIEW = !!process.env.DEBUG_WEBVIEW

// Notification ids
export const ERROR_JSONRPC_FETCH = 'ERROR_JSONRPC_FETCH'
export const ERROR_JSONRPC_PARSE = 'ERROR_JSONRPC_PARSE'
export const ERROR_CORPUS_NOT_STARTED = 'ERROR_CORPUS_NOT_STARTED'
export const ERROR_SERVER_NO_RESOURCE = 'ERROR_SERVER_NO_RESOURCE'
export const ERROR_SET_WEBENTITY_STATUS = 'ERROR_SET_WEBENTITY_STATUS'
export const NOTICE_WEBENTITY_CREATED = 'NOTICE_WEBENTITY_CREATED'
export const NOTICE_WEBENTITY_CREATED_TIMEOUT = 5000

// Keyboard shortcuts
export const SHORTCUT_OPEN_TAB = ['Ctrl+N', 'Ctrl+T', 'Cmd+N', 'Cmd+T']
export const SHORTCUT_CLOSE_TAB = ['Ctrl+W', 'Ctrl+F4', 'Cmd+W', 'Cmd+F4']
export const SHORTCUT_NEXT_TAB = ['Ctrl+Tab', 'Ctrl+PageDown', 'Cmd+Tab', 'Cmd+PageDown']
export const SHORTCUT_PREV_TAB = ['Ctrl+Shift+Tab', 'Ctrl+PageUp', 'Cmd+Shift+Tab', 'Cmd+PageUp']
export const SHORTCUT_RELOAD_TAB = ['Ctrl+R', 'Cmd+R', 'F5']
export const SHORTCUT_FULL_RELOAD_TAB = ['Ctrl+Shift+R', 'Ctrl+F5', 'Shift+F5', 'Cmd+Shift+R', 'Cmd+F5']

export const PAGE_HYPHE_HOME = 'hyphe://home'
export const HYPHE_TAB_ID = '$$_HYPHE_SPECIAL_TAB_$$'

// tags categories are contained in namespaces, this is the default one
export const TAGS_NS = 'USER'
