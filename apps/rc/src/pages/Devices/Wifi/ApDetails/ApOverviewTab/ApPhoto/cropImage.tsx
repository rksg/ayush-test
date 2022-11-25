export const createImage = (url: string) =>
  new Promise((resolve) => {
    let xhr = new XMLHttpRequest()
    xhr.onload = function () {
      let url = URL.createObjectURL(this.response)
      let img = new Image()
      img.onload = function () {
        resolve(img)
        URL.revokeObjectURL(url)
      }
      img.src = url
    }
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'
    xhr.send()
  })

export default async function getCroppedImg (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  flip = { horizontal: false, vertical: false }
) {
  const image = await createImage(imageSrc) as HTMLImageElement
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  // set canvas size to match the bounding box
  canvas.width = image.width
  canvas.height = image.height

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(image.width / 2, image.height / 2)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  // draw rotated image
  ctx.drawImage(image, 0, 0)

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  )

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0)

  // As Base64 string
  // return canvas.toDataURL('image/jpeg');

  // As a blob
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.toBlob((file: any) => {
      resolve(URL.createObjectURL(file))
    }, 'image/jpeg')
  })
}
