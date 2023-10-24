import { noDataDisplay } from '@acx-ui/utils'

import {
  defaultSort,
  dateSort,
  clientImpactSort,
  severitySort,
  sortProp
} from './sorters'

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
    const zero = defaultSort(a, a)
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

  it('should sort 0 undefined', () => {
    const zero = defaultSort(undefined, undefined)
    expect(zero).toBe(0)
  })
})

describe('dateSort', () => {
  const startTime = '2021-07-15T00:00:00+08:00'
  const endTime = '2022-08-16T00:00:00+08:00'

  it('should sort smaller date time', () => {
    const smaller = dateSort(startTime, endTime)
    expect(smaller).toBe(-1)
  })

  it('should sort greater date time', () => {
    const greater = dateSort(endTime, startTime)
    expect(greater).toBe(1)
  })

  it('should sort 0 date time', () => {
    const zero = dateSort(startTime, startTime)
    expect(zero).toBe(0)
  })

  it('should sort smaller undefined', () => {
    const smaller = dateSort(undefined, startTime)
    expect(smaller).toBe(-1)
  })

  it('should sort 0 undefined', () => {
    const zero = dateSort(undefined, undefined)
    expect(zero).toBe(0)
  })
})

describe('clientImpactSort', () => {
  const a = 1
  const b = 2

  it('should return negative on a < b', () => {
    expect(clientImpactSort(a, b)).toBe(-1)
  })

  it('should return positive on a > b', () => {
    expect(clientImpactSort(b, a)).toBe(1)
  })

  it('should return negative when a has noDataDisplay', () => {
    const noDataA = clientImpactSort(noDataDisplay, b)
    expect(noDataA).toBe(-1)
  })

  it('should return positive when b has noDataDisplay', () => {
    const noDataB = clientImpactSort(a, noDataDisplay)
    expect(noDataB).toBe(1)
  })

  it('should return 0 when noDataDisplay on both', () => {
    const noData = clientImpactSort(noDataDisplay, noDataDisplay)
    expect(noData).toBe(0)
  })

  it('should return 0 on undefined inputs', () => {
    const noDefined = clientImpactSort(undefined, undefined)
    expect(noDefined).toBe(0)
  })
})

describe('severitySort', () => {
  const a = 1
  const b = 2

  it('should return negative on a < b', () => {
    const reverseSmaller = severitySort(a, b)
    expect(reverseSmaller).toBe(-1)
  })

  it('should return positive a > b', () => {
    const reverseGreater = severitySort(b, a)
    expect(reverseGreater).toBe(1)
  })

  it('should return 0 with noDataDisplay on a', () => {
    const noDataA = severitySort(noDataDisplay, b)
    expect(noDataA).toBe(0)
  })

  it('should return 0 with noDataDisplay on b', () => {
    const noDataB = severitySort(a, noDataDisplay)
    expect(noDataB).toBe(0)
  })

  it('should return 0 on noDataDisplay on both', () => {
    const noDataBoth = severitySort(noDataDisplay, noDataDisplay)
    expect(noDataBoth).toBe(0)
  })

  it('should return 0 on undefined on a', () => {
    const noDefinedA = severitySort(undefined, b)
    expect(noDefinedA).toBe(0)
  })

  it('should return 0 on undefined on b', () => {
    const noDefinedB = severitySort(a, undefined)
    expect(noDefinedB).toBe(0)
  })

  it('should return 0 on undefined on both', () => {
    const noDefinedB = severitySort(undefined, undefined)
    expect(noDefinedB).toBe(0)
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
