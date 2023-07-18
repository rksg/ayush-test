import { getUserProfile, setUserProfile, UserProfile } from '@acx-ui/user'

import {
  formatter,
  formats,
  convertEpochToRelativeTime,
  DateFormatEnum
} from './formatter'

function testFormat (
  format: keyof typeof formats,
  values: Record<string | number | symbol, string>,
  tz?: string
) {
  for (const [key, value] of Object.entries(values)) {
    expect(formatter(format)(parseFloat(key), tz)).toBe(value)
  }
}
describe('formatter', () => {
  it("returns '--' if format is not supported", () => {
    expect(formatter('something' as keyof typeof formats)(1)).toBe('--')
  })
  it("Should take care of '--' values correctly", () => {
    expect(formatter('decibelFormat')(null)).toBe('--')
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
    1: '1 B',
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
    1023: '0.999 KB',
    1097901000000: '0.999 TB',
    1092532300000: '0.994 TB',
    1099082100000: '1 TB'
  }))
  it('networkSpeedFormat', () => testFormat('networkSpeedFormat', {
    7.131: '7.13 Kbps',
    123456: '123 Mbps',
    1000000000: '1 Tbps',
    26784000000: '26.8 Tbps',
    12345: '12.3 Mbps',
    123456789: '123 Gbps',
    123000000000: '123 Tbps',
    123000000000000: '123 Pbps',
    123000000000000000: '123 Ebps',
    123000000000000000000: '123 Zbps',
    1025: '1.02 Mbps',
    1024: '1.02 Mbps',
    1023: '1.02 Mbps'
  }))
  it('radioFormat', () => testFormat('radioFormat', {
    2.4: '2.4 GHz',
    5: '5 GHz'
  }))

  it('hertzFormat', () => testFormat('hertzFormat', {
    0: '0 Hz',
    1: '1 Hz',
    5: '5 Hz',
    10: '1 daHz',
    100: '1 hHz',
    200: '2 hHz',
    1000: '1 kHz',
    3000: '3 kHz',
    12000000: '12 MHz',
    6000000000: '6 GHz',
    7000000000000: '7 THz'
  }))

  it('floatFormat', () => testFormat('floatFormat', {
    0.05: '0.05',
    0.0600: '0.06',
    0.0504: '0.05',
    0.0506: '0.051',
    0.05004: '0.05',
    0.05006: '0.05'
  }))
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
  it('numberWithCommas', () => testFormat('numberWithCommas', {
    123: '123',
    91890620: '91,890,620'
  }))
  it('fpsFormat', () => testFormat('fpsFormat', {
    123: '123 fps',
    91890620: '91890620 fps'
  }))
  it('percent', () => testFormat('percent', {
    123: '123 %',
    0.918: '0.918 %'
  }))
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
    const testFormat = (
      format: 'durationFormat',
      values: Record<string | number | symbol, string>,
      tz?: string
    ) => Object.entries(values).forEach(([value, expected]) => {
      it(`convert ${value} to ${expected}`, () => {
        const result = formatter(format)(parseFloat(value), tz)
        expect(result).toEqual(expected)
      })
    })
    testFormat('durationFormat', {
      0: '0',
      2: '2 ms',
      2.54: '2.54 ms',
      2.54999: '2.55 ms',
      41: '41 ms',
      123: '123 ms',
      1000: '1 s',
      1234: '1.23 s',
      1600: '1.6 s',
      7000: '7 s',
      57111: '57.1 s',
      [60000 * 21]: '21 m',
      [60000 * 61]: '1 h 1 m',
      [3600000 * 1]: '1 h',
      [3600000 * 23]: '23 h',
      [3600000 * 20 + 1000 * 37]: '20 h', // seconds are not significant here
      [3600000 * 20 + 60000 * 37]: '20 h 37 m',
      86400000: '1 d',
      [86400000 * 8]: '8 d',
      [86400000 + 3600000 * 3 + 60000 * 4]: '1 d 3 h', // only 2 significant
      2678400000: '1 mo',
      [2678400000 + 86400000 * 4]: '1 mo 4 d',
      31622400000: '1 y',
      [31622400000 + 2678400000 * 8 + 86400000 * 4]: '1 y 8 mo',
      [31622400000 + 2678400000 * 13]: '2 y 1 mo',
      [0 +
        31622400000 + // 2 yr
        2678400000 * 13 + // 1 mo
        86400000 * 4 + // 4 d
        3600000 * 1 + // 1 h
        60000 * 21 + // 21 m
        30000 + // 30s
        500 // 500 ms
      ]: '2 y 1 mo'
    })
  })
  describe('longDurationFormat', () => {
    const testFormat = (
      format: 'longDurationFormat',
      values: Record<string | number | symbol, string>,
      tz?: string
    ) => Object.entries(values).forEach(([value, expected]) => {
      it(`convert ${value} to ${expected}`, () => {
        const result = formatter(format)(parseFloat(value), tz)
        expect(result).toEqual(expected)
      })
    })
    testFormat('longDurationFormat', {
      0: '0',
      1: '1 millisecond',
      2: '2 milliseconds',
      2.54: '2.54 milliseconds',
      2.54999: '2.55 milliseconds',
      41: '41 milliseconds',
      123: '123 milliseconds',
      1000: '1 second',
      1234: '1.23 seconds',
      1600: '1.6 seconds',
      7000: '7 seconds',
      57111: '57.1 seconds',
      [60000 * 1]: '1 minute',
      [60000 * 21]: '21 minutes',
      [60000 * 61]: '1 hour 1 minute',
      [3600000 * 1]: '1 hour',
      [3600000 * 23]: '23 hours',
      [3600000 * 20 + 1000 * 37]: '20 hours', // seconds are not significant here
      [3600000 * 20 + 60000 * 37]: '20 hours 37 minutes',
      86400000: '1 day',
      [86400000 * 8]: '8 days',
      [86400000 + 3600000 * 3 + 60000 * 4]: '1 day 3 hours', // only 2 significant
      2678400000: '1 month',
      [86400000 * 60 + 86400000 * 4]: '2 months 3 days', // weird behavior of moment
      31622400000: '1 year',
      [31622400000 + 2678400000 * 8 + 86400000 * 4]: '1 year 8 months',
      [31622400000 + 2678400000 * 13]: '2 years 1 month',
      [0 +
        31622400000 + // 2 yr
        2678400000 * 13 + // 1 mo
        86400000 * 4 + // 4 d
        3600000 * 1 + // 1 h
        60000 * 21 + // 21 m
        30000 + // 30s
        500 // 500 ms
      ]: '2 years 1 month'
    })
  })
  describe('dateTimeFormats', () => {
    beforeEach(() => {
      setUserProfile({ profile: {} as UserProfile, allowedOperations: [] })
    })

    it('Should format a timestamp to default format', () => {
      expect(formatter(DateFormatEnum.DateFormat)(1456885800000))
        .toBe('Mar 02 2016')
    })
    it('Should format a timestamp to default format with HH:mm', () => {
      expect(formatter(DateFormatEnum.DateTimeFormat)(1456885800000))
        .toBe('Mar 02 2016 02:30')
    })
    it('Should format a timestamp to default format with HH:mm:ss', () => {
      expect(formatter(DateFormatEnum.DateTimeFormatWithSeconds)(1456885800000))
        .toBe('Mar 02 2016 02:30:00')
    })
    it('Should format a timestamp to default format having HH:mm without date', () => {
      expect(formatter(DateFormatEnum.OnlyTime)(1456885800000))
        .toBe('02:30')
    })
    it('Should format based on user profile setting', () => {
      const userProfile = getUserProfile()
      setUserProfile({ ...userProfile, profile: {
        ...userProfile.profile, dateFormat: 'dd/mm/yyyy' } })
      expect(formatter(DateFormatEnum.DateFormat)(1456885800000))
        .toBe('02/03/2016')
    })
    it('With tz', () => {
      const userProfile = getUserProfile()
      setUserProfile({ ...userProfile, profile: {
        ...userProfile.profile, dateFormat: 'mm/dd/yyyy' } })
      expect(formatter(DateFormatEnum.DateTimeFormatWithTimezone)(
        1456885800000, 'America/Los_Angeles'))
        .toBe('03/01/2016 - 18:30 PST -08:00')
    })
  })
  describe('intlFormats', () => {
    type TestSet = [number | undefined | boolean, string | null]
    const testFormat = (
      format: Parameters<typeof formatter>[0],
      sets: TestSet[]
    ) => sets.forEach(([value, expected]) => {
      it(`convert ${value} to ${expected}`, () => {
        const result = formatter(format)(value)
        expect(result).toEqual(expected)
      })
    })
    describe('enabledFormat', () => {
      testFormat('enabledFormat', [
        [true,'Enabled'],
        [false,'Disabled']
      ])
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
    describe('convertEpochToRelativeTime', () => {
      it('Should return relative time', () => {
        expect(typeof formatter('longDurationFormat')(convertEpochToRelativeTime(1669693917)))
          .toBe('string')
      })
    })
  })

  describe('crrmFormat', () => {
    it('should return correct value for string', () => {
      const test_auto = formatter('crrmFormat')('Auto')
      expect(test_auto)
        .toMatch('AI-Driven Cloud RRM for channel planning and channel bandwidth selection')
    })

    it('should return correct value for crrm object', () => {
      expect(formatter('crrmFormat')([{
        radio: '2.4',
        channelWidth: '_AUTO',
        channelMode: 'BACKGROUND_SCANNING'
      }])).toMatch('Background scanning and Auto for 2.4 GHz with static AP Power')
      expect(formatter('crrmFormat')([{
        radio: '5.0',
        channelWidth: '_80MHZ',
        channelMode: 'CHANNEL_FLY',
        autoCellSizing: true
      }])).toMatch('ChannelFly and 80 MHz for 5.0 GHz with Auto Cell Sizing on')
    })
    it('returns txPower texts', () => {
      expect(formatter('crrmFormat')({})).toMatch('AI-Driven Cloud RRM for channel planning and channel bandwidth selection with no change in AP transmit power') // eslint-disable-line max-len
      expect(formatter('crrmFormat')({ txPowerAPCount: 1 })).toMatch('AI-Driven Cloud RRM for channel planning and channel bandwidth selection with static AP transmit power and lower AP transmit power in 1 AP') // eslint-disable-line max-len
      expect(formatter('crrmFormat')({ txPowerAPCount: 2 })).toMatch('AI-Driven Cloud RRM for channel planning and channel bandwidth selection with static AP transmit power and lower AP transmit power in 2 APs') // eslint-disable-line max-len
    })
  })

  describe('noFormat', () => {
    it('should return number as string', () => {
      const test_number = formatter('noFormat')(3)
      expect(test_number).toMatch('3')
    })

    it('should return function as string', () => {
      const test_number = formatter('noFormat')(() => {})
      expect(test_number).toMatch('() => {}')
    })

    it('should return correct null as string', () => {
      const test_number = formatter('noFormat')(null)
      expect(test_number).toMatch('--')
    })

    it('should return correct undefined as string', () => {
      const test_number = formatter('noFormat')(undefined)
      expect(test_number).toMatch('undefined')
    })

    it('should return correct object as string', () => {
      const test_number = formatter('noFormat')({})
      expect(test_number).toMatch('Object')
    })
  })
})
