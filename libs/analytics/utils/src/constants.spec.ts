import moment from 'moment-timezone'

import { ranges } from './constants'

describe('ranges', () => {
  beforeEach(() => {
    moment.tz.setDefault('Asia/Singapore')
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })

  it('should return defaultRange when no subRange', () => {
    const result = ranges()
    expect(Object.entries(result).reduce((agg, [key, values]) => {
      agg[key as keyof typeof result] = values.map((t) => t.toISOString())
      return agg
    }, {} as unknown as Record<string, string[]>)).toStrictEqual({
      'Last 1 Hour': ['2021-12-31T23:00:00.000Z', '2022-01-01T00:00:00.000Z'],
      'Last 24 Hours': ['2021-12-31T00:00:00.000Z', '2022-01-01T00:00:00.000Z'],
      'Last 7 Days': ['2021-12-25T00:00:00.000Z', '2022-01-01T00:00:00.000Z'],
      'Last Month': ['2021-12-01T00:00:00.000Z', '2022-01-01T00:00:00.000Z'],
      'Today': ['2021-12-31T16:00:00.000Z', '2022-01-01T00:00:00.000Z']
    })
  })

  it('should return defaultRange when having subRange', () => {
    const result = ranges(['Today'])
    expect(Object.entries(result).reduce((agg, [key, values]) => {
      agg[key as keyof typeof result] = values.map((t) => t.toISOString())
      return agg
    }, {} as unknown as Record<string, string[]>)).toStrictEqual({
      Today: ['2021-12-31T16:00:00.000Z', '2022-01-01T00:00:00.000Z']
    })
  })
})

describe('dataApiURL', ()=>{
  const OLD_ENV = process.env
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })
  afterEach(()=>{
    process.env = OLD_ENV
  })
  it('should return correct url', ()=>{
    expect(require('./constants').dataApiURL)
      .toEqual(
        'http://localhost:5002/graphql/analytics/api/a4rc/api/rsa-data-api/graphql/analytics')
  })
  it('should return correct url for production', ()=>{
    process.env['NODE_ENV'] = 'production'
    expect(require('./constants').dataApiURL)
      .toEqual(
        'https://devalto.ruckuswireless.com/api/a4rc/api/rsa-data-api/graphql/analytics')
  })
})