/**
 * Collision detection
 * @param {Object} a
 * @param {Object} b
 * @returns {Boolean} Whether to collide
 */
export const collision = (a, b) => {
  if (
    a.gridx === b.gridx &&
    a.gridy === b.gridy &&
    a.width === b.width &&
    a.height === b.height
  ) {
    return true
  }
  if (a.gridx + a.width <= b.gridx) return false // a is to the left of b
  if (a.gridx >= b.gridx + b.width) return false // a is to the right of b
  if (a.gridy + a.height <= b.gridy) return false // a is above b
  if (a.gridy >= b.gridy + b.height) return false // a is below b
  return true
}
/**
 * Get the first object that item collides with in layout
 * @param {Array} layout
 * @param {Object} item
 * @returns {Object||null} The collided item or null
 */
export const getFirstCollison = (layout, item) => {
  for (let i = 0, length = layout.length; i < length; i++) {
    if (collision(layout[i], item)) {
      return layout[i]
    }
  }
  return null
}
/**
 * Layout detection, recursively detect whether the moved item collides with other items, and if the Y coordinate moves down/X coordinate moves right
 * @param {Array} layout
 * @param {Object} layoutItem
 * @param {String} cardID
 * @param {String} fristItemID
 * @param {String} compactType ('vertical' | 'horizontal') = 'horizontal'
 * @returns {Object||null} The collided item or null
 */
export const layoutCheck = (function () {
  const _layoutCheck = function (
    layout,
    layoutItem,
    cardID,
    fristItemID,
    compactType = 'vertical'
  ) {
    const keyArr = []
    const movedItem = []
    const axis = compactType === 'vertical' ? 'gridy' : 'gridx'

    let newlayout = layout.map((item) => {
      if (item.id !== cardID) {
        if (collision(item, layoutItem)) {
          // Collision detection, whether there is a position collision between a block and the current card
          keyArr.push(item.id)
          let offsetXY = item[axis] + 1
          // Move crad inside loop detection block
          const widthOrHeight = axis === 'gridx' ? item.width : item.height
          // Determine whether the coordinates of the current card and the target card plus width/height overlap to prevent overlap.
          // In the vertical case, the judgment is similar to dragging a square with width 1 and height 1 at (0,1) and a vertical rectangle with width 1 and height 2 at (0,0).
          //   At this time, the overlap will keep the vertical rectangle unchanged.
          // In the horizontal case, the judgment is similar to dragging a square with a width of 1 and a height of 1 and a horizontal rectangle of (0,0) with a width of 2 and a height of 1.
          //   At this time, the overlap will keep the horizontal rectangle unchanged.
          if (
            layoutItem[axis] > item[axis] &&
            layoutItem[axis] < item[axis] + widthOrHeight
          ) {
            offsetXY = item[axis]
          }
          const newItem = { ...item }
          newItem[axis] = offsetXY
          movedItem.push(newItem)
          return newItem
        }
      } else if (fristItemID === cardID) {
        return { ...item, ...layoutItem }
      }
      return item
    })
    // Loop through all moved cards, and all related cards affected by collision detection are offset in abscissa/ordinate
    for (let c = 0, length = movedItem.length; c < length; c++) {
      newlayout = _layoutCheck(
        newlayout,
        movedItem[c],
        keyArr[c],
        fristItemID,
        compactType
      )
    }

    return newlayout
  }
  return _layoutCheck
})()
