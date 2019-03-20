import CSV from 'papaparse'
import FileSaver from 'file-saver'

export default function downloadCSV ( list, listName, webentityName, corpusId ) {
  const csvString = CSV.unparse(list)

  const file = new File(
    [csvString],
    `${corpusId}_${webentityName}_${listName}.csv`,
    {type: 'text/csv;charset=utf-8'}
  )
  
  FileSaver.saveAs(file)
}
