import _ from 'lodash'
/**
 * Sets a specified property for all cards within a given set of groups.
 * @param {Array} groups
 * @param {String} property
 * @param {*} value
 */
export const setPropertyValueForCards = (groups, property, value) => {
  _.forEach(groups, (g) => {
    _.forEach(g.cards, (a) => {
      a[property] = value
    })
  })
}

/**
 * Calculate the width of each column.
 * @param {Number} containerWidth
 * @param {Number} col
 * @param {NumberArray} containerPadding
 * @param {NumberArray} margin
 * @returns {Number} column width
 */
export const calColWidth = (containerWidth, col, containerPadding, margin) => {
  // return 380;
  if (margin) {
    return (
      (containerWidth - containerPadding[0] * 2 - margin[0] * (col + 1)) / col
    )
  }
  return (containerWidth - containerPadding[0] * 2) / col
}

/**
 * Calculate the number of columns that can fit in a container.
 * @param {Number} defaultCalWidth
 * @param {Number} containerWidth
 * @param {NumberArray} containerPadding
 * @param {NumberArray} margin
 * @returns {Number} column number
 */
export const calColCount = (
  // defaultCalWidth,
  // containerWidth,
  // containerPadding,
  // margin
) => {
  return 4 // for the canvas requirement
  // return Math.floor(
  //   (containerWidth - containerPadding[0] * 2 - (margin? margin[0] : 0)) /
  //     (defaultCalWidth + margin[0])
  // )
}

/**
 * Calculate the bottom-most y-coordinate
 * @param {Array} layout
 * @returns {Number} the bottom-most y-coordinate
 */
export const layoutBottom = (layout) => {
  let max = 0
  let bottomY
  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].gridy + layout[i].height
    if (bottomY > max) max = bottomY
  }
  return max
}

/**
 * Calculates the maximum height of a container based on the layout of its cards.
 * @param {Array} cards
 * @param {Number} rowHeight
 * @param {NumberArray} margin
 * @returns {Number} the maximum height of a container
 */
export const getContainerMaxHeight = (cards, rowHeight, margin) => {
  const resultRow = layoutBottom(cards)
  return resultRow * rowHeight + (resultRow - 1) * margin[1] + 2 * margin[1]
}

/**
 * Calculates the pixel position of a grid item based on its grid coordinates, in pixels.
 * @param {Number} gridx
 * @param {Number} gridy
 * @param {NumberArray} margin
 * @param {Number} rowHeight
 * @param {Number} calWidth
 * @returns {{x: number, y: number}} containing x,y coordinates
 */
export const calGridItemPosition = (
  gridx,
  gridy,
  margin,
  rowHeight,
  calWidth
) => {
  const x = Math.round(gridx * calWidth + margin[0] * (gridx + 1))
  const y = Math.round(gridy * rowHeight + margin[1] * (gridy + 1))
  return {
    x: x,
    y: y
  }
}
/**
 * Prevent elements from overflowing the container
 * @param {Int} gridX
 * @param {Int} gridY
 * @param {Int} col
 * @param {Int} w card width
 * @returns {Object} card gridX, gridY coordinate object
 */
export const checkInContainer = (gridX, gridY, col, w) => {
  if (gridX + w > col - 1) gridX = col - w // right boundary
  if (gridX < 0) gridX = 0 // left boundary
  if (gridY < 0) gridY = 0 // upper boundary
  return { gridX, gridY }
}
/**
 * Calculate the card coordinates based on the coordinates x and y pixel values
 * @param {Number} x
 * @param {Number} y
 * @param {Number} cardWidth
 * @param {NumberArray} margin
 * @param {Number} containerWidth
 * @param {Number} col
 * @param {Number} rowHeight
 * @returns {{gridX, gridY}} card gridX, gridY coordinate object
 */
export const calGridXY = (
  x,
  y,
  cardWidth,
  margin,
  containerWidth,
  col,
  rowHeight
) => {
  // When the coordinates are converted into a grid, they are rounded down and there is no need to calculate margin.
  const gridX = Math.floor((x / containerWidth) * col)
  const gridY = Math.floor(y / (rowHeight + (margin ? margin[1] : 0)))
  // Prevent card from overflowing the container
  return checkInContainer(gridX, gridY, col, cardWidth)
}

/**
 * Width and height are calculated as px
 * @param {Number} w
 * @param {Number} h
 * @param {NumberArray} margin
 * @param {Number} rowHeight
 * @param {Number} cardWidth
 * @returns {{wPx: number, hPx: number}} containing wPx, hPx
 */
export const calWHtoPx = (w, h, margin, rowHeight, calWidth) => {
  const wPx = Math.round(w * calWidth + (w - 1) * margin[0])
  const hPx = Math.round(h * rowHeight + (h - 1) * margin[1])
  return { wPx, hPx }
}

