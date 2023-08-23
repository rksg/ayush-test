import { handleBlobDownloadFile } from '@acx-ui/utils'

export const downloadFile = (response: { blob: () => Promise<BlobPart> }, fileName: string) => {
  response.blob().then(myBlob => {
    const fileBlob = new File([myBlob], fileName)
    handleBlobDownloadFile(fileBlob, fileName)
  })
}

export const exportCSV =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (filename: string, input: any, headerNameMapping?: Map<string, string>) => {
    if (!input) {
      return
    }

    // Prepare CSV conent
    const separator = ','
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let keys: any = Object.keys(input)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const csvConent = keys.map((key: any) => {
      let cell = input[key] === null || input[key] === undefined ? '' : input[key]
      if (typeof cell === 'string' && cell.search(/("|,|\n)/g) >= 0) {
        cell = `"${cell}"`
      }
      return cell
    }).join(separator)

    // Map header name if needed
    if (headerNameMapping) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      keys = keys.map((key: any) => {
        if (headerNameMapping.has(key)) {
          return headerNameMapping.get(key)
        }
        return key
      })
    }
    const csvHeader = keys.join(separator) + '\n'
    const csvData = csvHeader + csvConent

    // Download CSV file
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    handleBlobDownloadFile(blob, filename)
  }
