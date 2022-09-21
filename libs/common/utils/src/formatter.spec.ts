import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { renderHook } from '@acx-ui/test-utils'

import { formatter } from './formatter'

function testFormat (
  format: string,
  values: Record<string | number | symbol, string>,
  tz?: string
) {
  for (const [key, value] of Object.entries(values)) {
    expect(formatter(format)(parseFloat(key), tz)).toBe(value)
  }
}
describe('formatter', () => {
  it('returns null if format is not supported', () => {
    expect(formatter('something')(1)).toBe(null)
  })
  it('Should take care of null values correctly', () => {
    expect(formatter('decibelFormat')(null)).toBe(null)
  })
  it('decibelFormat', () => testFormat('decibelFormat', {
    '7.131': '7 dB',
    '20': '20 dB',
    '-77': '-77 dB',
    '-105.011': '-105 dB'
  }))
  it('decibelMilliWattsFormat', () => testFormat('decibelMilliWattsFormat', {
    '-77': '-77 dBm',
    '-105.011': '-105 dBm'
  }))
  it('milliWattsFormat', () => testFormat('milliWattsFormat', {
    1000: '1 W',
    1000000: '1 kW'
  }))
  it('bytesFormat', () => testFormat('bytesFormat', {
    7.131: '7.13 B',
    123456: '121 KB',
    1000000000: '954 MB',
    26784000000: '24.9 GB',
    12345: '12.1 KB',
    123456789: '118 MB',
    123000000000: '115 GB',
    123000000000000: '112 TB',
    123000000000000000: '109 PB',
    123000000000000000000: '107 EB',
    123000000000000000000000: '104 ZB',
    123000000000000000000000000: '102 YB',
    123000000000000000000000000000: '102000 YB',
    1025: '1 KB',
    1024: '1 KB',
    1023: '1020 B'
  }))
  it('networkSpeedFormat', () => testFormat('networkSpeedFormat', {
    7.131: '7.13 Kbps',
    123456: '121 Mbps',
    1000000000: '954 Gbps',
    26784000000: '24.9 Tbps',
    12345: '12.1 Mbps',
    123456789: '118 Gbps',
    123000000000: '115 Tbps',
    123000000000000: '112 Pbps',
    123000000000000000: '109 Ebps',
    123000000000000000000: '107 Zbps',
    1025: '1 Mbps',
    1024: '1 Mbps',
    1023: '1020 Kbps'
  }))
  it('radioFormat', () => testFormat('radioFormat', {
    2.4: '2.4 GHz',
    5: '5 GHz'
  }))
  it('floatFormat', () => testFormat('floatFormat', {
    0.05: '0.05',
    0.0600: '0.06',
    0.0504: '0.05',
    0.0506: '0.051',
    0.05004: '0.05',
    0.05006: '0.05'
  }))
  it('enabledFormat', () => {
    expect(formatter('enabledFormat')(true)).toEqual('Enabled')
    expect(formatter('enabledFormat')(false)).toEqual('Disabled')
  })
  it('ratioFormat', () => {
    expect(formatter('ratioFormat')([1, 2])).toBe('1 / 2')
    expect(formatter('ratioFormat')([2, 2])).toBe('2 / 2')
  })
  describe('txFormat', () => {
    it('should return same value if not in txpowerMapping', () => {
      expect(formatter('txFormat')('MIN')).toBe('MIN')
    })
    it('should format values as per mapping', () => {
      expect(formatter('txFormat')('_FULL')).toBe('Full')
      expect(formatter('txFormat')('_1DB')).toBe('-1dB')
      expect(formatter('txFormat')('_6DB')).toBe('-6dB(1/4)')
      expect(formatter('txFormat')('_MIN')).toBe('Min')
    })
  })
  describe('calendarFormat', () => {
    beforeEach(() => {
      jest
        .spyOn(global.Date, 'now')
        .mockImplementationOnce(() =>
          new Date('2022-08-05T13:51:00.000Z').valueOf()
        )
    })
    it('should format date to "[Today,] HH:mm"', () => {
      const result = formatter('calendarFormat')(1659687682000)
      expect(result).toBe('Today, 08:21')
    })
    it('should format date to "[Yesterday,] HH:mm"', () => {
      const result = formatter('calendarFormat')(1659608482000)
      expect(result).toBe('Yesterday, 10:21')
    })
    it('should format date to "[Tomorrow,] HH:mm"', () => {
      const result = formatter('calendarFormat')(1659774082000)
      expect(result).toBe('Tomorrow, 08:21')
    })
    it('should format date to "[Last] dddd[,] HH:mm"', () => {
      const result = formatter('calendarFormat')(1659255682000)
      expect(result).toBe('Last Sunday, 08:21')
    })
    it('should format date to "dddd[,] HH:mm"', () => {
      const result = formatter('calendarFormat')(1659860482000)
      expect(result).toBe('Sunday, 08:21')
    })
    it('should format date to "MMM DD[,] HH:mm"', () => {
      const result = formatter('calendarFormat')(1654590082000)
      expect(result).toBe('Jun 07 08:21')
    })
  })
  describe('durationFormat', () => {
    it('format durations', () =>
      testFormat('durationFormat', {
        0: '0',
        2: '2ms',
        2.54: '2.54ms',
        2.54999: '2.55ms',
        41: '41ms',
        123: '123ms',
        1000: '1s',
        1234: '1.23s',
        1600: '1.6s',
        7000: '7s',
        57111: '57.1s',
        [60000 * 21]: '21m',
        [60000 * 61]: '1h 1m',
        [3600000 * 1]: '1h',
        [3600000 * 23]: '23h',
        [3600000 * 20 + 1000 * 37]: '20h', // seconds are not significant here
        [3600000 * 20 + 60000 * 37]: '20h 37m',
        86400000: '1d',
        [86400000 * 8]: '8d',
        [86400000 + 3600000 * 3 + 60000 * 4]: '1d 3h', // only 2 significant
        2678400000: '1mo',
        [2678400000 + 86400000 * 4]: '1mo 4d',
        31622400000: '1y',
        [31622400000 + 2678400000 * 8 + 86400000 * 4]: '1y 8mo',
        [31622400000 + 2678400000 * 13]: '2y 1mo'
      }))
  })
  describe('dateTimeFormats', () => {
    it('Should format a timestamp to MMM DD YYYY', () => {
      expect(formatter('dateFormat')(1456885800000))
        .toBe(moment(1456885800000).format('MMM DD YYYY'))
    })
    it('Should format a timestamp to HH:mm', () => {
      expect(formatter('timeFormat')(1456885800000))
        .toBe(moment(1456885800000).format('HH:mm'))
    })
    it('Should format a timestamp to HH:mm:ss', () => {
      expect(formatter('secondFormat')(1456885800000))
        .toBe(moment(1456885800000).format('HH:mm:ss'))
    })
    it('Should format a timestamp to MMM DD YYYY HH:mm', () => {
      expect(formatter('dateTimeFormat')(1456885800000))
        .toBe(moment(1456885800000).format('MMM DD YYYY HH:mm'))
    })
    it('Should format a timestamp to MMM DD YYYY HH:mm:ss', () => {
      expect(formatter('dateTimeFormatWithSeconds')(1456885800000))
        .toBe(moment(1456885800000).format('MMM DD YYYY HH:mm:ss'))
    })
    it('Should format a timestamp to MMM DD', () => {
      expect(formatter('monthDateFormat')(1456885800000))
        .toBe(moment(1456885800000).format('MMM DD'))
    })
    it('Should format a timestamp to HH', () => {
      expect(formatter('hourFormat')(1456885800000))
        .toBe(moment(1456885800000).format('HH'))
    })
    it('With tz', () => {
      expect(formatter('dateTimeFormatWithSeconds')(1456885800000, 'America/Los_Angeles'))
        .toBe(moment(1456885800000).tz('America/Los_Angeles')
          .format('MMM DD YYYY HH:mm:ss Z').replace('+00:00', 'UTC'))
    })
  })
  describe('intlFormats', () => {
    type TestSet = [number | undefined, string | null]
    const testFormat = (
      format: Parameters<typeof formatter>[0],
      sets: TestSet[]
    ) => sets.forEach(([value, expected]) => {
      it(`convert ${value} to ${expected}`, () => {
        const result = formatter(format)(value)
        expect(result).toEqual(expected)
      })
    })
    describe('countFormat', () => {
      testFormat('countFormat', [
        [1,'1'],
        [12,'12'],
        [123,'123'],
        [1234,'1.23K'],
        [12345,'12.3K'],
        [12344,'12.3K'],
        [123456,'123K'],
        [1234567,'1.23M'],
        [12345678,'12.3M'],
        [123000000000,'123B'],
        [123000000000000,'123T'],
        [123000000000000000,'123,000T'],
        [123.456789,'123'],
        [1.00,'1'],
        [1500,'1.5K'],
        [2000,'2K']
      ])
    })
    describe('percentFormat', () => {
      testFormat('percentFormat', [
        [0.12, '12%'],
        [0.123, '12.3%'],
        [0.1235, '12.35%'],
        [0.12359, '12.36%'],
        [0.12999, '13%']
      ])
    })
    describe('percentFormatRound', () => {
      testFormat('percentFormatRound', [
        [0.12, '12%'],
        [0.123, '12%']
      ])
    })
  })
})

