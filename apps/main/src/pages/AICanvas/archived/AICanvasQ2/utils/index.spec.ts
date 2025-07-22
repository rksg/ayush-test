import { collision, layoutCheck }                                        from './collision'
import { compactLayout }                                                 from './compact'
import { calColCount, calColWidth, calGridXY, setPropertyValueForCards } from './utils'

const a = {
  gridx: 0,
  gridy: 4,
  width: 1,
  height: 4
}
const b = {
  gridx: 0,
  gridy: 0,
  width: 1,
  height: 4
}
describe('Canvas Utils', () => {
  it('should execute collision correctly', () => {
    expect(collision(a, b)).toBe(false)
  })
  it('should execute layoutCheck correctly', () => {
    const a = {
      id: 'a',
      gridx: 0,
      gridy: 4,
      width: 1,
      height: 4
    }
    const b = {
      id: 'b',
      gridx: 0,
      gridy: 0,
      width: 1,
      height: 4
    }
    const shadowCardTmp = {
      ...b,
      gridx: 0,
      gridy: 2,
      isShadow: true
    }
    expect(layoutCheck(
      [a, b],
      shadowCardTmp,
      shadowCardTmp.id,
      shadowCardTmp.id,
      'horizontal'
    )).toEqual([{
      gridx: 1, gridy: 4, height: 4, id: 'a', width: 1 },
    { gridx: 0, gridy: 2, height: 4, id: 'b', isShadow: true, width: 1 }]
    )
  })
  it('should execute setPropertyValueForCards correctly', () => {
    const a = [{
      cards: [{
        gridx: 0,
        gridy: 4,
        width: 1,
        height: 4 }]
    }]
    setPropertyValueForCards(a, 'gridx', 1)
    expect(a[0].cards[0]).toEqual({
      gridx: 1,
      gridy: 4,
      width: 1,
      height: 4
    })
  })
  it('should execute calColWidth correctly', () => {
    expect(calColWidth(500, 4, [10, 10], 0)).toEqual(120)
  })
  it('should execute calColCount correctly', () => {
    expect(calColCount()).toEqual(4)
  })
  it('should execute calGridXY correctly', () => {
    expect(calGridXY(20, -30, 120, [0, 0], 500, 4, 100)).toEqual({
      gridX: 0,
      gridY: 0
    })
  })
  it('should execute calGridXY with margin correctly', () => {
    expect(calGridXY(260, 200, 100, [5, 5], 500, 4, 100)).toEqual({
      gridX: 0,
      gridY: 1
    })
  })
  it('should execute compactLayout correctly', () => {
    expect(compactLayout([a,b])).toEqual([b,a])
  })
})