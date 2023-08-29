import { defineMessage } from 'react-intl'

import { configChanges } from '../__tests__/fixtures'

import { MappingType, json2keymap, filterKPIData } from './util'


describe('json2keymap', () => {
  it('should apply filter and build mapping with keys', () => {
    const simpleData = [
      { text: 'NA', value: 'value1' },
      { text: 'TBD', value: 'value2' },
      { text: 'AP', value: 'value3' },
      { text: defineMessage({ defaultMessage: 'AP' }), value: 'value4' },
      { text: '', value: 'value5' }
    ] as MappingType[]
    expect(json2keymap(['value'], 'text', ['TBD', 'NA'])(simpleData).toJS())
      .toEqual({
        value3: 'AP',
        value4: defineMessage({ defaultMessage: 'AP' }),
        value5: ''
      })

    const simpleData2 = [
      { enumType: '', value: 'value1' },
      { enumType: 'AP', value: 'value2' }
    ] as MappingType[]
    expect(json2keymap(['value'], 'enumType', [''])(simpleData2).toJS())
      .toEqual({ value2: 'AP' })

    const complexData = [
      { enumType: '', text: 'TBD', value: 'value1' },
      { enumType: 'AP', text: 'text1', value: 'value2' },
      { enumType: 'AP', text: 'text2', value: 'value3' },
      { enumType: 'AP', text: defineMessage({ defaultMessage: 'text3' }), value: 'value4' },
      { enumType: 'AP', text: '', value: 'value5' }
    ] as MappingType[]
    expect(json2keymap(['enumType', 'value'], 'text', ['TBD'])(complexData).toJS())
      .toEqual({
        'AP-value2': 'text1',
        'AP-value3': 'text2',
        'AP-value4': defineMessage({ defaultMessage: 'text3' }),
        'AP-value5': ''
      })
  })
})

describe('filterKPIData', () => {
  it('should return correct data', () => {
    expect(filterKPIData(configChanges, []).length).toEqual(configChanges.length)
    expect(filterKPIData(configChanges, ['clientThroughput']).length).toEqual(3)
  })
})
