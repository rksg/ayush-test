import { getFirstCollison } from './collision'
import { layoutBottom }     from './utils'
/**
 * The layout items are sorted according to gridx from small to large and gridy from small to large.
 * @param {Array} layout array of layouts
 * @returns {Array} New sorted layout
 */
const sortLayout = (layout) => {
  return [].concat(layout).sort((a, b) => {
    if (a.gridy > b.gridy || (a.gridy === b.gridy && a.gridx > b.gridx)) {
      return 1
    } else if (a.gridy === b.gridy && a.gridx === b.gridx) {
      return 0
    }
    return -1
  })
}
/**
 * Compress individual elements so that each element is next to a border or adjacent element
 * @param {Array} finishedLayout The compressed elements will be put here to compare whether each subsequent element needs to be compressed.
 * @param {Object} item
 * @returns {Object} item returns the new coordinate position of the item
 */
const compactItem = (finishedLayout, item) => {
  const newItem = { ...item }
  if (finishedLayout.length === 0) {
    return { ...newItem, gridy: 0 }
  }

  while (true) {
    const FirstCollison = getFirstCollison(finishedLayout, newItem)
    if (FirstCollison) {
      newItem.gridy = FirstCollison.gridy + FirstCollison.height
      return newItem
    }
    newItem.gridy--
    if (newItem.gridy < 0) return { ...newItem, gridy: 0 } // When the boundary is reached, gridy is set to 0
  }
}
/**
 * Compress vertically so that each element is next to the border or adjacent element
 * @param {Array} layout
 * @param {Object} movingItem
 * @returns {Array} layout latest layout layout
 */
export const compactLayout = function (layout) {
  const sorted = sortLayout(layout)
  const compareList = []
  const needCompact = Array(layout.length)

  for (let i = 0, length = sorted.length; i < length; i++) {
    const finished = compactItem(compareList, sorted[i])
    compareList.push(finished)
    needCompact[i] = finished
  }
  return needCompact
}
/**
 * Get free card placement area
 * @param {Array} finishedLayout
 * @param {Object} item
 * @param {Int} cols
 * @returns {Object} card placement
 */
const getSpaceArea = (finishedLayout, item, cols) => {
  const newItem = { ...item }
  if (finishedLayout.length === 0) {
    return newItem
  }

  const FirstCollison = getFirstCollison(finishedLayout, newItem)
  if (FirstCollison) {
    newItem.gridx++
    if (newItem.gridx + item.width > cols) {
      newItem.gridx = 0
      newItem.gridy++
    }
    return getSpaceArea(finishedLayout, newItem, cols)
  } else {
    return newItem
  }
}

/**
 * horizontal compact layout
 * First sort the cards according to x and y,
 * Place a card and start from 0, 0 to detect whether it collides or exceeds the boundary. If it collides, then grid=0, y+1, and detects whether it collides again.
 * Optimization: If the coordinates of the moving card should always be within an area, it should not be dragged anywhere.
 * @param {Array} layout
 * @param {Int} cols
 * @param {Object?} movingCardID
 * @returns {Array} latest layout
 */
export const compactLayoutHorizontal = function (layout, cols, movingCardID) {
  const sorted = sortLayout(layout)
  const compareList = []
  const needCompact = Array(layout.length)
  const arr = []
  let moveCard
  // Perform coordinate reset, except for moving cards
  for (let i = 0; i < sorted.length; i++) {
    if (movingCardID === sorted[i].id) {
      moveCard = sorted[i]
      continue
    }
    arr.push(sorted[i])
  }
  // Obtain the maximum y value in the current group and assign it to the mobile card to prevent the group Y value from becoming infinitely large
  if (moveCard) {
    moveCard.gridy = Math.min(layoutBottom(arr), moveCard.gridy)
  }
  // Reset the coordinates of non-moving cards
  for (let i = 0; i < sorted.length; i++) {
    if (movingCardID !== sorted[i].id) {
      sorted[i].gridy = 0
      sorted[i].gridx = 0
    }
  }
  // Replace, except moving cards
  for (let i = 0, length = sorted.length; i < length; i++) {
    const finished = getSpaceArea(compareList, sorted[i], cols)
    compareList.push(finished)
    needCompact[i] = finished
  }
  return needCompact
}

