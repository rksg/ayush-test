const path = require('path')

module.exports = {
  process(src, filePath) {
    if (path.extname(filePath) !== '.svg') {
      return src
    }

    const name = `${path.basename(filePath, '.svg')}`
      .split(/\W+/)
      .map((x) => `${x.charAt(0).toUpperCase()}${x.slice(1)}`)
      .join('')

    return `
const React = require('react')
const ReactComponent = React.forwardRef((props, ref) => {
  return React.createElement(
    'svg',
    Object.assign({ ref }, props, {'data-name': ${name}})
  )
})
module.exports = {
  __esModule: true,
  default: '${name}',
  ReactComponent
}
`
  },
}
