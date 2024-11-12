import { transformToCityListOptions } from './cityList'

describe('cityList transform', () => {
  it('should create option with correct attributes and name', () => {

    const data = [
      { name: 'sunnyvale, california' },
      { name: 'sunnyvale' },
      { name: 'west district, taichung city' }
    ]
    const options = transformToCityListOptions(data)

    expect(options).toHaveLength(3)
    // @ts-ignore
    expect(options[0]).toEqual({ key: 'sunnyvale, california', value: 'Sunnyvale, California' })
  })

  it('should create option with no data', () => {

    const data = undefined
    const options = transformToCityListOptions(data)

    expect(options).toEqual(true)
  })
})
