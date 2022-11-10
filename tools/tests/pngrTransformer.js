const path = require('path')

module.exports = {
  process(src, filePath) {
    if (path.extname(filePath) !== '.png') {
        return src
    }

    const name = `${path.basename(filePath, '.png')}`
      .split(/\W+/)
      .map((x) => `${x.charAt(0).toUpperCase()}${x.slice(1)}`)
      .join('')

    return `module.exports = { __esModule: true, default: '${name}'}`
  }
}