/* eslint-disable no-console */
import CSV from 'papaparse'
import FileSaver from 'file-saver'

import { lruToUrl } from './lru'


const translateValue =(value, type, mode) => {   
  mode = mode || 'TEXT'
  let array_separator = ' '
  if (type === 'array of string with pipe') {
    array_separator = '|'
    type = 'array of string'
  }
  if (type == 'string') {
    return value
  } else if (type == 'number') {
    if (mode == 'TEXT') {
      return ''+value
    } else {
      return value
    }

  } else if (type == 'array of string'){
    if (value instanceof Array) {
      if(mode == 'JSON') {
        return value
      } else if(mode == 'MD') {
        return value
          .map((d) => {
            return '* ' + d
          })
          .join('\n')
      } else {
        return value.sort()
          .join(array_separator)
      }
    } 
    return ''
  } else if(type == 'json'){

    if(mode == 'JSON'){
      return value
    } else if(mode == 'MD'){
      return '```sh\n' + JSON.stringify(value) + '\n```'
    } else {
      return JSON.stringify(value)
    }

  }
}

export function fieldParser ( we, tlds) {  
  const parserMap = {
    id: {
      name: 'ID'
      ,type: 'string'
      ,description: 'Unique identifier.'
      ,accessor: 'id'
    },
    name: {
      name: 'NAME'
      ,type: 'string'
      ,description: 'An explicit name for convenience.'
      ,accessor: 'name'
    },
    status: {
      name: 'STATUS'
      ,type: 'string'
      ,description: 'IN / OUT / UNDECIDED / DISCOVERED'
      ,accessor: 'status'
    },
    prefixes: {
      name: 'PREFIXES AS URL'
      ,type: 'array of string'
      ,description: 'List of URLs defining the boundaries of the web entity.'
      ,accessor: 'prefixes'
      ,preprocess: ( d ) =>  {
        if (tlds) {
          return (d || []).map((item) => lruToUrl( item, tlds ))
        }
        return d
      }
    },
    prefixes_lru: {
      name: 'PREFIXES AS LRU'
      ,type: 'array of string'
      ,description: 'List of LRUs (native format) defining the boundaries of the web entity.'
      ,accessor: 'prefixes'
    },
    home_page: {
      name: 'HOME PAGE'
      ,type: 'string'
      ,description: 'A URL used as hyperlink when you click on the web entity, for convenience.'
      ,accessor: 'homepage'
    },
    start_pages: {
      name: 'START PAGES'
      ,type: 'array of string'
      ,description: 'The list of start pages used the last time it was crawled.'
      ,accessor: 'startpages'
    },
    crawled: {
      name: 'CRAWLED'
      ,type: 'string'
      ,description: 'Is it crawled? (true/false)'
      ,accessor: 'crawled'
    }
    ,crawling_status: {
      name: 'CRAWLING STATUS'
      ,type: 'string'
      ,description: 'Harvesting status of this web entity\'s last crawl job.'
      ,accessor: 'crawling_status'
    }
    ,indexing_status: {
      name: 'INDEXING STATUS'
      ,type: 'string'
      ,description: 'Indexing status of this web entity\'s last crawl job.'
      ,accessor: 'indexing_status'
    }
    ,indegree: {
      name: 'INDEGREE'
      ,type: 'number'
      ,description: 'Number of other web entities citing it in the corpus'
      ,accessor: 'indegree'
    }
    ,creation_date_timestamp: {
      name: 'CREATION TIMESTAMP'
      ,type: 'number'
      ,description: 'When it was created, as a Unix timestamp.'
      ,accessor: 'creation_date'
    }
    ,creation_date: {
      name: 'CREATION DATE'
      ,type: 'string'
      ,description: 'When it was created, as a text date.'
      ,accessor: 'creation_date'
      ,preprocess: (d) => {
        return (new Date(+d)).toISOString()
      }
    }
    ,last_modification_date_timestamp: {
      name: 'LAST MODIFICATION TIMESTAMP'
      ,type: 'number'
      ,description: 'Last time its metadata were modified, as a Unix timestamp.'
      ,accessor: 'last_modification_date'
    }
    ,last_modification_date: {
      name: 'LAST MODIFICATION DATE'
      ,type: 'string'
      ,description: 'Last time its metadata were modified, as a text date.'
      ,accessor: 'last_modification_date'
      ,preprocess: ( d ) =>  {
        return (new Date(+d)).toISOString()
      }
    }
    ,user_tags: {
      name: 'TAGS'
      ,type: 'json'
      ,description: 'Tags manually added by users.'
      ,accessor: 'tags'
      ,preprocess: ( d ) =>  {
        return d.USER
      }
    }
    ,core_tags: {
      name: 'TECHNICAL INFO'
      ,type: 'json'
      ,description: 'Tags added by Hyphe for various technical reasons. Can be used as a log.'
      ,accessor: 'tags'
      ,preprocess: ( d ) =>  {
        return d.CORE
      }
    }
  }
  let result = {}
  Object.keys(parserMap).forEach(( f ) =>{
    const field = parserMap[f]
    if (field === undefined) {
      console.error('[Export error] Unexpected field id: '+f)
      return
    }
    let value = we[field.accessor]
    if (field.preprocess) {
      value = field.preprocess(value)
    }
    if (value) {
      result[field.name] = translateValue(value, field.type, 'JSON')
    } else {
      result[field.name] = ''
    }
  })
  return result
}

export function downloadCSV ( list, listName, webentityName, corpusId ) {
  const csvString = CSV.unparse(list)

  const file = new File(
    [csvString],
    `${corpusId}_${webentityName}_${listName}.csv`,
    {type: 'text/csv;charset=utf-8'}
  )
  
  FileSaver.saveAs(file)
}
