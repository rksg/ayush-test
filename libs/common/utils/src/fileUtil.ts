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