export const downloadFile = (response: { blob: () => Promise<BlobPart> }, fileName: string) => {
  response.blob().then(myBlob => {
    const file = new File([myBlob], fileName)

    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
  })
}
