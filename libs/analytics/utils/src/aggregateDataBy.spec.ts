import { aggregateDataBy, sortPreference } from './aggregateDataBy'

describe('aggregateDataBy', () => {
  it('Should aggregate normally', () => {
    const clients = [
      { mac: '12:34:56:78:90', ipAddress: 'localhost' },
      { mac: '12:34:56:78:90', ipAddress: '127.0.0.1' }
    ]

    expect(aggregateDataBy('mac')(clients)).toEqual([{
      mac: ['12:34:56:78:90'],
      ipAddress: ['localhost', '127.0.0.1']
    }])
  })
  it('Should handle funtional aggregator', () => {
    const clients = [
      { mac: '12:34:56:78:90', ipAddress: 'localhost' },
      { mac: '12:34:56:78:90', ipAddress: '127.0.0.1' }
    ]

    expect(aggregateDataBy(()=>'mac')(clients)).toEqual([{
      mac: ['12:34:56:78:90'],
      ipAddress: ['localhost', '127.0.0.1']
    }])
  })
  it('Should remove duplicates while aggregating', () => {
    const clients = [
      { mac: '12:34:56:78:90', ipAddress: 'localhost' },
      { mac: '12:34:56:78:90', ipAddress: '127.0.0.1' },
      { mac: '12:34:56:78:90', ipAddress: 'localhost' }
    ]

    expect(aggregateDataBy('mac')(clients)).toEqual([{
      mac: ['12:34:56:78:90'],
      ipAddress: ['localhost', '127.0.0.1']
    }])
  })
})

describe('sortPreference', () => {
  it('should place "0.0.0.0", "0" and "Unknown" last and not alter sequence for other values',
    () => {
      expect(sortPreference({
        key: '1',
        value: ['Unknown', '3.3.3.3', '2.2.2.2', '1.1.1.1']
      })).toEqual({
        key: '1',
        value: ['3.3.3.3', '2.2.2.2', '1.1.1.1', 'Unknown']
      })
      expect(sortPreference({
        key: '1',
        value: ['3.3.3.3', '0.0.0.0', '2.2.2.2', '1.1.1.1']
      })).toEqual({
        key: '1',
        value: ['3.3.3.3', '2.2.2.2', '1.1.1.1', '0.0.0.0']
      })
      expect(sortPreference({
        key: '1',
        value: ['3.3.3.3', '2.2.2.2', '1.1.1.1', '0']
      })).toEqual({
        key: '1',
        value: ['3.3.3.3', '2.2.2.2', '1.1.1.1', '0']
      })
      expect(sortPreference({
        key: '1',
        value: ['3.3.3.3', 'Unknown', '2.2.2.2', '0', '1.1.1.1', '0.0.0.0']
      })).toEqual({
        key: '1',
        value: ['3.3.3.3', '2.2.2.2', '1.1.1.1', '0.0.0.0', '0', 'Unknown']
      })
      expect(sortPreference({
        key: '1',
        value: ['0.0.0.0', '0', 'Unknown']
      })).toEqual({
        key: '1',
        value: ['0.0.0.0', '0', 'Unknown']
      })
    })

  it('should sort preference only when value is array', () => {
    expect(sortPreference({
      key: '1',
      value: ['Unknown', '0', '0.0.0.0', '1.1.1.1']
    })).toEqual({
      key: '1',
      value: ['1.1.1.1', '0.0.0.0', '0', 'Unknown']
    })
    expect(sortPreference({
      key: '1',
      value: 'not-array-data'
    })).toEqual({
      key: '1',
      value: 'not-array-data'
    })
  })
})
