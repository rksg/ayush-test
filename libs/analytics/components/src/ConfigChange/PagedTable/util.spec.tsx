import { defineMessage } from 'react-intl'

import { MappingType, getConfiguration, getEntityValue, json2keymap } from './util'

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

describe('getEntityValue', () => {
  it('should return a mapped value if present in enumTextMap', () => {
    const type = 'ap'
    const key = 'initialState.ccmAp.ipv4_settings.method'
    const value = 'KEEP_AP_SETTINGS'
    expect(getEntityValue(type, key, value)).toEqual({
      defaultMessage: [{ type: 0, value: 'AP settings' }],
      id: 'JKWlzi'
    })
  })

  it('should return the input value if no mapping is found', () => {
    const type = 'wlan'
    const key = 'test-key'
    const value = 'test-value'
    expect(getEntityValue(type, key, value)).toEqual(value)
  })
})

describe('getConfiguration', () => {
  it('should return a mapped configuration if present in jsonMapping', () => {
    const type = 'wlan'
    const key = 'initialState.CcmWlan.multi_link_operation.mlo_enabled'
    expect(getConfiguration(type, key)).toEqual({
      id: 'i/1Vf/',
      defaultMessage: [{ type: 0, value: 'Multi Link Operation' }]
    })
  })

  it('should return the key itself if no mapping is found', () => {
    const type = 'wlan'
    const key = 'test-key'
    expect(getConfiguration(type, key)).toEqual(key)
  })
})
