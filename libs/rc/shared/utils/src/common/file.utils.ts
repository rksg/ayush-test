export const downloadFile = (response: { blob: () => Promise<BlobPart> }, fileName: string) => {
  response.blob().then(myBlob => {
    const fileFlob = new File([myBlob], fileName)
    handleBlobDownloadFile(fileFlob, fileName)
  })
}

export const handleBlobDownloadFile = (fileFlob: Blob, fileName:string) => {
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(fileFlob)
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
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
    const link = document.createElement('a')
    if (link.download !== undefined) {
    // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

  }
