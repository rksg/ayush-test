import { checkHasRegenerated } from './steps.utils'


describe('checkHasRegenerated', () => {
  it('should return true if originalData[0] is empty', () => {
    const originalData = [{}]
    const newData = [{ id: '123' }]
    expect(checkHasRegenerated(originalData, newData)).toBe(true)
  })

  it('should return true if newData[0].id is not in originalData', () => {
    const originalData = [{ id: '456' }, { id: '789' }]
    const newData = [{ id: '123' }]
    expect(checkHasRegenerated(originalData, newData)).toBe(true)
  })

  it('should return false if newData[0].id exists in originalData', () => {
    const originalData = [{ id: '123' }, { id: '456' }]
    const newData = [{ id: '123' }]
    expect(checkHasRegenerated(originalData, newData)).toBe(false)
  })

  it('should return true if originalData is empty', () => {
    const originalData: never[] = []
    const newData = [{ id: '123' }]
    expect(checkHasRegenerated(originalData, newData)).toBe(true)
  })

  it('should return true if newData is empty', () => {
    const originalData = [{ id: '456' }]
    const newData: never[] = []
    expect(checkHasRegenerated(originalData, newData)).toBe(true)
  })

  it('should return true if both originalData and newData are empty', () => {
    const originalData: never[] = []
    const newData: never[] = []
    expect(checkHasRegenerated(originalData, newData)).toBe(true)
  })

  it('should handle missing id in newData[0]', () => {
    const originalData = [{ id: '123' }]
    const newData = [{}]
    expect(checkHasRegenerated(originalData, newData)).toBe(true)
  })
})
