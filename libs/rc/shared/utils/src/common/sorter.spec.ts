import {
  defaultSort,
  sortProp
} from './sorter'

describe('defaultSort', () => {
  const a = 2
  const b = 111

  it('should sort smaller number', () => {
    const smaller = defaultSort(a, b)
    expect(smaller).toBe(-1)
  })

  it('should sort greater number', () => {
    const greater = defaultSort(b, a)
    expect(greater).toBe(1)
  })

  it('should sort 0 number', () => {
    const zero = defaultSort(0, 0)
    expect(zero).toBe(0)
  })

  it('should sort smaller undefined with number', () => {
    const smaller = defaultSort(undefined, a)
    expect(smaller).toBe(-1)
  })

  const textA = 'a'
  const textB = 'b'

  it('should sort smaller string', () => {
    const smaller = defaultSort(textA, textB)
    expect(smaller).toBe(-1)
  })

  it('should sort greater string', () => {
    const greater = defaultSort(textB, textA)
    expect(greater).toBe(1)
  })

  it('should sort by first charachter', () => {
    const greater = defaultSort(textB, 'after')
    expect(greater).toBe(1)
  })

  it('should sort by second charachter when having same first', () => {
    const greater = defaultSort('after', 'above')
    expect(greater).toBe(1)
  })

  it('should sort 0 string', () => {
    const zero = defaultSort(textA, textA)
    expect(zero).toBe(0)
  })

  it('should sort 0 case insensitive string', () => {
    const zero = defaultSort(textA, textA.toUpperCase())
    expect(zero).toBe(0)
  })

  it('should sort smaller undefined with string', () => {
    const smaller = defaultSort(undefined, textA)
    expect(smaller).toBe(-1)
  })

  it('should sort smaller space string with string', () => {
    const smaller = defaultSort(' ', textA)
    expect(smaller).toBe(-1)
  })

  it('should sort 0 undefined', () => {
    const zero = defaultSort(undefined, undefined)
    expect(zero).toBe(0)
  })

  it('should sort equal between undefined and null', () => {
    const equal = defaultSort(undefined, null)
    expect(equal).toBe(0)
  })

  it('should sort equal between empty string and string', () => {
    const smaller = defaultSort('', undefined)
    expect(smaller).toBe(0)
  })
})

describe('sortProp', () => {
  it('should return a function that will sort based on prop', () => {
    const sorter = sortProp('test', defaultSort)
    const a = { test: 'a' }
    const b = { test: 'b' }
    expect(sorter(b, a)).toEqual(1)
  })
})