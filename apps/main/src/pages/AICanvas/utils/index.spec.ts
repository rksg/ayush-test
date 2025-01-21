import { collision, layoutCheck }                from './collision'
import { calColWidth, setPropertyValueForCards } from './utils'

describe('Canvas Utils', () => {
  it('should execute collision correctly', () => {
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
})