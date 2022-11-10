const path = require('path')

module.exports = {
  process(src, filePath) {
    const extArray = ['.png', '.jpg', '.jpeg', '.webp']
    const fileExtension = path.extname(filePath)
    if (!extArray.includes(fileExtension.toLowerCase()) ) {
        return src
    }

    const name = `${path.basename(filePath, fileExtension)}`
      .split(/\W+/)
      .map((x) => `${x.charAt(0).toUpperCase()}${x.slice(1)}`)
      .join('')

    return `module.exports = { __esModule: true, default: '${name}'}`
  }
}